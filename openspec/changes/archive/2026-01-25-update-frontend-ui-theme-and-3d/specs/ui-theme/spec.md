# ui-theme Specification (Delta)

## Purpose
Define a unified visual system (tokens, typography, contrast rules, ornamentation strategy) that ensures readability, consistency, and a cohesive male-oriented dark-mode aesthetic across all user-facing pages.

## ADDED Requirements

### Requirement: Unified token-driven theme
The system SHALL define a small set of global design tokens (color, typography, spacing, radii, elevation, motion) and SHALL apply them consistently across user-facing pages.

#### Scenario: Token reuse across pages
- **GIVEN** the user navigates between Home, Category, Ranking, Search, and Novel Detail
- **WHEN** the UI renders shared primitives (navigation, cards, buttons, section headers)
- **THEN** the primitives SHALL use the same token set for colors, typography, spacing, and motion

### Requirement: Readability-first typography
The system SHALL prioritize readability by using highly legible fonts for body text and SHALL restrict decorative/calligraphy fonts to logo-level accents only.

#### Scenario: Body text is readable
- **GIVEN** the user opens any page with paragraph text (e.g., novel introduction)
- **WHEN** the content is displayed in dark mode
- **THEN** body text SHALL use the readable body font stack
- **AND THEN** decorative fonts SHALL NOT be used for paragraph content

### Requirement: Contrast and sizing guardrails
The system SHALL ensure secondary and muted text remain readable by enforcing minimum font sizes and sufficient contrast against the background.

#### Scenario: Secondary text remains readable
- **GIVEN** the UI shows metadata (author/category/status)
- **WHEN** the user views the page on a typical laptop or mobile screen
- **THEN** the metadata text SHALL remain legible and not appear washed out

### Requirement: Minimal, consistent ornamentation
The system SHALL avoid multiple competing accents (e.g., heavy glow + strong gradients + noisy textures) and SHALL keep decoration subtle and consistent.

#### Scenario: No competing accents within a component
- **GIVEN** the user hovers a novel card
- **WHEN** hover styles apply
- **THEN** the card SHALL use at most one accent strategy (e.g., border highlight OR subtle glow, not both)

### Requirement: Reduced motion support
The system SHALL respect `prefers-reduced-motion` and SHALL reduce or disable non-essential animations.

#### Scenario: Reduced motion disables flourish animations
- **GIVEN** the user has `prefers-reduced-motion: reduce`
- **WHEN** the user opens the home page
- **THEN** the UI SHALL avoid non-essential animation sequences (staggered reveals, background motion)

### Requirement: Admin UI uses shared tokens
The system SHALL align admin pages to the shared token system for typography and core colors while maintaining clear information hierarchy.

#### Scenario: Admin surface matches theme
- **GIVEN** the user is an admin
- **WHEN** they open admin pages
- **THEN** the admin layout SHOULD use shared background/text tokens and readable typography
