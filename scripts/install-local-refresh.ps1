param([string]$Python = 'D:\anaconda\pythonw.exe')
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path -LiteralPath $Python)) { throw "Python executable missing: $Python" }
$runner = Join-Path $PSScriptRoot 'refresh_jobs_local.py'
$action = New-ScheduledTaskAction -Execute $Python -Argument ('"' + $runner + '"') -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Hours 6)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 20) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'ResumeWorkshopRecruitmentRefresh' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Refresh local recruitment sources every six hours while signed in.' -Force
