param(
	[string]$MySQLHost = "127.0.0.1",
	[int]$Port = 3306,
	[string]$User = "root",
	[string]$Database = "story",
	[string]$Password = "",
	[string]$SqlFile = "$(Resolve-Path "$PSScriptRoot\create_tables.sql")",
	[string]$CsvFile = "$(Resolve-Path "$PSScriptRoot\novels_mysql.csv")"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SqlFile)) {
	throw "SQL file not found: $SqlFile"
}
if (-not (Test-Path $CsvFile)) {
	throw "CSV file not found: $CsvFile"
}

function Convert-ToMySqlPath([string]$path) {
	return ($path -replace "\\", "/")
}

function Detect-LineTerminator([string]$path) {
	# Best-effort: detect CRLF in the first chunk; default to LF.
	$fs = [System.IO.File]::OpenRead($path)
	try {
		$buf = New-Object byte[] 8192
		$read = $fs.Read($buf, 0, $buf.Length)
		for ($i = 0; $i -lt ($read - 1); $i++) {
			if ($buf[$i] -eq 13 -and $buf[$i + 1] -eq 10) { return "CRLF" }
		}
		return "LF"
	}
	finally {
		$fs.Dispose()
	}
}

$csvMySqlPath = Convert-ToMySqlPath((Resolve-Path $CsvFile).Path)
$lineTermRaw = Detect-LineTerminator((Resolve-Path $CsvFile).Path)
$lineTerm = if ($lineTermRaw -eq "CRLF") { "\r\n" } else { "\n" }

Write-Host "Initializing MySQL database '$Database' on ${MySQLHost}:${Port} as user '$User'" -ForegroundColor Cyan
Write-Host "- DDL: $SqlFile" -ForegroundColor DarkGray
Write-Host "- CSV: $CsvFile" -ForegroundColor DarkGray
Write-Host "- Detected line terminator: $lineTermRaw" -ForegroundColor DarkGray

if ([string]::IsNullOrEmpty($Password)) {
	$secure = Read-Host "MySQL password" -AsSecureString
	$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
	$plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} else {
	$plain = $Password
	$ptr = [IntPtr]::Zero
}

try {
	$env:MYSQL_PWD = $plain

	# Create database (if not exists)
	& mysql --local-infile=1 -h $MySQLHost -P $Port -u $User -e "CREATE DATABASE IF NOT EXISTS ``$Database`` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;" | Out-Null

	# Apply DDL
	Get-Content -Raw $SqlFile | & mysql --local-infile=1 --default-character-set=utf8mb4 -h $MySQLHost -P $Port -u $User $Database

	# Import novels with overwrite semantics
	$importSql = @"
LOAD DATA LOCAL INFILE '$csvMySqlPath'
REPLACE
INTO TABLE novels
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
LINES TERMINATED BY '$lineTerm'
IGNORE 1 LINES
(source_book_id,title,author,category,subcategory,intro,tags_json,favorites_count,views_proxy,word_count,status,updated_at,
 first_day_v,first_day_favorites,first_day_flowers,first_day_reward,first_day_rating,first_day_reviews,first_day_words_k,
 best_rank,worst_rank,total_times);
"@

	& mysql --local-infile=1 --default-character-set=utf8mb4 -h $MySQLHost -P $Port -u $User -D $Database -e $importSql

	Write-Host "Imported novels." -ForegroundColor Green
	& mysql --local-infile=1 -h $MySQLHost -P $Port -u $User -D $Database -e "SELECT COUNT(*) AS novels_count FROM novels;"
	& mysql --local-infile=1 -h $MySQLHost -P $Port -u $User -D $Database -e "SELECT source_book_id,title,author,category,subcategory FROM novels ORDER BY source_book_id LIMIT 5;"
}
finally {
	if (Test-Path Env:MYSQL_PWD) { Remove-Item Env:MYSQL_PWD }
	if ($ptr -ne [IntPtr]::Zero) { 
		[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) 
	}
	# Clear password from memory
	if (-not [string]::IsNullOrEmpty($plain)) {
		$plain = ""
	}
}
