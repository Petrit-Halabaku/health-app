# Vitalis — Clinical-Editorial Redesign of the Health-Data Platform

**Date:** 2026-06-14
**Status:** Approved, building

## Goal
Transform the existing CDC/WHO/Eurostat mortality-data dashboard (React + TS + Vite +
Tailwind + Chart.js) from a generic default-blue UI into an awards-worthy, clinical-editorial
data-journalism platform. Full redesign. Visual "wow" from craft + a lightweight 3D accent +
rich, restrained GSAP motion. Mobile-first; verified with Chrome DevTools.

## Aesthetic direction
Treat the data like an award-winning data-journalism piece (Our World in Data / NYT graphics).
Paper-white canvas, ink typography, one confident categorical data palette, precise motion.

- **Palette:** paper `#F7F7F2`, ink `#0B0F14`, slate mutes, brand **clinical teal** `#0D9488`.
  6-hue categorical data palette is the chart identity (teal / steel-blue / ochre / crimson /
  violet / moss).
- **Type:** Fraunces (editorial display serif) + IBM Plex Sans (clinical body/UI) +
  IBM Plex Mono (tabular data figures, eyebrows/labels). Loaded via Google Fonts w/ preconnect.
- **Texture:** faint film grain + hairline editorial rules + dot/baseline grid; generous
  whitespace, asymmetric editorial layout, oversized display type.

## 3D accent (Three.js, lightweight)
`src/components/Globe.tsx` — monochrome point-cloud globe (ink points on paper) forming a
rotating Earth, a few teal points pulsing as "data signals." Raw `three`, single BufferGeometry
of points, capped DPR, pointer parallax, paused offscreen (IntersectionObserver), reduced
point-count on mobile, static fallback under `prefers-reduced-motion`, disposed on unmount.

## Motion (GSAP + ScrollTrigger)
Scroll-told landing (pinned hero → data-source reveal → CTA), count-up stats, staggered
section/card reveals, chart draw-ins, animated nav active-indicator, tab transitions. All gated
behind `prefers-reduced-motion`; ScrollTriggers killed on unmount via gsap.context.

## Architecture / new modules
- `src/design/tokens.ts` — color tokens + data palette (single source for charts + three).
- `src/design/motion.ts` — GSAP register + reduced-motion helpers + reveal/count-up hooks.
- `src/design/chartTheme.ts` — global Chart.js defaults (fonts, colors, grid, tooltip).
- `src/components/Globe.tsx` — the 3D accent.
- `index.html` / `tailwind.config.js` / `src/index.css` — design-system foundation.

## Files redesigned (full)
LandingPage, App shell, NavBar (mobile-friendly), Filters, MultiSelect, DashboardCard,
DataVisualization, MonthlyTrends, DataSummary, DemographicCharts, MortalityTrends,
LoadingSpinner, ErrorMessage.

## Performance & mobile
Mobile-first, verified responsive (375px+). 3D + motion degrade on small/low-power devices and
under reduced-motion. Capped DPR, offscreen pausing, lazy-mounted 3D. Clean console.

## Verification
Run dev server, check with Chrome DevTools: responsive breakpoints (375 / 768 / 1280),
console clean, no layout overflow, motion + reduced-motion paths, build passes (`npm run build`).

## Out of scope
Data-source changes, new data features, backend. Pure design/UX + motion + 3D layer.
