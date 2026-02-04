# Design: Unified UI theme + Three.js 3D hero

## Context
Current UI already leans toward a "mystic ink" dark theme but suffers from:
- too many competing decorative elements (glows, gradients, textures)
- readability issues (decorative fonts used too broadly, low-contrast muted text)
- reliance on external images/textures (stability + consistency issues)

We will reframe the UI into a single intentional direction and use **one signature motion element** (3D hero) instead of scattered effects.

## Aesthetic Direction (男频简约)
**Concept:** "Black-Gold Library" / 黑金书阁
- Base: deep charcoal/ink black surfaces (calm, high contrast)
- Accent: restrained gold for highlights (VIP/primary)
- Action/danger: controlled cinnabar red (CTAs / hot)
- Typography: editorial-feeling headings + very readable body
- Ornament: minimal, used as separators/texture at low opacity

Key principle: **Readability first, atmosphere second.**

## Token System
We will define a small, strict token set and reuse it everywhere.

### Color tokens
- `bg/base`, `bg/surface`, `bg/raised`
- `border/subtle`, `border/strong`
- `text/primary`, `text/secondary`, `text/muted`
- `accent/gold`, `accent/goldSoft`
- `action/red`, `action/redSoft`

Rules:
- Only one primary accent used per component.
- Remove purple as a primary accent for the male-oriented direction (keep only if explicitly needed later).

### Typography
- **Display**: used for H1/H2 and short nav labels only.
- **Body**: CN serif/sans for paragraph reading; ensure line-height and tracking are stable.

Rules:
- Calligraphy font only for logo/short seal-like stamps.
- Body text never uses calligraphy.
- Minimum font size for secondary text: 12–13px (mobile), 13–14px (desktop).

### Motion
- One orchestrated page-load reveal (staggered sections) and one hero 3D depth.
- Use `prefers-reduced-motion` to disable non-essential animations.

## Three.js 3D Hero
### Placement
Home page hero only (as the signature dynamic element). Other pages remain typographic and fast.

### Interaction model
- Subtle parallax: camera or group offset based on pointer position.
- No constant spinning by default (avoid distracting users).
- Optional slow idle motion ONLY when reduced-motion is not requested.

### Implementation approach
Two viable approaches:
- **A. Direct Three.js**: minimal deps, more manual lifecycle management.
- **B. `@react-three/fiber`** (recommended): React-friendly scene lifecycle, cleaner composition.

We will still satisfy the requirement "introduce Three.js" either way (both use `three`).

### Performance & reliability requirements
- Lazy-load the 3D chunk (dynamic import). The Home page must render content before 3D resolves.
- Cap DPR (e.g., `Math.min(devicePixelRatio, 1.5)`), keep geometry low-poly, avoid heavy postprocessing.
- Pause rendering when:
  - page is hidden (`visibilitychange`)
  - hero is offscreen (IntersectionObserver)
- Fallback path:
  - WebGL unavailable → static hero background
  - reduced motion → static hero background or frozen scene

### Asset policy
Avoid remote textures/images for core visuals.
- Prefer local assets under `frontend/src/assets/`.
- Prefer procedural gradients/noise when possible.

## Risks & Mitigations
- Risk: 3D increases bundle size and hurts first paint.
  - Mitigation: code-split + deferred load + offscreen pause.
- Risk: readability regressions when changing typography.
  - Mitigation: explicit typography scale + contrast checklist + screenshot/manual review.
- Risk: inconsistent theme application across pages.
  - Mitigation: token-first refactor + shared component primitives.
