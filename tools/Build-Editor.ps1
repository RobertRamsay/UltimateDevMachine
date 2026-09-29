[CmdletBinding()]
param(
    [string]$RuntimePath = 'C:\ProgramData\GameMakerStudio2-LTS2026\Cache\runtimes\runtime-2026.0.0.23',
    [string]$ProjectTool = 'C:\Program Files\GameMaker-LTS2026\packages\gm-tools\project-tool-win-x64\ProjectTool.exe',
    [string]$UserFolder
)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$igor = Join-Path $RuntimePath 'bin\igor\windows\x64\Igor.exe'
$arguments = @(
    "--rp=$RuntimePath", "--pt=$ProjectTool", "--project=$projectRoot\UltimateDevMachine.yyp",
    '--runtime=VM', "--cache=$projectRoot\build\gm-cache", "--temp=$projectRoot\build\gm-temp",
    "--of=$projectRoot\build\foundation.win", '--target=Windows|Local'
)
if ($UserFolder) { $arguments += "--user=$UserFolder" }
& $igor @arguments windows Compile
if ($LASTEXITCODE -ne 0) { throw "Editor compilation failed ($LASTEXITCODE)." }
