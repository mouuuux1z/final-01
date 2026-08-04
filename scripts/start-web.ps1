param(
  [switch]$Clear
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Local backend when running npm start / npm run start:clean
$env:EXPO_PUBLIC_USE_LOCAL_BACKEND = 'true'
$env:EXPO_PUBLIC_API_URL = 'http://localhost:3000/api'
$env:EXPO_PUBLIC_SOCKET_URL = 'http://localhost:3000'
$env:EXPO_NO_TELEMETRY = '1'
$env:EXPO_OFFLINE = '1'
$env:NODE_OPTIONS = '--dns-result-order=ipv4first'
Remove-Item Env:CI -ErrorAction SilentlyContinue

if ($Clear) {
  Remove-Item -Recurse -Force (Join-Path $root '.expo') -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force (Join-Path $root 'mobile\.expo') -ErrorAction SilentlyContinue
}

foreach ($port in 8081, 8082) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      cmd /c "taskkill /F /T /PID $($_.OwningProcess) 2>nul"
    }
}

Write-Host '[web] Starting Expo on http://localhost:8082'
Write-Host '[web] First web build can take 2-3 minutes because the project is on OneDrive.'

$openJob = Start-Job -ScriptBlock {
  param($ProjectRoot)
  Set-Location $ProjectRoot
  Start-Sleep -Seconds 5
  node scripts/open-web.js
} -ArgumentList $root

$expoArgs = @('expo', 'start', '--web', '--port', '8082')
if ($Clear) {
  $expoArgs += '--clear'
}

try {
  & npx @expoArgs
} finally {
  Stop-Job $openJob -ErrorAction SilentlyContinue
  Remove-Job $openJob -Force -ErrorAction SilentlyContinue
}
