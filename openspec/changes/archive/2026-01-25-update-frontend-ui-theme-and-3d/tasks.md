# Tasks: Unify frontend visual style + add Three.js 3D motion

## 1. Visual System (Tokens + Typography)
- [ ] Define a single aesthetic direction ("Black-Gold Library" / 男频简约黑金书阁) and document it in `design.md`.
- [ ] Create a token plan:
  - [ ] Colors (background, surface, border, text, accent, danger)
  - [ ] Typography scale (H1/H2/H3/body/caption)
  - [ ] Spacing + radii + elevation
  - [ ] Motion durations/easings
- [ ] Update Tailwind/AntD theme usage to align with the new tokens.
- [ ] Replace readability-problematic fonts:
  - [ ] Restrict calligraphy fonts to logos/short labels only
  - [ ] Ensure body text uses a highly readable CN font stack
- [ ] Add a contrast/readability checklist (min contrast, minimum font sizes).

## 2. Apply Unified Style Across Pages
- [ ] Unify layout shell:
  - [ ] Header/nav states, hover/focus/active
  - [ ] Content container widths and vertical rhythm
  - [ ] Footer typography and separators
- [ ] Normalize common components:
  - [ ] Buttons (primary/secondary/ghost)
  - [ ] Cards (default/list/horizontal)
  - [ ] Section headers and empty/loading states
- [ ] Apply changes to main user routes:
  - [ ] Home
  - [ ] Category
  - [ ] Ranking
  - [ ] Search
  - [ ] Novel detail
  - [ ] Auth pages (login/register/reset)
- [ ] Admin UI alignment (minimal): bring colors/typography into the same token system while preserving admin clarity.

## 3. Three.js 3D Signature Motion
- [ ] Decide the integration approach:
  - [ ] Option A: direct `three` + imperative canvas management
  - [ ] Option B (recommended): `three` + `@react-three/fiber` for React lifecycle safety
- [ ] Define the 3D hero spec:
  - [ ] Visual concept: a restrained 3D seal/book-page/ink swirl with parallax depth
  - [ ] Interaction: subtle mouse/touch parallax only (no distracting continuous spin)
  - [ ] Accessibility: `prefers-reduced-motion` disables animation
  - [ ] Fallback: static background when WebGL unsupported
- [ ] Implement as lazy-loaded chunk and render only on Home hero.
- [ ] Add performance guards:
  - [ ] Pause rendering when tab hidden or component offscreen
  - [ ] Cap DPR and geometry complexity

## 4. QA / Validation
- [ ] Run `npm run build` and `npm run lint` in `frontend/`.
- [ ] Add/adjust Vitest tests for:
  - [ ] Home page renders without 3D (fallback path)
  - [ ] Reduced motion mode disables animation path
- [ ] Manual smoke test checklist:
  - [ ] All key routes render correctly on mobile + desktop
  - [ ] Font readability on dark background
  - [ ] 3D hero loads, does not block first render, and has a fallback
