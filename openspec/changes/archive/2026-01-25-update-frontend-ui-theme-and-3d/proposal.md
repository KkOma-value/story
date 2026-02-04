# Change: Unify frontend visual style + add Three.js 3D motion

## Why
The current UI mixes several strong visual motifs (ink textures, glow-heavy accents, calligraphy fonts, external noise/hero images), which makes readability inconsistent and the overall style feel "busy" rather than premium and cohesive.

The project targets a male-oriented web novel audience, where the UI should feel confident, sharp, and readable (especially on dark mode). We also want a clear "dynamic" signature: subtle 3D depth rather than many small visual effects.

## What Changes
- Introduce a cohesive **visual system** (tokens + typography + motion rules) applied across user-facing pages.
- Improve **readability**: contrast, font choices, font sizes, and reduce decorative fonts to accent-only usage.
- Reduce "glow/noise overload": keep a single strong accent strategy (black/gold + restrained red) and remove competing gradients.
- Replace fragile external visuals where possible:
  - Avoid remote noise images and remote hero backgrounds.
  - Prefer local assets or procedural effects.
- Add a **Three.js-based 3D hero** (depth + parallax) as the signature dynamic element.
  - Must be lazy-loaded and optional; it cannot block core content.
  - Must respect `prefers-reduced-motion` and degrade gracefully when WebGL is unavailable.
- Keep scope focused on the frontend (no backend/API changes).

## Impact
- Affected area: `frontend/` (layouts, global styles, Home page, shared components).
- New dependencies: `three` (and optionally a React integration wrapper if selected).
- Requires validation:
  - Frontend build and lint.
  - Basic UI regression checks for all main routes.

## Out of Scope
- Changing backend endpoints or data models.
- Rewriting business logic of recommendations/search.
- Full 3D reader experience (the reader page remains primarily typographic).

## Related Specs
- New capability: `ui-theme`
- New capability: `ui-3d`
