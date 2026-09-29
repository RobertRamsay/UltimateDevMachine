# Requires PowerShell 7. Running this script resets the selected Ultimate device.
[CmdletBinding()]
param(
    [Parameter(Mandatory)][uri]$DeviceUrl,
    [string]$Prg = (Join-Path $PSScriptRoot '..\build\foundation.prg'),
    [switch]$InfoOnly
)
$ErrorActionPreference = 'Stop'
if ($DeviceUrl.Scheme -notin @('http', 'https') -or $DeviceUrl.UserInfo -or $DeviceUrl.Query -or $DeviceUrl.AbsolutePath -ne '/') {
    throw 'DeviceUrl must be an HTTP(S) origin, such as http://192.168.1.20/.'
}
$headers = @{}
if ($env:ULTIMATE_NETWORK_PASSWORD) { $headers['X-Password'] = $env:ULTIMATE_NETWORK_PASSWORD }
$info = Invoke-RestMethod -Uri ([uri]::new($DeviceUrl, '/v1/info')) -Headers $headers -TimeoutSec 15
if ($null -eq $info.errors -or @($info.errors).Count -gt 0) { throw 'Device information request failed.' }
$info | Select-Object product, firmware_version, fpga_version, core_version
if ($InfoOnly) { return }
$resolvedPrg = (Resolve-Path -LiteralPath $Prg).Path
$bytes = [IO.File]::ReadAllBytes($resolvedPrg)
if ($bytes.Length -lt 14 -or $bytes[0] -ne 1 -or $bytes[1] -ne 8) { throw 'Expected a BASIC-start PRG at $0801.' }
$reply = Invoke-RestMethod -Method Post -Uri ([uri]::new($DeviceUrl, '/v1/runners:run_prg')) -Headers $headers -Form @{ file = Get-Item -LiteralPath $resolvedPrg } -TimeoutSec 30
if ($null -eq $reply.errors -or @($reply.errors).Count -gt 0) { throw ('Ultimate rejected the PRG: ' + ($reply.errors -join '; ')) }
Write-Output 'PRG transferred and started. Read diagnostic results on the C64 display.'
