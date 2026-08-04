param(
  [string]$ProductionHost = '197.140.142.178',
  [string]$LocalApi = 'http://localhost:3000'
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '========== MYDoc Runtime Audit ==========' -ForegroundColor Cyan
Write-Host ""

function Get-Json($Url) {
  $raw = curl.exe -s $Url
  if (-not $raw) { return $null }
  try { return ($raw | ConvertFrom-Json) } catch { return @{ raw = $raw } }
}

function Mask-DbUrl($line) {
  if ($line -match 'DATABASE_URL=(.+)') {
    return ($matches[1] -replace 'postgresql://[^@]+@', 'postgresql://***@')
  }
  return $line
}

Write-Host '[1] Mobile API configuration' -ForegroundColor Yellow
Write-Host "  serve-web-static.ps1 -> EXPO_PUBLIC_USE_LOCAL_BACKEND=true + localhost:3000"
Write-Host "  eas.json (APK/AAB)   -> EXPO_PUBLIC_API_URL=http://$ProductionHost/api"
Write-Host "  app.json extra       -> apiUrl http://$ProductionHost/api"
Write-Host ""

Write-Host '[2] Backend health comparison' -ForegroundColor Yellow
$prod = Get-Json "http://$ProductionHost/health"
$local = Get-Json "$LocalApi/health"

if ($prod) {
  $prodFeatures = if ($prod.features) { ($prod.features | ConvertTo-Json -Compress) } else { 'none' }
  Write-Host "  PRODUCTION ($ProductionHost): database=$($prod.database) features=$prodFeatures" -ForegroundColor Green
} else {
  Write-Host "  PRODUCTION ($ProductionHost): UNREACHABLE" -ForegroundColor Red
}

if ($local) {
  $localFeatures = if ($local.features) { ($local.features | ConvertTo-Json -Compress) } else { 'none' }
  Write-Host "  LOCALHOST  (3000): database=$($local.database) features=$localFeatures" -ForegroundColor Green
} else {
  Write-Host "  LOCALHOST  (3000): not running (start with npm start)" -ForegroundColor Yellow
}

if ($prod -and $local) {
  $prodJson = ($prod | ConvertTo-Json -Compress)
  $localJson = ($local | ConvertTo-Json -Compress)
  if ($prodJson -ne $localJson) {
    Write-Host "  DIFF: Production and local backends are NOT the same version." -ForegroundColor Red
  }
}
Write-Host ""

Write-Host '[3] Local backend database' -ForegroundColor Yellow
if (Test-Path 'backend\.env') {
  Select-String -Path 'backend\.env' -Pattern '^(NODE_ENV|DATABASE_URL)=' | ForEach-Object {
    Write-Host "  $(Mask-DbUrl $_.Line)"
  }
} else {
  Write-Host '  backend/.env missing' -ForegroundColor Red
}
Write-Host ""

Write-Host '[4] Git / build freshness' -ForegroundColor Yellow
$changes = (git status --short | Measure-Object).Count
Write-Host "  Uncommitted changed files: $changes"
if ($changes -gt 0) {
  Write-Host '  WARN: EAS cloud builds from Git will NOT include uncommitted files.' -ForegroundColor Red
  git status --short | Select-Object -First 12
  if ($changes -gt 12) { Write-Host "  ... and $($changes - 12) more" }
}
Write-Host ""

Write-Host '[5] Web static cache' -ForegroundColor Yellow
foreach ($entry in @(
  @{ Name = '.web-dist (local API)'; Path = Join-Path $root '.web-dist\index.html' },
  @{ Name = '.web-dist-prod (APK API)'; Path = Join-Path $root '.web-dist-prod\index.html' }
)) {
  if (Test-Path $entry.Path) {
    Write-Host "  $($entry.Name): built $((Get-Item $entry.Path).LastWriteTime)"
  } else {
    Write-Host "  $($entry.Name): not built yet"
  }
}
Write-Host ""

Write-Host '[6] Duplicate config files' -ForegroundColor Yellow
Write-Host '  app.json: root + mobile/ (EAS uses project root app.json when building from root)'
Write-Host '  eas.json: root + mobile/ (keep both in sync)'
Write-Host ""

Write-Host '========== Summary ==========' -ForegroundColor Cyan
Write-Host 'localhost web uses LOCAL backend (localhost:3000) + local backend DB.'
Write-Host "APK/AAB uses PRODUCTION backend ($ProductionHost) + production server DB."
Write-Host 'They will differ until you deploy backend AND rebuild APK from latest code.'
Write-Host ''
Write-Host 'For web preview matching APK: npm run web:prod'
Write-Host 'For fresh APK: npm run build:apk'
