[CmdletBinding()]
param(
    [string]$Root      = (Get-Location).Path,
    [int]   $MaxFileKB = 500,
    [switch]$DryRun,
    [switch]$NoClean,
    [switch]$OpenReport
)

$ErrorActionPreference = 'Continue'
$MaxFileBytes = $MaxFileKB * 1024

function W-H1   { param($m) Write-Host ""; Write-Host ("=" * 64) -ForegroundColor Cyan; Write-Host ("  " + $m) -ForegroundColor Cyan; Write-Host ("=" * 64) -ForegroundColor Cyan }
function W-Head { param($m) Write-Host ""; Write-Host ("-- " + $m + " " + ("-" * [math]::Max(1, 60 - $m.Length))) -ForegroundColor Magenta }
function W-Info { param($m) Write-Host ("   " + $m) -ForegroundColor DarkGray }
function W-Ok   { param($m) Write-Host ("   [OK] " + $m) -ForegroundColor Green }
function W-Warn { param($m) Write-Host ("   [!!] " + $m) -ForegroundColor Yellow }
function W-Err  { param($m) Write-Host ("   [XX] " + $m) -ForegroundColor Red }
function W-Del  { param($m) Write-Host ("   [DEL] " + $m) -ForegroundColor Red }
function W-Save { param($m) Write-Host ("   [SAVE] " + $m) -ForegroundColor Green }

$issues  = New-Object System.Collections.ArrayList
$actions = New-Object System.Collections.ArrayList
function Add-Issue  { param($sev, $msg) [void]$issues.Add([PSCustomObject]@{ Severity = $sev; Message = $msg }) }
function Add-Action { param($msg) [void]$actions.Add($msg) }

# ── Robust file reader (handles UTF-8, UTF-16, ANSI, BOM) ──
function Read-TextSafe {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    try {
        $bytes = [System.IO.File]::ReadAllBytes($Path)
        if ($bytes.Length -eq 0) { return "" }

        # Detect BOM
        $enc = $null
        $offset = 0
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $enc = New-Object System.Text.UTF8Encoding $false
            $offset = 3
        } elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            $enc = [System.Text.Encoding]::Unicode
            $offset = 2
        } elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
            $enc = [System.Text.Encoding]::BigEndianUnicode
            $offset = 2
        }

        if ($enc) {
            return $enc.GetString($bytes, $offset, $bytes.Length - $offset)
        }

        # No BOM -- try UTF-8 strict, fallback to Windows-1252 (ANSI)
        try {
            $strict = New-Object System.Text.UTF8Encoding($false, $true)
            return $strict.GetString($bytes)
        } catch {
            return [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
        }
    } catch {
        return $null
    }
}

W-H1 "DNG Solutions  |  Master Fix & Audit v2"
W-Info ("Root     : " + $Root)
W-Info ("DryRun   : " + $DryRun)
W-Info ("NoClean  : " + $NoClean)
W-Info ("Time     : " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))

if (-not (Test-Path (Join-Path $Root 'package.json'))) {
    W-Err "package.json not found. Run from project root."
    exit 1
}

# ═══════ PHASE A ═══════
W-H1 "PHASE A -- Secrets & credentials cleanup"
$secretFiles = @('firebase-key.json','admin-credentials.txt','.env.backup_*','*.credentials','*credentials*.txt','serviceAccountKey.json','service-account.json')
$foundSecrets = New-Object System.Collections.ArrayList
foreach ($pattern in $secretFiles) {
    $matches = Get-ChildItem -Path $Root -Filter $pattern -File -Force -ErrorAction SilentlyContinue
    foreach ($m in $matches) {
        $rel = $m.FullName.Substring($Root.Length).TrimStart('\','/')
        [void]$foundSecrets.Add([PSCustomObject]@{ Path = $m.FullName; Rel = $rel; Size = $m.Length })
    }
}
if ($foundSecrets.Count -eq 0) { W-Ok "No exposed secret files found" }
else {
    foreach ($s in $foundSecrets) {
        if ($DryRun) { W-Warn ("[DRY] Would delete: " + $s.Rel) }
        else {
            try { Remove-Item -LiteralPath $s.Path -Force; W-Del ("Deleted: " + $s.Rel); Add-Action ("Removed secret: " + $s.Rel) }
            catch { W-Err ("Failed: " + $s.Rel) }
        }
        Add-Issue 'CRITICAL' ("Secret file: " + $s.Rel)
    }
}

W-Head "Scanning source files for hardcoded secrets"
$sourcePatterns = @(
    @{ Name = 'Anthropic key';   Re = 'sk-ant-api[0-9]{2}-[a-zA-Z0-9_\-]{20,}' },
    @{ Name = 'OpenAI key';      Re = 'sk-[a-zA-Z0-9]{20,}' },
    @{ Name = 'Google API key';  Re = 'AIza[0-9A-Za-z\-_]{30,}' },
    @{ Name = 'Private key PEM'; Re = '-----BEGIN [A-Z ]*PRIVATE KEY-----' },
    @{ Name = 'Stripe live key'; Re = 'sk_live_[a-zA-Z0-9]{20,}' },
    @{ Name = 'AWS access key';  Re = 'AKIA[0-9A-Z]{16}' }
)
$srcFiles = Get-ChildItem -Path $Root -Recurse -File -Include '*.js','*.jsx','*.ts','*.tsx','*.mjs','*.cjs' -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\build\\|\\.git\\|\\.next\\' }
$hardcoded = New-Object System.Collections.ArrayList
foreach ($f in $srcFiles) {
    if ($f.Length -gt 1048576) { continue }
    $txt = Read-TextSafe -Path $f.FullName
    if (-not $txt) { continue }
    foreach ($p in $sourcePatterns) {
        if ($txt -match $p.Re) {
            $rel = $f.FullName.Substring($Root.Length).TrimStart('\','/')
            [void]$hardcoded.Add([PSCustomObject]@{ File = $rel; Type = $p.Name })
            Add-Issue 'CRITICAL' ("Hardcoded secret (" + $p.Name + ") in: " + $rel)
        }
    }
}
if ($hardcoded.Count -eq 0) { W-Ok "No hardcoded secrets detected" }
else { foreach ($h in $hardcoded) { W-Err ($h.File + "  ::  " + $h.Type) } }

# ═══════ PHASE B ═══════
W-H1 "PHASE B -- .gitignore management"
$gitignorePath = Join-Path $Root '.gitignore'
$requiredRules = @(
    '# Dependencies','node_modules/','',
    '# Build output','dist/','build/','.next/','.vercel/','.vite/','',
    '# Environment & secrets (NEVER commit)','.env','.env.local','.env.*.local','.env.production','.env.development','.env.backup_*','.env.old','firebase-key.json','serviceAccountKey.json','service-account.json','*credentials*.txt','*.credentials','admin-credentials.txt','',
    '# Backups & temp','*.backup_*','*.bak','*.bak.*','_fixbak-*','backups/','*.tmp','*.swp','*.swo','',
    '# Logs','*.log','firebase-debug.log','firestore-debug.log','npm-debug.log*','yarn-debug.log*','yarn-error.log*','',
    '# OS / IDE','.DS_Store','Thumbs.db','desktop.ini','.vscode/','.idea/','',
    '# Scanner output','project-report.md','project-code-dump.txt','project-tree.txt','audit-report-*.txt','DIAGNOSTIC_REPORT_*.txt'
)
if (-not (Test-Path $gitignorePath)) {
    if ($DryRun) { W-Warn "[DRY] Would create .gitignore" }
    else { Set-Content -Path $gitignorePath -Value ($requiredRules -join "`n") -Encoding UTF8; W-Save "Created .gitignore"; Add-Action "Created .gitignore" }
} else {
    $existing = Read-TextSafe -Path $gitignorePath
    if (-not $existing) { $existing = "" }
    $missing = New-Object System.Collections.ArrayList
    foreach ($rule in $requiredRules) {
        $r = $rule.Trim()
        if ($r -eq '' -or $r.StartsWith('#')) { continue }
        $escaped = [regex]::Escape($r)
        if ($existing -notmatch "(?m)^\s*$escaped\s*$") { [void]$missing.Add($rule) }
    }
    if ($missing.Count -eq 0) { W-Ok ".gitignore already has all rules" }
    else {
        if ($DryRun) { W-Warn ("[DRY] Would add " + $missing.Count + " rules") }
        else {
            $append = "`n# -- Added by dng-master-fix (" + (Get-Date -Format 'yyyy-MM-dd') + ") --`n" + ($missing -join "`n") + "`n"
            Add-Content -Path $gitignorePath -Value $append -Encoding UTF8
            W-Save ("Added " + $missing.Count + " rules to .gitignore")
            Add-Action ("Updated .gitignore (+" + $missing.Count + ")")
        }
    }
}

# ═══════ PHASE C -- FIXED ═══════
W-H1 "PHASE C -- Backup & junk cleanup"
if ($NoClean) { W-Warn "Skipping cleanup (-NoClean)" }
else {
    $cleanupPatterns = @(
        @{ Pattern = '*.backup_*'; Type = 'file' },
        @{ Pattern = '*.bak.*';    Type = 'file' },
        @{ Pattern = '*.bak';      Type = 'file' },
        @{ Pattern = '*.tmp';      Type = 'file' },
        @{ Pattern = '_fixbak-*';  Type = 'dir'  },
        @{ Pattern = 'backups';    Type = 'dir'  }
    )
    $toDelete = New-Object System.Collections.ArrayList
    $seenPaths = @{}
    foreach ($cp in $cleanupPatterns) {
        if ($cp.Type -eq 'file') {
            $fs = Get-ChildItem -Path $Root -Recurse -Filter $cp.Pattern -File -Force -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\' }
            foreach ($f in $fs) {
                $key = $f.FullName.ToLower()
                if (-not $seenPaths.ContainsKey($key)) {
                    $seenPaths[$key] = $true
                    [void]$toDelete.Add($f)
                }
            }
        } else {
            $ds = Get-ChildItem -Path $Root -Filter $cp.Pattern -Directory -Force -ErrorAction SilentlyContinue
            foreach ($d in $ds) {
                $key = $d.FullName.ToLower()
                if (-not $seenPaths.ContainsKey($key)) {
                    $seenPaths[$key] = $true
                    [void]$toDelete.Add($d)
                }
            }
        }
    }
    if ($toDelete.Count -eq 0) { W-Ok "No backup files to clean" }
    else {
        $totalBytes = ($toDelete | Where-Object { -not $_.PSIsContainer } | Measure-Object Length -Sum).Sum
        W-Info ("Found " + $toDelete.Count + " items, ~" + [math]::Round($totalBytes/1KB,1) + " KB")
        foreach ($t in $toDelete) {
            $rel = $t.FullName.Substring($Root.Length).TrimStart('\','/')
            if ($DryRun) { W-Warn ("[DRY] Would delete: " + $rel) }
            else {
                try {
                    if (Test-Path -LiteralPath $t.FullName) {
                        Remove-Item -LiteralPath $t.FullName -Recurse -Force -ErrorAction Stop
                        W-Del ("Deleted: " + $rel)
                        Add-Action ("Removed: " + $rel)
                    } else {
                        W-Info ("Already gone: " + $rel)
                    }
                } catch {
                    W-Warn ("Skip (locked): " + $rel)
                }
            }
        }
    }
}

# ═══════ PHASE D ═══════
W-H1 "PHASE D -- package.json validation"
try {
    $pkgRaw = Read-TextSafe -Path (Join-Path $Root 'package.json')
    $pkg = $pkgRaw | ConvertFrom-Json
    W-Ok ("Name: " + $pkg.name + "  Version: " + $pkg.version)
    $deps = @{}
    if ($pkg.dependencies)    { $pkg.dependencies.PSObject.Properties    | ForEach-Object { $deps[$_.Name] = $_.Value } }
    if ($pkg.devDependencies) { $pkg.devDependencies.PSObject.Properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
    $neededDeps = @('react','react-dom','react-router-dom','firebase','framer-motion','i18next','react-i18next','@anthropic-ai/sdk','firebase-admin')
    foreach ($d in $neededDeps) {
        if (-not $deps.ContainsKey($d)) { W-Warn ("Missing dep: " + $d); Add-Issue 'WARN' ("Missing dep: " + $d) }
        else { W-Info ("  " + $d + " @ " + $deps[$d]) }
    }
} catch { W-Err ("package.json parse error: " + $_.Exception.Message); Add-Issue 'CRITICAL' "Invalid package.json" }

# ═══════ PHASE E ═══════
W-H1 "PHASE E -- vercel.json validation"
$vercelPath = Join-Path $Root 'vercel.json'
if (Test-Path $vercelPath) {
    try {
        $vercelRaw = Read-TextSafe -Path $vercelPath
        $vercel = $vercelRaw | ConvertFrom-Json
        W-Ok "vercel.json valid JSON"
        if ($vercel.rewrites) { W-Info ("Rewrites: " + $vercel.rewrites.Count) } else { W-Warn "No SPA rewrite"; Add-Issue 'WARN' "vercel.json missing SPA rewrite" }
        $requiredHeaders = @('X-Content-Type-Options','X-Frame-Options','Referrer-Policy')
        $foundHeaders = @()
        if ($vercel.headers) { foreach ($h in $vercel.headers) { if ($h.headers) { foreach ($hdr in $h.headers) { $foundHeaders += $hdr.key } } } }
        foreach ($rh in $requiredHeaders) {
            if ($foundHeaders -notcontains $rh) { W-Warn ("Missing header: " + $rh); Add-Issue 'WARN' ("Missing header: " + $rh) }
            else { W-Info ("  " + $rh + " present") }
        }
    } catch { W-Err ("vercel.json parse error: " + $_.Exception.Message); Add-Issue 'CRITICAL' "Invalid vercel.json" }
} else { W-Err "vercel.json not found"; Add-Issue 'CRITICAL' "Missing vercel.json" }

# ═══════ PHASE F -- FIXED (auto-add freeTrial) ═══════
W-H1 "PHASE F -- Locale files (KA / EN / RU)"
$localeDir = Join-Path $Root 'src/locales'
if (Test-Path $localeDir) {
    $localeFiles = Get-ChildItem $localeDir -Filter '*.json' -File
    $localeData = @{}
    foreach ($lf in $localeFiles) {
        try {
            $txt = Read-TextSafe -Path $lf.FullName
            $obj = $txt | ConvertFrom-Json
            $localeData[$lf.BaseName] = $obj
            $keys = ($obj.PSObject.Properties.Name).Count
            W-Ok ($lf.Name + " -- valid JSON, " + $keys + " keys")
        } catch { W-Err ($lf.Name + " -- INVALID: " + $_.Exception.Message); Add-Issue 'CRITICAL' ("Invalid locale: " + $lf.Name) }
    }

    # Compare keys
    if ($localeData.Count -ge 2) {
        $allLangs = @($localeData.Keys)
        $reference = @($localeData[$allLangs[0]].PSObject.Properties.Name)
        foreach ($lang in $allLangs[1..($allLangs.Count-1)]) {
            $langKeys = @($localeData[$lang].PSObject.Properties.Name)
            $d1 = $reference | Where-Object { $langKeys -notcontains $_ }
            $d2 = $langKeys | Where-Object { $reference -notcontains $_ }
            if ($d1.Count -gt 0 -or $d2.Count -gt 0) {
                W-Warn ($allLangs[0] + " vs " + $lang + " mismatch")
                if ($d1) { W-Info ("  Missing in " + $lang + ": " + ($d1 -join ', ')) }

                # Auto-fix: copy missing keys from reference
                if (-not $DryRun) {
                    foreach ($missingKey in $d1) {
                        $refProp = $localeData[$allLangs[0]].PSObject.Properties[$missingKey]
                        $localeData[$lang] | Add-Member -NotePropertyName $missingKey -NotePropertyValue $refProp.Value -Force
                        Add-Action ("Added '" + $missingKey + "' to " + $lang + ".json (copied from " + $allLangs[0] + ")")
                    }
                    $newJson = $localeData[$lang] | ConvertTo-Json -Depth 100
                    $newJson = [regex]::Replace($newJson, '(?<!\\)\\u([0-9a-fA-F]{4})', { param($m) [string][char][Convert]::ToInt32($m.Groups[1].Value, 16) })
                    $targetPath = Join-Path $localeDir ($lang + ".json")
                    [System.IO.File]::WriteAllText($targetPath, $newJson, (New-Object System.Text.UTF8Encoding $false))
                    W-Save ("Patched " + $lang + ".json -- added " + $d1.Count + " missing keys")
                } else {
                    W-Warn ("[DRY] Would copy " + $d1.Count + " keys from " + $allLangs[0] + " to " + $lang)
                }
                Add-Issue 'WARN' ("Locale mismatch: " + $allLangs[0] + " vs " + $lang)
            } else { W-Info ($allLangs[0] + " vs " + $lang + " -- keys match") }
        }
    }
} else { W-Err "src/locales/ not found"; Add-Issue 'CRITICAL' "Missing src/locales/" }

# ═══════ PHASE G -- FULLY FIXED ═══════
W-H1 "PHASE G -- Project scan & code dump"
$ExcludeDirs = @('node_modules','.git','.github','dist','build','.next','.vercel','.vite','.cache','.turbo','coverage','out','.output','.nuxt','.svelte-kit','.idea','.vscode','temp','tmp','logs','backups')
$ExcludeFileGlobs = @('.env','.env.*','*.env','*.env.*','*.log','*.lock','package-lock.json','yarn.lock','pnpm-lock.yaml','*.bak','*.bak.*','*.backup_*','*.tmp','*.swp','*.swo','.DS_Store','Thumbs.db','desktop.ini','*.min.js','*.min.css','firebase-debug.log','firestore-debug.log','firebase-key.json','*credentials*.txt','project-report.md','project-code-dump.txt','project-tree.txt')
$BinaryExts = @('.png','.jpg','.jpeg','.gif','.webp','.ico','.bmp','.tiff','.avif','.woff','.woff2','.ttf','.eot','.otf','.mp4','.mp3','.wav','.ogg','.webm','.mov','.avi','.pdf','.zip','.tar','.gz','.7z','.rar','.bz2','.exe','.dll','.so','.dylib','.bin','.dat','.db','.sqlite','.sqlite3','.psd','.ai','.sketch','.fig')
$CategoryMap = [ordered]@{ 'src/pages'='Pages'; 'src/components'='Components'; 'src/context'='Context'; 'src/hooks'='Hooks'; 'src/utils'='Utils'; 'src/config'='Config'; 'src/locales'='Locales'; 'api'='API'; 'public'='Public'; 'scripts'='Scripts'; 'src'='Src-root' }
function Get-Cat { param([string]$p) $p = $p -replace '\\','/'; foreach ($k in $CategoryMap.Keys) { if ($p -like ($k + '/*') -or $p -eq $k) { return $CategoryMap[$k] } }; return 'Root' }
function Test-Bin { param([string]$p) try { $s=[System.IO.File]::OpenRead($p); $b=New-Object byte[] 8000; $r=$s.Read($b,0,8000); $s.Close(); for ($i=0;$i -lt $r;$i++) { if ($b[$i] -eq 0) { return $true } }; return $false } catch { return $true } }

W-Info "Scanning disk..."
$allFiles = Get-ChildItem -Path $Root -Recurse -File -Force -ErrorAction SilentlyContinue
W-Info ("Total: " + $allFiles.Count)
$kept = New-Object System.Collections.ArrayList
$skipped = New-Object System.Collections.ArrayList
foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($Root.Length).TrimStart('\','/') -replace '\\','/'
    if ([string]::IsNullOrWhiteSpace($rel)) { continue }
    $exclude = $false
    if ($BinaryExts -contains $f.Extension.ToLower()) { $exclude = $true }
    if (-not $exclude) { foreach ($g in $ExcludeFileGlobs) { if ($f.Name -like $g) { $exclude = $true; break } } }
    if (-not $exclude) { foreach ($seg in ($rel -split '/')) { if ($ExcludeDirs -contains $seg) { $exclude = $true; break } } }
    if ($exclude) { [void]$skipped.Add($rel); continue }
    if (Test-Bin -p $f.FullName) { [void]$skipped.Add($rel); continue }
    [void]$kept.Add([PSCustomObject]@{ Rel=$rel; Full=$f.FullName; Size=$f.Length; Modified=$f.LastWriteTime; Category=(Get-Cat $rel); Lines=$null })
}
W-Ok ("Kept: " + $kept.Count + "  Skipped: " + $skipped.Count)

W-Info "Reading contents (robust encoding)..."
$contents = @{}
$failCount = 0
foreach ($f in $kept) {
    if ($f.Size -gt $MaxFileBytes) { $failCount++; $f.Lines = -1; continue }
    $raw = Read-TextSafe -Path $f.FullName
    if ($null -eq $raw) { $failCount++; $f.Lines = -1; continue }
    $normalized = $raw -replace "`r`n","`n" -replace "`r","`n"
    $f.Lines = ($normalized -split "`n").Count
    $contents[$f.Rel] = $raw
}
W-Ok ("Read OK: " + $contents.Count + " / " + $kept.Count + "  fails: " + $failCount)

$totalFiles = $kept.Count
$totalLines = ($kept | Where-Object { $null -ne $_.Lines -and $_.Lines -gt 0 } | Measure-Object Lines -Sum).Sum
$totalBytes = ($kept | Measure-Object Size -Sum).Sum
W-Info ("Totals: " + $totalFiles + " files, " + $totalLines + " lines, " + [math]::Round($totalBytes/1KB,1) + " KB")
$groups = $kept | Group-Object Category | Sort-Object Name

# Write report
$report = New-Object System.Collections.ArrayList
[void]$report.Add("# Project Report -- DNG Solutions")
[void]$report.Add("")
[void]$report.Add("**Generated:** " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
[void]$report.Add("")
[void]$report.Add("## Summary")
[void]$report.Add("")
[void]$report.Add("| Metric | Value |")
[void]$report.Add("|---|---|")
[void]$report.Add("| Source files | " + $totalFiles + " |")
[void]$report.Add("| Lines of code | " + $totalLines + " |")
[void]$report.Add("| Total size | " + [math]::Round($totalBytes/1KB,1) + " KB |")
[void]$report.Add("| Skipped | " + $skipped.Count + " |")
[void]$report.Add("| Read failures | " + $failCount + " |")
[void]$report.Add("")
if ($issues.Count -gt 0) {
    [void]$report.Add("## Issues Found")
    [void]$report.Add("")
    [void]$report.Add("| Severity | Message |")
    [void]$report.Add("|---|---|")
    foreach ($i in $issues) { [void]$report.Add("| " + $i.Severity + " | " + $i.Message + " |") }
    [void]$report.Add("")
}
if ($actions.Count -gt 0) {
    [void]$report.Add("## Actions Taken")
    [void]$report.Add("")
    foreach ($a in $actions) { [void]$report.Add("- " + $a) }
    [void]$report.Add("")
}
[void]$report.Add("## Files by Category")
[void]$report.Add("")
foreach ($g in $groups) {
    $gl = ($g.Group | Where-Object { $null -ne $_.Lines -and $_.Lines -gt 0 } | Measure-Object Lines -Sum).Sum
    $gb = ($g.Group | Measure-Object Size -Sum).Sum
    [void]$report.Add("### " + $g.Name + " (" + $g.Count + " files, " + $gl + " lines, " + [math]::Round($gb/1KB,1) + " KB)")
    [void]$report.Add("")
    [void]$report.Add("| File | Lines | Size |")
    [void]$report.Add("|---|---|---|")
    foreach ($f in ($g.Group | Sort-Object Rel)) {
        $ln = if ($null -ne $f.Lines -and $f.Lines -gt 0) { $f.Lines } else { '?' }
        [void]$report.Add("| ``" + $f.Rel + "`` | " + $ln + " | " + [math]::Round($f.Size/1KB,1) + " KB |")
    }
    [void]$report.Add("")
}
[void]$report.Add("## Largest Files")
[void]$report.Add("")
[void]$report.Add("| File | Lines | Size |")
[void]$report.Add("|---|---|---|")
foreach ($f in ($kept | Sort-Object Size -Descending | Select-Object -First 20)) {
    $ln = if ($null -ne $f.Lines -and $f.Lines -gt 0) { $f.Lines } else { '?' }
    [void]$report.Add("| ``" + $f.Rel + "`` | " + $ln + " | " + [math]::Round($f.Size/1KB,1) + " KB |")
}
$reportPath = Join-Path $Root 'project-report.md'
[System.IO.File]::WriteAllLines($reportPath, $report, (New-Object System.Text.UTF8Encoding $false))
W-Save $reportPath

# Write tree
$tree = New-Object System.Collections.ArrayList
[void]$tree.Add("PROJECT TREE")
[void]$tree.Add("Generated: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
[void]$tree.Add("Files: " + $totalFiles)
[void]$tree.Add(("=" * 70))
$currentDir = $null
foreach ($f in ($kept | Sort-Object Rel)) {
    $dir = Split-Path $f.Rel -Parent
    $name = Split-Path $f.Rel -Leaf
    if ($dir -ne $currentDir) {
        $currentDir = $dir
        $display = if ([string]::IsNullOrEmpty($dir)) { '(root)' } else { $dir }
        [void]$tree.Add("")
        [void]$tree.Add("[DIR] " + $display)
    }
    [void]$tree.Add("   " + $name)
}
$treePath = Join-Path $Root 'project-tree.txt'
[System.IO.File]::WriteAllLines($treePath, $tree, (New-Object System.Text.UTF8Encoding $false))
W-Save $treePath

# Write dump
$dump = New-Object System.Collections.ArrayList
[void]$dump.Add("================================================================")
[void]$dump.Add("  PROJECT CODE DUMP -- DNG Solutions")
[void]$dump.Add("  Generated: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
[void]$dump.Add("================================================================")
[void]$dump.Add("")
[void]$dump.Add("Files : " + $totalFiles)
[void]$dump.Add("Lines : " + $totalLines)
[void]$dump.Add("Size  : " + [math]::Round($totalBytes/1KB,1) + " KB")
[void]$dump.Add("")
foreach ($g in $groups) {
    [void]$dump.Add("")
    [void]$dump.Add("##############################################################")
    [void]$dump.Add("#  " + $g.Name.ToUpper())
    [void]$dump.Add("##############################################################")
    [void]$dump.Add("")
    foreach ($f in ($g.Group | Sort-Object Rel)) {
        $ln = if ($null -ne $f.Lines -and $f.Lines -gt 0) { $f.Lines } else { '?' }
        [void]$dump.Add("")
        [void]$dump.Add("================================================================")
        [void]$dump.Add("FILE: " + $f.Rel)
        [void]$dump.Add("      " + $ln + " lines, " + [math]::Round($f.Size/1KB,1) + " KB")
        [void]$dump.Add("================================================================")
        [void]$dump.Add("")
        if ($f.Size -gt $MaxFileBytes) { [void]$dump.Add("[... SKIPPED: too large ...]"); continue }
        $raw = $contents[$f.Rel]
        if ($null -eq $raw) { [void]$dump.Add("[... SKIPPED: unreadable ...]"); continue }
        foreach ($l in ($raw -split "`r?`n")) { [void]$dump.Add($l) }
    }
}
[void]$dump.Add("")
[void]$dump.Add("================================================================")
[void]$dump.Add("END OF DUMP -- " + $totalFiles + " files, " + $totalLines + " lines")
[void]$dump.Add("================================================================")
$dumpPath = Join-Path $Root 'project-code-dump.txt'
[System.IO.File]::WriteAllLines($dumpPath, $dump, (New-Object System.Text.UTF8Encoding $false))
W-Save ($dumpPath + "  (" + [math]::Round((Get-Item $dumpPath).Length/1KB,1) + " KB)")

# ═══════ PHASE H ═══════
W-H1 "PHASE H -- Recommendations"
$bigFiles = $kept | Where-Object { $_.Size -gt 30KB -and $_.Category -ne 'Locales' } | Sort-Object Size -Descending
if ($bigFiles) { W-Head "Large files (split recommended)"; foreach ($bf in $bigFiles) { W-Warn ($bf.Rel + " -- " + [math]::Round($bf.Size/1KB,1) + " KB" + $(if ($bf.Lines -and $bf.Lines -gt 0) { ", " + $bf.Lines + " lines" } else { "" })) } }

W-H1 "COMPLETE"
Write-Host ""
Write-Host "  Output files:" -ForegroundColor Cyan
Write-Host "    project-report.md       --  inventory + issues" -ForegroundColor Gray
Write-Host "    project-tree.txt        --  directory tree" -ForegroundColor Gray
Write-Host "    project-code-dump.txt   --  all source (AI-ready)" -ForegroundColor Gray
Write-Host ""
Write-Host ("  Actions taken: " + $actions.Count) -ForegroundColor Yellow
Write-Host ("  Issues: " + $issues.Count) -ForegroundColor Yellow
Write-Host ""
if ($OpenReport -and (Test-Path $reportPath)) { Start-Process $reportPath }
