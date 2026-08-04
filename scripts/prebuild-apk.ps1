$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '[build:apk] Checking repository state...' -ForegroundColor Cyan
$changes = git status --short
if ($changes) {
  $count = ($changes | Measure-Object).Line
  Write-Host "[build:apk] WARNING: $count uncommitted file(s)." -ForegroundColor Yellow
  Write-Host '[build:apk] EAS cloud builds only include committed code when linked to GitHub.'
  Write-Host '[build:apk] Commit and push first, or use: eas build --local'
  $changes | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }
  if ($count -gt 15) { Write-Host "  ... and $($count - 15) more" }
  Write-Host ''
}

Write-Host '[build:apk] API baked into APK via eas.json:' -ForegroundColor Cyan
Write-Host '  EXPO_PUBLIC_API_URL=http://197.140.142.178/api'
Write-Host ''

& eas build --platform android --profile preview --non-interactive
