$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '[build:aab] Checking repository state...' -ForegroundColor Cyan
$changes = git status --short
if ($changes) {
  $count = ($changes | Measure-Object).Line
  Write-Host "[build:aab] WARNING: $count uncommitted file(s)." -ForegroundColor Yellow
  Write-Host '[build:aab] Commit and push first, or use: eas build --local'
  Write-Host ''
}

Write-Host '[build:aab] Production AAB (Google Play) — API:' -ForegroundColor Cyan
Write-Host '  EXPO_PUBLIC_API_URL=http://197.140.142.178/api'
Write-Host ''

& eas build --platform android --profile production --non-interactive
