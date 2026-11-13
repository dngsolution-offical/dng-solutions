# dng-fix.ps1 - conservative repair pass for DNG Solutions (ASCII only, PowerShell 5.1)
$ErrorActionPreference = 'Continue'
$root    = (Get-Location).Path
$stamp   = Get-Date -Format 'yyyyMMdd-HHmmss'
$bak     = Join-Path $root ('_fixbak-' + $stamp)
$utf8    = New-Object System.Text.UTF8Encoding($false)
$strict  = New-Object System.Text.UTF8Encoding($false, $true)
$cp1252  = [System.Text.Encoding]::GetEncoding(1252)
$hits    = '[\u00C2\u00C3\u00D0\u00D1\u00E2]'
$goodDir = Join-Path $root 'backups\i18n_full_20261110_132729'
$rep     = New-Object System.Collections.Generic.List[string]
$fixed   = 0
$skipped = 0

function Say([string]$lvl, [string]$msg) {
  $color = 'White'
  if ($lvl -eq 'OK')   { $color = 'Green' }
  if ($lvl -eq 'FIX')  { $color = 'Cyan' }
  if ($lvl -eq 'WARN') { $color = 'Yellow' }
  if ($lvl -eq 'ERR')  { $color = 'Red' }
  $line = '[' + $lvl + '] ' + $msg
  $rep.Add($line)
  Write-Host $line -ForegroundColor $color
}

function Head([string]$t) {
  Write-Host ''
  Write-Host $t -ForegroundColor Magenta
  $rep.Add($t)
}

function Test-JsonFile([string]$path) {
  & node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" $path 2>$null | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Test-Port([int]$port) {
  $r = Test-NetConnection 127.0.0.1 -Port $port -WarningAction SilentlyContinue
  return [bool]$r.TcpTestSucceeded
}

New-Item -ItemType Directory -Path $bak -Force | Out-Null
Say 'OK' ('backup folder: ' + $bak)

# 1. Locale JSON: restore only if broken AND a known-good copy exists
Head '--- 1. locale JSON ---'
$locDir = Join-Path $root 'src\locales'
foreach ($lang in 'en', 'ka', 'ru') {
  $p = Join-Path $locDir ($lang + '.json')
  if (-not (Test-Path -LiteralPath $p)) { Say 'ERR' ($lang + '.json missing'); continue }
  if (Test-JsonFile $p) { Say 'OK' ($lang + '.json valid'); continue }
  $cand = Join-Path $goodDir ($lang + '.json')
  if ((Test-Path -LiteralPath $cand) -and (Test-JsonFile $cand)) {
    Copy-Item -LiteralPath $p -Destination (Join-Path $bak ('broken-' + $lang + '.json')) -Force
    Copy-Item -LiteralPath $cand -Destination $p -Force
    Say 'FIX' ($lang + '.json was invalid, restored from known-good backup')
  } else {
    Say 'ERR' ($lang + '.json invalid and no known-good backup found')
  }
}
Get-ChildItem -LiteralPath $locDir -Filter '*.test.json' -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -LiteralPath $locDir -Filter '*.fixed.json' -ErrorAction SilentlyContinue | Remove-Item -Force

# 2. Mojibake repair in src (UTF-8 decoded as cp1252). Only clean round-trip lines change.
Head '--- 2. mojibake repair in src ---'
$srcFiles = Get-ChildItem -Path (Join-Path $root 'src') -Recurse -File | Where-Object { $_.Extension -in '.js', '.jsx', '.json', '.css' }
foreach ($f in $srcFiles) {
  $text = [IO.File]::ReadAllText($f.FullName, $utf8)
  if ($text -cnotmatch $hits) { continue }
  $changedHere = $false
  $newLines = @()
  foreach ($ln in $text.Split("`n")) {
    $done = $false
    if ($ln -cmatch $hits) {
      if ($cp1252.GetString($cp1252.GetBytes($ln)) -ceq $ln) {
        try {
          $conv = $strict.GetString($cp1252.GetBytes($ln))
          if ($conv -cne $ln) { $changedHere = $true }
          $newLines += $conv
          $done = $true
        } catch { $done = $false }
      }
      if (-not $done) { $skipped++ }
    }
    if (-not $done) { $newLines += $ln }
  }
  if ($changedHere) {
    $rel = $f.FullName.Substring($root.Length + 1)
    Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $bak ($rel -replace '[\\/]', '_')) -Force
    [IO.File]::WriteAllText($f.FullName, ($newLines -join "`n"), $utf8)
    $fixed++
    Say 'FIX' $rel
  }
}
Say 'OK' ("files repaired: $fixed   ambiguous lines left as-is: $skipped")

# 3. .env: names only, values never printed
Head '--- 3. .env (names only) ---'
$envPath = Join-Path $root '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
  Say 'ERR' '.env is missing'
} else {
  $names = @(Get-Content -LiteralPath $envPath | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object { ($_ -split '=', 2)[0] })
  $need = 'ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_APP_ID', 'VITE_EMAILJS_SERVICE_ID', 'VITE_EMAILJS_TEMPLATE_ID', 'VITE_EMAILJS_PUBLIC_KEY'
  foreach ($n in $need) {
    if ($names -contains $n) { Say 'OK' ('env ' + $n) } else { Say 'WARN' ('env missing: ' + $n) }
  }
  foreach ($d in ($names | Group-Object | Where-Object { $_.Count -gt 1 })) { Say 'WARN' ('env duplicate: ' + $d.Name) }
}

# 4. Secret scan (file names only)
Head '--- 4. secret scan ---'
$secretPat = 'sk-ant-[A-Za-z0-9_\-]{10,}|AIza[0-9A-Za-z_\-]{30,}|BEGIN (RSA )?PRIVATE KEY|apikey_[A-Za-z0-9_\-]{10,}'
$scan = @()
$scan += Get-ChildItem -LiteralPath (Join-Path $root 'src') -Recurse -File -ErrorAction SilentlyContinue
$scan += Get-ChildItem -LiteralPath (Join-Path $root 'api') -Recurse -File -ErrorAction SilentlyContinue
$scan += Get-ChildItem -LiteralPath $root -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in '.cjs', '.js', '.json', '.txt', '.md', '.bat' }
foreach ($t in $scan) {
  if (Select-String -LiteralPath $t.FullName -Pattern $secretPat -Quiet) { Say 'ERR' ('secret pattern in ' + $t.FullName.Substring($root.Length + 1)) }
}
foreach ($t in (Get-ChildItem -LiteralPath $root -File -Filter '*.cjs' -ErrorAction SilentlyContinue)) {
  if (Select-String -LiteralPath $t.FullName -Pattern '(?i)password\s*[:=]\s*[''"][^''"]{4,}' -Quiet) { Say 'ERR' ('hard-coded password literal in ' + $t.Name) }
}
if (Test-Path -LiteralPath (Join-Path $root 'admin-credentials.txt')) {
  Say 'ERR' 'admin-credentials.txt is still in the project: delete it and change the admin password'
}

# 5. API routes used by frontend vs served by api-server.cjs
Head '--- 5. API routes ---'
$serverFile = Join-Path $root 'api-server.cjs'
$served = @()
if (Test-Path -LiteralPath $serverFile) {
  $served = @([regex]::Matches([IO.File]::ReadAllText($serverFile, $utf8), '"(/api/[A-Za-z0-9_/\-]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
}
$used = @{}
foreach ($f in (Get-ChildItem -Path (Join-Path $root 'src') -Recurse -File | Where-Object { $_.Extension -in '.js', '.jsx' })) {
  $t = [IO.File]::ReadAllText($f.FullName, $utf8)
  foreach ($m in [regex]::Matches($t, '["''`](/api/[A-Za-z0-9_/\-]+)')) { $used[$m.Groups[1].Value] = $f.Name }
  if ($t -match 'process\.env\.') { Say 'WARN' ('process.env in src (undefined in Vite): ' + $f.Name) }
}
foreach ($route in $used.Keys) {
  if ($served -contains $route) { Say 'OK' ('route ' + $route) }
  else { Say 'WARN' ('route ' + $route + ' used by ' + $used[$route] + ' - missing in api-server.cjs') }
}

# 6. Services
Head '--- 6. services ---'
if (-not (Test-Port 3001) -and (Test-Path -LiteralPath $serverFile)) {
  Start-Process powershell -ArgumentList '-NoExit', '-Command', ("Set-Location '" + $root + "'; node api-server.cjs")
  Start-Sleep -Seconds 4
}
if (Test-Port 3001) { Say 'OK' 'api-server listening on 127.0.0.1:3001' } else { Say 'ERR' 'api-server not running (check the window that just opened)' }
if (Test-Port 3000) { Say 'OK' 'vite listening on :3000' } else { Say 'WARN' 'vite not running: start npm run dev in another window' }
if (Test-Port 3001) {
  try {
    $resp = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/api/parse-order' -Method Post -ContentType 'application/json' -Body '{"text":"15 November birthday, 25 guests"}'
    if ($resp.ok) { Say 'OK' ('parse-order ok: guests=' + $resp.data.guests + ' date=' + $resp.data.orderDate) }
    else { Say 'ERR' 'parse-order returned ok=false' }
  } catch { Say 'ERR' ('parse-order failed: ' + $_.Exception.Message) }
}

# 7. Report
$reportPath = Join-Path $root ('dng-fix-report-' + $stamp + '.txt')
[IO.File]::WriteAllLines($reportPath, $rep.ToArray(), $utf8)
Write-Host ''
Write-Host ('Report: ' + $reportPath) -ForegroundColor Cyan
Write-Host 'Restart npm run dev now (Vite reads .env and locale files at startup).' -ForegroundColor Cyan
