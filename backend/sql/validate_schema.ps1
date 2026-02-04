param(
	[string]$Host = "127.0.0.1",
	[int]$Port = 3306,
	[string]$User = "root",
	[string]$Database = "story_schema_test",
	[string]$SqlFile = "$(Resolve-Path "$PSScriptRoot\\create_tables.sql")"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SqlFile)) {
	throw "SQL file not found: $SqlFile"
}

Write-Host "Validating MySQL schema in database '$Database' on $Host:$Port as user '$User'" -ForegroundColor Cyan

$secure = Read-Host "MySQL password" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
	$plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
	$env:MYSQL_PWD = $plain

	& mysql -h $Host -P $Port -u $User -e "CREATE DATABASE IF NOT EXISTS `$Database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;" | Out-Null

	# Apply DDL
	Get-Content -Raw $SqlFile | & mysql -h $Host -P $Port -u $User $Database

	Write-Host "Tables:" -ForegroundColor Cyan
	& mysql -h $Host -P $Port -u $User -D $Database -e "SHOW TABLES;"

	Write-Host "FK/constraints sample (favorites):" -ForegroundColor Cyan
	& mysql -h $Host -P $Port -u $User -D $Database -e "SHOW CREATE TABLE favorites;"

	Write-Host "Schema validation completed." -ForegroundColor Green
}
finally {
	if (Test-Path Env:MYSQL_PWD) { Remove-Item Env:MYSQL_PWD }
	if ($ptr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
