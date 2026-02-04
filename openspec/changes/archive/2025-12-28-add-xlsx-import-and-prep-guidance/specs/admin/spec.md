## ADDED Requirements

### Requirement: Generate MySQL seed CSV from XLS
The system SHALL provide a documented preprocessing workflow to generate a MySQL-importable CSV from the canonical `.xls` source data.

#### Scenario: Preprocessing succeeds
- **GIVEN** an administrator has the canonical `.xls` file in the repository root
- **WHEN** the administrator runs the preprocessing script
- **THEN** the system SHALL output a CSV keyed by `source_book_id(书号)`
- **AND THEN** the output SHALL be importable into the provided MySQL table schema

#### Scenario: Preprocessing fails fast on missing source
- **GIVEN** the canonical `.xls` file is missing
- **WHEN** the administrator runs the preprocessing script
- **THEN** the system SHALL fail with a clear error describing the missing file path
