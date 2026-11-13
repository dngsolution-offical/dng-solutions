# Find the header section in AgentChat and add home button
$file = ".\src\components\agents\AgentChat.jsx"
$content = Get-Content $file -Raw

# Check if already has onHome prop
if ($content -match 'onHome') {
    Write-Host "[OK] AgentChat already has onHome prop" -ForegroundColor Green
} else {
    # Add onHome prop to function signature
    $content = $content -replace "export default function AgentChat\(\{ agent, onClose \}\)", "export default function AgentChat({ agent, onClose, onHome })"
    
    # Add Home icon to Icons object
    $content = $content -replace "ArrowLeft: \(\) => \(<svg", "Home: () => (<svg className=""w-4 h-4"" fill=""none"" stroke=""currentColor"" viewBox=""0 0 24 24""><path strokeLinecap=""round"" strokeLinejoin=""round"" strokeWidth=""2"" d=""M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"" /></svg>),`n  ArrowLeft: () => (<svg"
    
    Set-Content -Path $file -Value $content -Encoding UTF8
    Write-Host "[OK] AgentChat onHome prop added" -ForegroundColor Green
}

Write-Host "[OK] Please check AgentChat.jsx header manually if needed" -ForegroundColor Yellow
