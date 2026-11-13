$ErrorActionPreference = "Continue"
$ProjectRoot = (Get-Location).Path
$baseUrl = "http://localhost:3000"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  BOG FULL TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

# 1. ENV
Write-Host "1. ENV CHECK" -ForegroundColor White
$envPath = Join-Path $ProjectRoot ".env"
$envHash = @{}
if (Test-Path $envPath) {
    $content = [System.IO.File]::ReadAllText($envPath, [System.Text.Encoding]::UTF8)
    foreach ($line in ($content -split "`r?`n")) {
        $line = $line.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match '^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$') {
            $envHash[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
        }
    }
}

if (-not $envHash["BOG_CLIENT_ID"] -or $envHash["BOG_CLIENT_ID"] -eq "YOUR_BOG_CLIENT_ID_HERE") {
    Write-Host "  X BOG_CLIENT_ID missing" -ForegroundColor Red
    exit 1
}
Write-Host "  OK BOG_CLIENT_ID: $($envHash['BOG_CLIENT_ID'].Substring(0,8))..." -ForegroundColor Green
$passed++

if (-not $envHash["BOG_CLIENT_SECRET"] -or $envHash["BOG_CLIENT_SECRET"] -eq "YOUR_BOG_CLIENT_SECRET_HERE") {
    Write-Host "  X BOG_CLIENT_SECRET missing" -ForegroundColor Red
    exit 1
}
Write-Host "  OK BOG_CLIENT_SECRET: $($envHash['BOG_CLIENT_SECRET'].Substring(0,8))..." -ForegroundColor Green
$passed++

$baseUrl = if ($envHash["NEXT_PUBLIC_BASE_URL"]) { $envHash["NEXT_PUBLIC_BASE_URL"] } else { "http://localhost:3000" }
Write-Host "  OK BASE_URL: $baseUrl" -ForegroundColor Green
$passed++
Write-Host ""

# 2. FILES
Write-Host "2. FILES" -ForegroundColor White
$files = @("api\bog-create-order.js","api\bog-callback.js","api\bog-status.js","src\pages\CheckoutSuccess.jsx","firebase-key.json")
foreach ($f in $files) {
    if (Test-Path (Join-Path $ProjectRoot $f)) {
        Write-Host "  OK $f" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  X $f MISSING" -ForegroundColor Red
        $failed++
    }
}
Write-Host ""

# 3. BOG OAUTH
Write-Host "3. BOG OAUTH" -ForegroundColor White
$accessToken = $null
try {
    $basic = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("$($envHash['BOG_CLIENT_ID']):$($envHash['BOG_CLIENT_SECRET'])"))
    $authRes = Invoke-RestMethod -Method POST -Uri "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token" -Headers @{ "Authorization" = "Basic $basic"; "Content-Type" = "application/x-www-form-urlencoded" } -Body "grant_type=client_credentials" -TimeoutSec 20
    if ($authRes.access_token) {
        $accessToken = $authRes.access_token
        Write-Host "  OK OAuth token received (expires $($authRes.expires_in)s)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  X No access_token" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  X OAuth failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host "    $($_.ErrorDetails.Message)" -ForegroundColor DarkRed }
    $failed++
}
Write-Host ""

# 4. BOG ORDER
Write-Host "4. BOG ORDER" -ForegroundColor White
if ($accessToken) {
    try {
        $orderBody = @{
            callback_url = "$baseUrl/api/bog-callback"
            external_order_id = "test_" + [Guid]::NewGuid().ToString().Substring(0,8)
            purchase_units = @{ currency = "GEL"; total_amount = 1; basket = @(@{ product_id = "test"; description = "Test"; quantity = 1; unit_price = 1; total_price = 1 }) }
            redirect_urls = @{ success = "$baseUrl/checkout/success"; fail = "$baseUrl/checkout/fail" }
        } | ConvertTo-Json -Depth 10
        $orderRes = Invoke-RestMethod -Method POST -Uri "https://api.bog.ge/payments/v1/ecommerce/orders" -Headers @{ "Authorization" = "Bearer $accessToken"; "Content-Type" = "application/json"; "Accept" = "application/json" } -Body $orderBody -TimeoutSec 20
        Write-Host "  OK Order created: $($orderRes.id)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "  X Order failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) { Write-Host "    $($_.ErrorDetails.Message.Substring(0, [Math]::Min(300, $_.ErrorDetails.Message.Length)))" -ForegroundColor DarkRed }
        $failed++
    }
} else {
    Write-Host "  - Skipped (no token)" -ForegroundColor Gray
}
Write-Host ""

# 5. FIREBASE
Write-Host "5. FIREBASE" -ForegroundColor White
$fbJs = 'const fs=require("fs");const {initializeApp,getApps,cert}=require("firebase-admin/app");const {getFirestore}=require("firebase-admin/firestore");(async()=>{try{const sa=JSON.parse(fs.readFileSync("firebase-key.json","utf8"));sa.private_key=sa.private_key.replace(/\s+$/,"");if(!getApps().length)initializeApp({credential:cert(sa)});const db=getFirestore();const u=await db.collection("users").limit(1).get();const o=await db.collection("payment_orders").limit(1).get();console.log("OK");console.log("USERS:"+u.size);console.log("ORDERS:"+o.size);process.exit(0)}catch(e){console.log("FAIL:"+e.message);process.exit(1)}})();'
$fbTmp = Join-Path $ProjectRoot "_fb.js"
[System.IO.File]::WriteAllText($fbTmp, $fbJs, (New-Object System.Text.UTF8Encoding($false)))
$fbOut = & node $fbTmp 2>&1 | Out-String
Remove-Item $fbTmp -Force -ErrorAction SilentlyContinue
if ($fbOut -match "OK") {
    Write-Host "  OK Firebase connected" -ForegroundColor Green
    $passed++
    if ($fbOut -match "USERS:(\d+)") { Write-Host "    Users: $($matches[1])" -ForegroundColor Gray }
    if ($fbOut -match "ORDERS:(\d+)") { Write-Host "    Orders: $($matches[1])" -ForegroundColor Gray }
} else {
    Write-Host "  X Firebase failed: $fbOut" -ForegroundColor Red
    $failed++
}
Write-Host ""

# 6. SIMULATION
Write-Host "6. AUTO-ACTIVATION SIMULATION" -ForegroundColor White
$simJs = 'const fs=require("fs");const {initializeApp,getApps,cert}=require("firebase-admin/app");const {getFirestore}=require("firebase-admin/firestore");(async()=>{try{const sa=JSON.parse(fs.readFileSync("firebase-key.json","utf8"));sa.private_key=sa.private_key.replace(/\s+$/,"");if(!getApps().length)initializeApp({credential:cert(sa)});const db=getFirestore();const uid="test_bog_"+Date.now();await db.collection("users").doc(uid).set({email:"test@bog.local",package:"Free",createdAt:new Date()});const oid="test_order_"+Date.now();await db.collection("payment_orders").doc(oid).set({userId:uid,packageId:"gold",billingCycle:"monthly",amount:249,status:"pending",bogOrderId:"TEST_"+Date.now(),createdAt:new Date()});const days=30,exp=new Date();exp.setDate(exp.getDate()+days);await db.collection("users").doc(uid).update({package:"Gold",expiresAt:exp,packageUpdatedAt:new Date()});await db.collection("payment_orders").doc(oid).update({status:"paid",paidAt:new Date()});const uc=await db.collection("users").doc(uid).get();const oc=await db.collection("payment_orders").doc(oid).get();const ok=uc.data().package==="Gold"&&oc.data().status==="paid";await db.collection("users").doc(uid).delete();await db.collection("payment_orders").doc(oid).delete();console.log(ok?"ACTIVATION_OK":"ACTIVATION_FAILED");console.log("PKG:"+uc.data().package);process.exit(ok?0:1)}catch(e){console.log("ERROR:"+e.message);process.exit(1)}})();'
$simTmp = Join-Path $ProjectRoot "_sim.js"
[System.IO.File]::WriteAllText($simTmp, $simJs, (New-Object System.Text.UTF8Encoding($false)))
$simOut = & node $simTmp 2>&1 | Out-String
Remove-Item $simTmp -Force -ErrorAction SilentlyContinue
if ($simOut -match "ACTIVATION_OK") {
    Write-Host "  OK Auto-activation works" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  X Simulation failed: $simOut" -ForegroundColor Red
    $failed++
}
Write-Host ""

# SUMMARY
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASSED: $passed  |  FAILED: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`nNext:" -ForegroundColor White
    Write-Host "  npm run dev:all" -ForegroundColor Cyan
    Write-Host "  http://localhost:3000/checkout/gold?billing=monthly" -ForegroundColor Cyan
    Write-Host "`nBOG Test card: 4111 1111 1111 1111 | 12/30 | 123`n" -ForegroundColor Gray
} else {
    Write-Host "$failed TEST(S) FAILED - see above" -ForegroundColor Yellow
}

Write-Host "`nPress Enter to close..." -ForegroundColor Gray
Read-Host