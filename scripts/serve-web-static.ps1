param(
  [switch]$Rebuild,
  [switch]$Production
)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$distDir = if ($Production) {
  Join-Path $root '.web-dist-prod'
} else {
  Join-Path $root '.web-dist'
}

$env:EXPO_NO_TELEMETRY = '1'
$env:EXPO_OFFLINE = '1'
$env:NODE_OPTIONS = '--dns-result-order=ipv4first'
Remove-Item Env:CI -ErrorAction SilentlyContinue

if ($Production) {
  Remove-Item Env:EXPO_PUBLIC_USE_LOCAL_BACKEND -ErrorAction SilentlyContinue
  $env:EXPO_PUBLIC_API_URL = 'http://197.140.142.178/api'
  $env:EXPO_PUBLIC_SOCKET_URL = 'http://197.140.142.178'
  $env:EXPO_PUBLIC_APP_TZ_OFFSET_MINUTES = '60'
  Write-Host '[web] Production parity mode — API same as APK/AAB' -ForegroundColor Cyan
} else {
  $env:EXPO_PUBLIC_USE_LOCAL_BACKEND = 'true'
  $env:EXPO_PUBLIC_API_URL = 'http://localhost:3000/api'
  $env:EXPO_PUBLIC_SOCKET_URL = 'http://localhost:3000'
  Write-Host '[web] Local dev mode — API http://localhost:3000/api' -ForegroundColor Cyan
}

Write-Host "[web] EXPO_PUBLIC_API_URL=$($env:EXPO_PUBLIC_API_URL)"
Write-Host "[web] Output dir: $distDir"

foreach ($port in 8081, 8082) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      cmd /c "taskkill /F /T /PID $($_.OwningProcess) 2>nul"
    }
}

function Get-LatestWriteTime {
  param([string]$Path)
  if (-not (Test-Path $Path)) {
    return [datetime]::MinValue
  }
  $latest = Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($null -eq $latest) {
    return (Get-Item $Path).LastWriteTime
  }
  return $latest.LastWriteTime
}

$builtIndex = Join-Path $distDir 'index.html'
$sourceRoot = Join-Path $root 'mobile\src'
$sourceChanged = (Test-Path $builtIndex) -and (Get-LatestWriteTime $sourceRoot) -gt (Get-Item $builtIndex).LastWriteTime
$needsBuild = $Rebuild -or -not (Test-Path $builtIndex) -or $sourceChanged

if ($sourceChanged -and -not $Rebuild) {
  Write-Host '[web] Source changed since last build — rebuilding...'
}

if ($needsBuild) {
  Write-Host '[web] Building web app (one-time, ~2-3 min on OneDrive)...'
  if (Test-Path $distDir) {
    Remove-Item -Recurse -Force $distDir
  }
  & npx expo export --platform web --output-dir $distDir
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[web] Build failed.'
    exit 1
  }
  Write-Host '[web] Build complete.'
} else {
  Write-Host '[web] Using existing build (run with -Rebuild to refresh).'
}

Write-Host '[web] Serving on http://localhost:8082'

$openJob = Start-Job -ScriptBlock {
  Start-Sleep -Seconds 2
  $cmd = "powershell -Command ""Start-Process 'http://localhost:8082'"""
  cmd /c $cmd
}

try {
  & npx serve $distDir -l 8082
} finally {
  Stop-Job $openJob -ErrorAction SilentlyContinue
  Remove-Job $openJob -Force -ErrorAction SilentlyContinue
}
