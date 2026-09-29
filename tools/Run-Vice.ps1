[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$VicePath,
    [string]$Prg = (Join-Path $PSScriptRoot '..\build\foundation.prg')
)
$ErrorActionPreference = 'Stop'
$resolvedVice = (Resolve-Path -LiteralPath $VicePath).Path
$resolvedPrg = (Resolve-Path -LiteralPath $Prg).Path
# Configure an REU in VICE's settings for the positive test; disable for the
# negative test. No assumption is made about Ultimate turbo emulation.
& $resolvedVice -autostart $resolvedPrg
if ($LASTEXITCODE -ne 0) { throw "VICE exited with code $LASTEXITCODE" }
