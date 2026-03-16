# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
npm run dev       # Start local dev server (port 4321)
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
```

## Architecture

Static portfolio site built with **Astro v5**, **Tailwind CSS v4**, and **TypeScript**. No CMS — all content lives in Markdown files in `src/content/`.

### Routing

| URL | File | Notes |
|-----|------|-------|
| `/` | `index.astro` | Work listing, grouped by Brand / Physical / Digital |
| `/about` | `about.astro` | Bio + draggable portrait strip |
| `/playground` | `playground.astro` | Side projects listing |
| `/playlists` | `playlists.astro` | Music / playlist embeds |
| `/work/[slug]` | `work/[...slug].astro` | Work detail, static via `getStaticPaths()` |
| `/grid-concept` | `grid-concept.astro` | Experimental layout (not in nav) |

### Content Collections

Defined in `src/content/config.ts` with Zod schemas. Stored as Markdown + YAML frontmatter.

**`src/content/work/`** — portfolio case studies
- `title`, `description`, `publishedAt`, `featured`, `cover` (string path), `tags[]`, `role`, `company`, `year`

**`src/content/projects/`** — side projects / playground
- `title`, `description`, `publishedAt`, `featured`, `cover` (string path), `tags[]`, `url`, `github`

Cover images are string paths pointing to files in `public/` (e.g. `/images/projects/project1.webp`).

---

## Layout & Page Structure

### Single root layout: `src/layouts/Layout.astro`

Every page uses this layout (~113 lines — keep it lean). It handles:
- `<html>` shell, `<head>` meta tags, View Transitions
- Dark mode inline `is:inline` script (runs before paint)
- Lenis smooth scroll init + `scroll-to-top` custom event listener
- 12-column grid: `grid-template-columns: repeat(12, 1fr)` with `gap: 20px`
- `<Sidebar currentPath={pathname}>` in cols 1–3
- `<Cursor />` (site-wide custom cursor)
- `<slot />` for page content in cols 4–12
- `<Footer />` full-bleed below the grid
- `<Analytics />` (Vercel)

Props: `title?` (string), `description?` (string).

### Standard page template

```astro
---
import Layout from '../layouts/Layout.astro';
import MainContent from '../components/MainContent.astro';
import PageTitle from '../components/PageTitle.astro';
---
<Layout title="Page Name — Jeff Herrera">
  <MainContent>
    <PageTitle title="Page Name" />
    <!-- page content -->
  </MainContent>
</Layout>
```

### `MainContent.astro`

Wrapper at `grid-column: 4 / -1`. Has `margin-right: 40px` and `padding-bottom: 80px`.

**Mobile**: `grid-column: 1 / -1`, `padding: 0 20px`, and critically **`min-width: 0`** to prevent CSS Grid min-content expansion beyond the viewport.

### `.row` utility (global CSS)

9-column subgrid with `gap: 20px`. Used inside `<MainContent>` for two-column layouts.

```html
<div class="page-inner row">
  <div style="grid-column: 1/6">body text</div>
  <div style="grid-column: 8/-1">sidebar content</div>
</div>
```

---

## Components

All components live in `src/components/`.

### `<Sidebar>` — `src/components/Sidebar.astro`

Sticky left column (cols 1–3, `height: 100vh`, `padding: 40px 0 40px 40px`). Contains:
- `<Logo />` (SVG) — wrapped in `<a href="/" aria-label="Home">` (aria-label required; Astro can't traverse into SVG components for a11y)
- Primary nav (`Work`, `About`, `Playground`, `Playlists`)
- Social links ("Let's Talk")
- "Selected Work" sub-nav — **home page only**, fades in on scroll via JS
- Back-to-top button — **home page only**, appears at 40% scroll depth

**Active nav link**: `color: var(--color-orange-500)` + 5px orange `::before` dot at `left: -10px`.

**Back-to-top**: dispatches `new CustomEvent('scroll-to-top')` on click — **do not use `window.scrollTo()`** directly, it conflicts with Lenis. Layout.astro catches this event and calls `lenis.scrollTo(0)`.

**Mobile menu**: full-screen orange-500 overlay with circular clip-path reveal. When open:
- `html.menu-open` class is added to `<html>` — use this as a CSS hook in other components
- `document.body.style.overflow = 'hidden'`
- Mobile social links are orange-50 on orange-500 bg — **no hover color change** (removed)

Props: `currentPath?` (string) — passed automatically by `Layout.astro`.

### `<MainContent>` — `src/components/MainContent.astro`

Grid placement wrapper. No props. Always wrap page body in this. Has `min-width: 0` on mobile.

### `<PageTitle>` — `src/components/PageTitle.astro`

```astro
<PageTitle title="About" />
<PageTitle title="Playground" subtitle="Side experiments and tools." />
```

- Title: `var(--font-fragment)`, 56px, `var(--color-orange-950)`, OpenType (`dlig`, `ss03`, `ss04`)
- Subtitle: `var(--font-uncut)`, 16px, `var(--color-taupe-400)`
- Baked-in: `margin-top: 112px`, `margin-bottom: 80px`

**Do not use in `work/[...slug].astro`** — that page has a local `<h1 class="work-title">` at 48px with its own spacing.

### `<Footer>` — `src/components/Footer.astro`

Extracted from Layout. Contains:
- Full `<footer class="site-footer">` HTML
- `initFooterEffects` script (word parallax + magnetic CTA)
- All footer CSS (desktop + mobile)
- Mobile orange glow: `::before` pseudo on `.footer-hero`, `opacity: 0.75`, `filter: blur(30px)`, `position: relative` on parent

Included once via Layout.astro — do not add to individual pages.

### `<Cursor>` — `src/components/Cursor.astro`

Site-wide custom cursor for pointer devices only. Elements of interest:
- `#cursor-dot` — 12px orange-500 dot, always visible on pointer devices
- `#cursor-ring` — currently unused (opacity: 0, no rule makes it visible)
- `#cursor-pill` — expands to labeled capsule when hovering `[data-cursor-label]`
- `#cursor-drag` — SVG drag hand, shown on `[data-cursor-type="drag"]`

**LERP = 0.35** (snappy). Change this value to tune cursor lag.

**Hover states** (dot → hollow ring): `#cursor.is-hovering:not(.has-label):not(.is-drag) #cursor-dot` — `background: transparent; border-color: orange-500`.

**Mobile menu override** (`html.menu-open`):
```css
:global(html.menu-open #cursor-dot) { background: var(--color-orange-50); }
:global(html.menu-open #cursor.is-hovering:not(.has-label):not(.is-drag) #cursor-dot) {
  background: transparent;
  border-color: var(--color-orange-50) !important; /* !important beats scoped rule */
}
```

Use `data-cursor-label="View Project"` on links. Use `data-cursor-type="drag"` on draggable elements.

### `<Logo>` — `src/components/Logo.astro`

SVG logo with `aria-label="Jeff Herrera"`. Has `.logo-outer` and `.logo-inner` classes for CSS color targeting. When wrapping in an anchor, **always add `aria-label` to the anchor** — Astro's a11y checker doesn't traverse components.

### `<Tag>` — `src/components/Tag.astro`

```astro
<Tag label="Brand" />
```

`var(--font-uncut)`, 11px, `var(--color-taupe-400)` text, `var(--color-cream)` bg. Padding: `4px 10px`, `border-radius: 999px`.

### `<ThemeToggle>` — `src/components/ThemeToggle.astro`

Click handler only — theme init is in Layout.astro's `is:inline` script. Re-attaches on `astro:after-swap`.

### `<Analytics>` — `src/components/Analytics.astro`

Vercel Analytics. Included once via Layout — do not add to pages.

---

## Smooth Scroll (Lenis)

Lenis is initialised in `Layout.astro`. The instance is module-scoped so it persists across view transitions.

**Never call `window.scrollTo()` from components** — it conflicts with Lenis's RAF loop. Instead, dispatch a custom event:

```javascript
// In any component:
document.dispatchEvent(new CustomEvent('scroll-to-top'));

// Layout.astro catches it:
document.addEventListener('scroll-to-top', () => { lenis?.scrollTo(0); });
```

---

## Images

**Always use `<Image>` from `astro:assets`** — never plain `<img>`. Import at the top of the frontmatter:

```astro
import { Image } from 'astro:assets';
```

Rules:
- Images in `public/` need explicit `width` and `height` (Astro can't infer them)
- `<Image>` adds `loading="lazy"` and `decoding="async"` by default
- **Above-the-fold images must have `loading="eager"`** — Astro DevToolbar flags this as "Unoptimized loading attribute"
- `alt=""` + `aria-hidden="true"` for purely decorative images

Reference dimensions by context:
| Context | width | height | loading |
|---------|-------|--------|---------|
| Portrait strip (about) | 420 | 560 | eager |
| Hero portrait pill (index) | 300 | 375 | eager |
| Project card wide (index first) | 800 | 500 | eager |
| Project card half (index rest) | 400 | 400 | lazy |
| Work detail cover | 760 | 480 | eager |
| Playground covers | 600 | 338 | lazy |

---

## Design Tokens

All tokens in `src/styles/global.css` inside `@theme {}`. **Always use `var(--token-name)` — never hardcode hex values or font strings.**

### Colors

| Token | Approx hex | Usage |
|-------|-----------|-------|
| `--color-cream` | `#eee5dd` | Page background |
| `--color-orange-50` | `#fff7ed` | Light text on orange bg (footer, mobile menu) |
| `--color-orange-500` | `#ff6900` | Primary accent — active states, CTAs, links |
| `--color-orange-700` | ~`#c2410c` | Mobile menu "Let's Talk" label |
| `--color-orange-900` | `#8b2f0c` | Footer gradient start |
| `--color-orange-950` | `#441306` | Primary dark text and UI elements |
| `--color-taupe-300` | `#d9d2d0` | Image placeholders, muted backgrounds |
| `--color-taupe-400` | `#ada09c` | Secondary / muted text, labels |
| `--color-taupe-500` | `#7e6d66` | Body copy (about page) |

The zinc scale (`--color-zinc-50` → `--color-zinc-950`) is **reserved for dark mode**. Do not use for light-mode UI.

### Fonts

| Token | Stack | Usage |
|-------|-------|-------|
| `--font-uncut` | `'Uncut Sans', system-ui, sans-serif` | UI text, labels, nav, body copy |
| `--font-fragment` | `'PP Fragment', Georgia, serif` | Headings, page titles, display text |

Font files in `/public/fonts/`. Do not add other named fonts as fallbacks.

---

## Mobile Layout (≤ 1023px)

The breakpoint is `@media (max-width: 1023px)` throughout.

Key mobile behaviors:
- **Desktop sidebar hidden** (`display: none`) — replaced by fixed `mobile-header` bar + full-screen overlay
- **MainContent** goes `grid-column: 1 / -1` with `padding: 0 20px` and `min-width: 0`
- **Page-level grids** (`.row`) collapse to single column
- **Full-bleed elements** inside MainContent: use `width: calc(100% + 20px)` to extend to the right viewport edge from the 20px left padding — **never use `width: 100vw` + `margin-left: -20px`**, that causes grid expansion beyond 375px
- `min-width: 0` on grid items prevents CSS Grid min-content from expanding the 1fr track

Mobile menu CSS hook: `html.menu-open` (added by Sidebar.astro's `openMenu()`).

---

## Dark Mode

**Infrastructure in place; color tokens not yet defined. Do not implement unless asked.**

Existing (do not remove):
- `is:inline` script in `Layout.astro` — reads `localStorage('theme')`, applies `.dark` to `<html>` before paint
- `<ThemeToggle>` in sidebar — click handler only
- `--color-zinc-*` scale in `global.css`

---

## Styling Conventions

### Scoped styles

Use `<style>` in `.astro` files (Astro scopes automatically). Only add to `global.css` for truly site-wide rules — currently `.row` only.

### Cross-component CSS

To style child component elements from a parent's `<style>` block, use `:global()`:

```css
/* Target Logo SVG paths from Sidebar.astro */
.mobile-header :global(.logo-outer) { fill: var(--color-orange-50); }

/* Target cursor from Cursor.astro when html has .menu-open */
:global(html.menu-open #cursor-dot) { background: var(--color-orange-50); }
```

**Specificity gotcha**: `:global()` rules are emitted before scoped rules. If a scoped rule has equal specificity and appears later in source order, it wins. Add `!important` on the override property when this occurs.

### View Transitions — always clean up listeners

```javascript
function init() {
  const handler = () => { /* ... */ };
  window.addEventListener('scroll', handler, { passive: true });
  document.addEventListener('astro:before-swap', () => {
    window.removeEventListener('scroll', handler);
  }, { once: true });
}
init();
document.addEventListener('astro:after-swap', init);
```

---

## Sidebar Scroll Behaviour (Home Page Only)

"Selected Work" sub-nav and back-to-top button are home-only (`isHome = currentPath === '/'`).

Scroll observer lives in `src/pages/index.astro` (`initWorkNavScroll`):
1. Caches `.work-sections` absolute top once (getBoundingClientRect + scrollY)
2. Passive scroll listener compares `window.scrollY` to trigger point
3. Work nav: fades in when 200px past `.work-sections` top
4. Back-to-top: latches visible at 40% scroll depth, hides again below 40%

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/layouts/Layout.astro` | Root layout — grid, Lenis init, scroll-to-top event, dark mode script |
| `src/styles/global.css` | Tailwind v4, `@theme {}` tokens, `.row` utility |
| `src/content/config.ts` | Zod schemas for content collections |
| `astro.config.mjs` | Astro config (Tailwind via `@tailwindcss/vite`, static output) |
| `src/components/Sidebar.astro` | Desktop sidebar + mobile header/menu overlay |
| `src/components/Footer.astro` | Full footer — HTML, parallax/magnetic script, all footer CSS |
| `src/components/Cursor.astro` | Custom cursor — dot, pill label, drag SVG, LERP animation |
| `src/components/Logo.astro` | Brand mark SVG with `.logo-outer` / `.logo-inner` classes |
| `src/components/MainContent.astro` | `grid-column: 4/-1` wrapper (mobile: full-width + min-width:0) |
| `src/components/PageTitle.astro` | Serif h1 + subtitle (112px top margin) |
| `src/components/Tag.astro` | Cream pill label |
| `src/components/ThemeToggle.astro` | Dark/light click handler |
| `src/components/Analytics.astro` | Vercel Analytics |

---

## Git Workflow

**Always push to `master` (main branch).** Do not create feature branches unless explicitly asked. If on a feature branch, merge to master before pushing.

---

## Deployment

Static (`output: "static"`), deployed to Vercel. No SSR adapter. Vercel Analytics via `<Analytics />` in Layout.
