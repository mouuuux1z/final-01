param(
  [string]$ApiHost = '197.140.142.178'
)

$base = "http://$ApiHost"
Write-Host "Checking MYDoc queue deployment on $base" -ForegroundColor Cyan

function Get-Json {
  param([string]$Url)
  $raw = curl.exe -s $Url
  if (-not $raw) { return $null }
  try {
    return ($raw | ConvertFrom-Json)
  } catch {
    return @{ message = $raw }
  }
}

$health = Get-Json "$base/health"
if (-not $health) {
  Write-Host "FAIL: Cannot reach $base/health" -ForegroundColor Red
  exit 1
}

Write-Host "OK: API health -> database=$($health.database)" -ForegroundColor Green

if ($health.features.liveQueue -eq $true) {
  Write-Host "OK: /health reports liveQueue=true" -ForegroundColor Green
} else {
  Write-Host "WARN: /health does not report liveQueue=true (deploy latest backend + restart)" -ForegroundColor Yellow
}

$queueHealth = Get-Json "$base/api/health/queue"
if ($queueHealth -and $queueHealth.data.liveQueue -eq $true) {
  Write-Host "OK: /api/health/queue is available" -ForegroundColor Green
} else {
  Write-Host "FAIL: /api/health/queue missing (deploy latest backend)" -ForegroundColor Red
}

$doctorQueue = Get-Json "$base/api/doctor/me/queue/today"
$doctorMessage = [string]$doctorQueue.message
if ($doctorMessage -eq 'Authentication required') {
  Write-Host "OK: /api/doctor/me/queue/today is registered" -ForegroundColor Green
} elseif ($doctorMessage -eq 'Route not found') {
  Write-Host "FAIL: /api/doctor/me/queue/today returns Route not found" -ForegroundColor Red
} else {
  Write-Host "INFO: /api/doctor/me/queue/today -> $doctorMessage" -ForegroundColor Yellow
}

$patientQueue = Get-Json "$base/api/appointments/00000000-0000-0000-0000-000000000001/queue-status"
$patientMessage = [string]$patientQueue.message
if ($patientMessage -eq 'Authentication required') {
  Write-Host "OK: /api/appointments/:id/queue-status is registered" -ForegroundColor Green
} elseif ($patientMessage -eq 'Route not found') {
  Write-Host "FAIL: /api/appointments/:id/queue-status returns Route not found" -ForegroundColor Red
} else {
  Write-Host "INFO: /api/appointments/:id/queue-status -> $patientMessage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps if any FAIL:" -ForegroundColor Cyan
Write-Host "1. Upload backend/ to the VPS (must include backend/src/modules/queue)"
Write-Host "2. On server: npm install && npm run db:migrate:deploy && npm run build && restart API"
Write-Host "3. Rebuild APK: npm run build:apk"
