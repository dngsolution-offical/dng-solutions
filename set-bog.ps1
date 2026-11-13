# ═══════════════════════════════════════════════════════════════════════════
# DNG — SET BOG CREDENTIALS (interactive)
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$envPath = Join-Path (Get-Location).Path ".env"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SET BOG CREDENTIALS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env not found in current folder!" -ForegroundColor Red
    Write-Host "   Make sure you are in: C:\Users\tenad\dng-solutions" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📁 .env location: $envPath" -ForegroundColor Gray
Write-Host ""

# ─── INPUT Client ID ───
Write-Host "1️⃣  Client ID" -ForegroundColor White
Write-Host "   (BOG developer.bog.ge-დან — იწყება ჩვეულებრივ ასოებით)" -ForegroundColor DarkGray
$clientId = Read-Host "   ➜ Client ID"

if (-not $clientId -or $clientId.Trim() -eq "") {
    Write-Host "❌ Client ID cannot be empty" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
$clientId = $clientId.Trim()

Write-Host ""
Write-Host "2️⃣  Client Secret" -ForegroundColor White
Write-Host "   (გრძელი token — ჩანს მხოლოდ ერთხელ BOG-ში)" -ForegroundColor DarkGray
$clientSecretSecure = Read-Host "   ➜ Client Secret" -AsSecureString
$clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($clientSecretSecure)
)

if (-not $clientSecret -or $clientSecret.Trim() -eq "") {
    Write-Host "❌ Client Secret cannot be empty" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
$clientSecret = $clientSecret.Trim()

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  Client ID:     $($clientId.Substring(0, [Math]::Min(20, $clientId.Length)))..." -ForegroundColor Gray
Write-Host "  Client Secret: $($clientSecret.Substring(0, [Math]::Min(20, $clientSecret.Length)))..." -ForegroundColor Gray
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# ─── CONFIRM ───
$confirm = Read-Host "Save these credentials to .env? (y/n)"
if ($confirm -notmatch '^[yY]') {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

# ─── BACKUP ───
$backupPath = "$envPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $envPath $backupPath -Force
Write-Host ""
Write-Host "✅ Backup: $(Split-Path $backupPath -Leaf)" -ForegroundColor Green

# ─── READ .env ───
$content = [System.IO.File]::ReadAllText($envPath, [System.Text.Encoding]::UTF8)

# ─── REPLACE OR ADD BOG_CLIENT_ID ───
if ($content -match "(?m)^BOG_CLIENT_ID=.*$") {
    $content = $content -replace "(?m)^BOG_CLIENT_ID=.*$", "BOG_CLIENT_ID=$clientId"
    Write-Host "✅ Updated BOG_CLIENT_ID" -ForegroundColor Green
} else {
    $content = $content.TrimEnd() + "`r`nBOG_CLIENT_ID=$clientId"
    Write-Host "✅ Added BOG_CLIENT_ID" -ForegroundColor Green
}

# ─── REPLACE OR ADD BOG_CLIENT_SECRET ───
if ($content -match "(?m)^BOG_CLIENT_SECRET=.*$") {
    $content = $content -replace "(?m)^BOG_CLIENT_SECRET=.*$", "BOG_CLIENT_SECRET=$clientSecret"
    Write-Host "✅ Updated BOG_CLIENT_SECRET" -ForegroundColor Green
} else {
    $content = $content.TrimEnd() + "`r`nBOG_CLIENT_SECRET=$clientSecret"
    Write-Host "✅ Added BOG_CLIENT_SECRET" -ForegroundColor Green
}

# ─── ENSURE BOG_API_URL ───
if ($content -notmatch "(?m)^BOG_API_URL=") {
    $content = $content.TrimEnd() + "`r`nBOG_API_URL=https://api.bog.ge/payments/v1"
    Write-Host "✅ Added BOG_API_URL" -ForegroundColor Green
}

# ─── ENSURE BOG_AUTH_URL ───
if ($content -notmatch "(?m)^BOG_AUTH_URL=") {
    $content = $content.TrimEnd() + "`r`nBOG_AUTH_URL=https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token"
    Write-Host "✅ Added BOG_AUTH_URL" -ForegroundColor Green
}

# ─── ENSURE NEXT_PUBLIC_BASE_URL ───
if ($content -notmatch "(?m)^NEXT_PUBLIC_BASE_URL=") {
    $content = $content.TrimEnd() + "`r`nNEXT_PUBLIC_BASE_URL=http://localhost:3000"
    Write-Host "✅ Added NEXT_PUBLIC_BASE_URL" -ForegroundColor Green
}

# ─── SAVE (UTF8 no BOM) ───
[System.IO.File]::WriteAllText($envPath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host ""
Write-Host "✅ .env saved successfully!" -ForegroundColor Green
Write-Host ""

# ─── VERIFY ───
Write-Host "🔍 Verifying..." -ForegroundColor Cyan
Write-Host ""
$verify = @{}
foreach ($line in ([System.IO.File]::ReadAllText($envPath, [System.Text.Encoding]::UTF8) -split "`r?`n")) {
    $line = $line.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match '^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$') {
        $verify[$matches[1]] = $matches[2]
    }
}

if ($verify["BOG_CLIENT_ID"] -eq $clientId) {
    Write-Host "  ✅ BOG_CLIENT_ID        = $($verify['BOG_CLIENT_ID'].Substring(0, [Math]::Min(20, $verify['BOG_CLIENT_ID'].Length)))..." -ForegroundColor Green
} else {
    Write-Host "  ❌ BOG_CLIENT_ID        = MISMATCH!" -ForegroundColor Red
}

if ($verify["BOG_CLIENT_SECRET"] -eq $clientSecret) {
    Write-Host "  ✅ BOG_CLIENT_SECRET    = $($verify['BOG_CLIENT_SECRET'].Substring(0, [Math]::Min(20, $verify['BOG_CLIENT_SECRET'].Length)))..." -ForegroundColor Green
} else {
    Write-Host "  ❌ BOG_CLIENT_SECRET    = MISMATCH!" -ForegroundColor Red
}

if ($verify["BOG_API_URL"]) {
    Write-Host "  ✅ BOG_API_URL          = $($verify['BOG_API_URL'])" -ForegroundColor Green
}
if ($verify["BOG_AUTH_URL"]) {
    Write-Host "  ✅ BOG_AUTH_URL         = $($verify['BOG_AUTH_URL'].Substring(0, 60))..." -ForegroundColor Green
}
if ($verify["NEXT_PUBLIC_BASE_URL"]) {
    Write-Host "  ✅ NEXT_PUBLIC_BASE_URL = $($verify['NEXT_PUBLIC_BASE_URL'])" -ForegroundColor Green
}
Write-Host ""

# ─── TEST BOG OAUTH ───
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TESTING BOG OAUTH..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

try {
    $basic = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${clientId}:${clientSecret}"))
    $resp = Invoke-RestMethod -Method POST `
        -Uri "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token" `
        -Headers @{
            "Authorization" = "Basic $basic"
            "Content-Type" = "application/x-www-form-urlencoded"
        } `
        -Body "grant_type=client_credentials" `
        -TimeoutSec 20

    if ($resp.access_token) {
        Write-Host "  ✅ SUCCESS! OAuth token received" -ForegroundColor Green
        Write-Host "     Token expires in: $($resp.expires_in) seconds" -ForegroundColor Gray
        Write-Host "     Token preview: $($resp.access_token.Substring(0, [Math]::Min(30, $resp.access_token.Length)))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  🎉 BOG CREDENTIALS WORK!" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "  NEXT STEPS:" -ForegroundColor White
        Write-Host "    1. npm run dev:all" -ForegroundColor Cyan
        Write-Host "    2. http://localhost:3000/checkout/gold?billing=monthly" -ForegroundColor Cyan
        Write-Host "    3. Click BOG button → test payment" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "  ⚠️  Got response but no access_token" -ForegroundColor Yellow
        Write-Host "     Response: $($resp | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ OAuth FAILED" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "     Details: $($_.ErrorDetails.Message)" -ForegroundColor DarkRed
    }
    Write-Host ""
    Write-Host "  💡 შესაძლო მიზეზები:" -ForegroundColor Yellow
    Write-Host "     • Client ID ან Secret არასწორია" -ForegroundColor Gray
    Write-Host "     • BOG-ის აპლიკაცია ჯერ არ არის აქტიური (dev portal)" -ForegroundColor Gray
    Write-Host "     • Client Credentials Flow არ არის ჩართული" -ForegroundColor Gray
    Write-Host "     • 'ინტერნეტბანკის მომხმარებელი' არასწორია" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press Enter to close..." -ForegroundColor Gray
Read-Host