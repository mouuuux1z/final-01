param(
  [switch]$Rebuild
)

& (Join-Path $PSScriptRoot 'serve-web-static.ps1') -Production @PSBoundParameters
