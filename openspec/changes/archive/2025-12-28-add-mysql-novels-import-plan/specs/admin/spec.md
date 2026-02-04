# admin Delta Specification (add-mysql-novels-import-plan)

## ADDED Requirements

### Requirement: Import novels seed CSV into local MySQL with overwrite updates
The system SHALL provide a documented procedure to import the generated novels seed CSV (`backend/sql/novels_mysql.csv`) into a local MySQL database table `novels`, using `source_book_id` as the unique key and overwriting existing rows on conflict.

#### Scenario: Successful one-time import into `novels`
- **GIVEN** a local MySQL 8.x instance is available
- **AND GIVEN** the schema has been created (e.g., by applying `backend/sql/create_tables.sql`)
- **WHEN** an administrator imports `backend/sql/novels_mysql.csv` into `novels`
- **THEN** the import SHALL load rows into `novels` with correct UTF-8 (utf8mb4) decoding
- **AND THEN** the number of rows in `novels` SHOULD match the number of data lines in the CSV

#### Scenario: Re-import overwrites existing rows by `source_book_id`
- **GIVEN** `novels` already contains a row with `source_book_id = X`
- **WHEN** the administrator imports a CSV row whose `source_book_id = X`
- **THEN** the stored row for `X` SHALL be overwritten according to the documented conflict strategy

#### Scenario: Import fails with a clear error when `LOCAL INFILE` is not allowed
- **GIVEN** the import method requires `LOAD DATA LOCAL INFILE`
- **AND GIVEN** the MySQL client/server policy disallows `LOCAL INFILE`
- **WHEN** the administrator attempts the documented import
- **THEN** the system documentation SHALL describe the expected failure mode
- **AND THEN** the documentation SHALL provide at least one workaround (e.g., enabling `local_infile` or using an alternative import method)
