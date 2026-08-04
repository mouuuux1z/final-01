$ports = 3000, 8081, 8082
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      cmd /c "taskkill /F /T /PID $($_.OwningProcess) 2>nul"
    }
}
Start-Sleep -Seconds 2
Write-Host "Ports 3000, 8081, and 8082 cleared."
