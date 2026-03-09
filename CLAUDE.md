# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server (port 4321)
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
```

## Architecture

Static portfolio site built with **Astro v5**, **Tailwind CSS v4**, and **TypeScript**. No CMS — all content lives in Markdown files in `src/content/`.

### Routing

File-based routing in `src/pages/`:

| URL | File | Notes |
|-----|------|-------|
| `/` | `index.astro` | Work listing, grouped by Brand / Physical / Digital |
| `/about` | `about.astro` | Bio + capabilities |
| `/playground` | `playground.astro` | Side projects listing |
| `/playlists` | `playlists.astro` | Music / playlist embeds |
| `/work/[slug]` | `work/[...slug].astro` | Work detail, static via `getStaticPaths()` |

### Content Collections

Defined in `src/content/config.ts` with Zod schemas. Stored as Markdown + YAML frontmatter.

**`src/content/work/`** — portfolio case studies
- `title`, `description`, `publishedAt`, `featured`, `cover`, `tags[]`, `role`, `company`, `year`

**`src/content/projects/`** — side projects / playground
- `title`, `description`, `publishedAt`, `featured`, `cover`, `tags[]`, `url`, `github`

---

## Layout & Page Structure

### Single root layout: `src/layouts/Layout.astro`

Every page uses this one layout. It handles:
- `<html>` shell, `<head>` meta tags, View Transitions
- Dark mode inline script (runs before paint — see Dark Mode section)
- 12-column grid: `grid-template-columns: repeat(12, 1fr)` with `gap: 20px`
- `<Sidebar>` rendered in cols 1–3
- `<slot />` for page content
- Full-bleed `<footer>` below the grid
- `<Analytics />` (Vercel)

Props: `title?` (string), `description?` (string) — both have sensible defaults.

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

Wrapper that occupies `grid-column: 4 / -1` (cols 4–12). Every page uses it. Has `margin-right: 40px` and `padding-bottom: 80px`.

### `.row` utility (global CSS)

9-column subgrid with `gap: 20px`. Used inside `<MainContent>` for two-column layouts (e.g. `about.astro` body/sidebar split).

```html
<div class="page-inner row">
  <div style="grid-column: 1/6">...</div>
  <div style="grid-column: 8/-1">...</div>
</div>
```

---

## Components

All components live in `src/components/`. Treat the descriptions below as definitive — match their APIs exactly.

### `<Sidebar>` — `src/components/Sidebar.astro`

Sticky left column (cols 1–3, `height: 100vh`, `padding: 40px 0 40px 40px`). Contains:
- Logo (SVG, links to `/`)
- Primary nav (`Work`, `About`, `Playground`, `Playlists`)
- Social links section ("Let's Talk")
- "Selected Work" sub-nav — **only on home page**, starts at `opacity: 0`, fades in via JS scroll observer
- `<ThemeToggle>` pinned to bottom with `margin-top: auto`

**Active nav link**: gets `color: var(--color-orange-500)` and a 5px orange `::before` dot (`left: -10px`, vertically centered). No separate DOM element for the dot.

Props: `currentPath?` (string) — passed automatically by `Layout.astro`.

### `<MainContent>` — `src/components/MainContent.astro`

Grid placement wrapper (`grid-column: 4 / -1`). No props. Always wrap page body content in this.

### `<PageTitle>` — `src/components/PageTitle.astro`

Serif section heading with optional subtitle.

```astro
<PageTitle title="About" />
<PageTitle title="Playground" subtitle="Side experiments and tools." />
```

- Title: `var(--font-fragment)`, 56px, `var(--color-orange-950)`, OpenType features (`dlig`, `ss03`, `ss04`)
- Subtitle: `var(--font-uncut)`, 16px, `var(--color-taupe-400)`, 10px gap below title
- Block has `margin-top: 112px` and `margin-bottom: 80px` baked in

**Exception — do not use `<PageTitle>` in `work/[...slug].astro`**: the work detail page has a local `<h1 class="work-title">` at 48px with 60px top padding and a back-link above. Forcing `<PageTitle>` would break the spacing. This is intentional.

### `<Tag>` — `src/components/Tag.astro`

Pill label for content tags.

```astro
<Tag label="Brand" />
```

- `var(--font-uncut)`, 11px, `var(--color-taupe-400)` text, `var(--color-cream)` background
- Padding: `4px 10px`, `border-radius: 999px`
- Used in `playground.astro` and `work/[...slug].astro`

### `<ThemeToggle>` — `src/components/ThemeToggle.astro`

Moon/sun icon button. Handles only the click interaction — theme initialisation is done by the `is:inline` script in `Layout.astro`. Re-attaches its click listener on `astro:after-swap`. Rendered inside `<Sidebar>`.

### `<Analytics>` — `src/components/Analytics.astro`

Vercel Analytics injection. Included automatically via `Layout.astro`; do not add it to individual pages.

---

## Design Tokens

All tokens are defined in `src/styles/global.css` inside `@theme {}`. Available as both Tailwind utilities and CSS `var()` references.

**Always use `var(--token-name)` — never hardcode hex values or font-family strings.**

### Colors

| Token | Approx hex | Usage |
|-------|-----------|-------|
| `--color-cream` | `#eee5dd` | Page background (`.page-root`) |
| `--color-orange-50` | `#fff7ed` | Footer text / light surfaces on dark bg |
| `--color-orange-500` | `#ff6900` | Primary accent — active states, CTAs, links, hover |
| `--color-orange-900` | `#8b2f0c` | Footer gradient start color |
| `--color-orange-950` | `#441306` | Primary dark text and UI elements |
| `--color-taupe-300` | `#d9d2d0` | Image placeholders, muted backgrounds |
| `--color-taupe-400` | `#ada09c` | Secondary / muted text, labels |
| `--color-taupe-500` | `#7e6d66` | Body copy (about page) |

The zinc scale (`--color-zinc-50` → `--color-zinc-950`) is defined and **reserved for future dark mode work**. Do not use zinc tokens for new light-mode UI.

### Fonts

| Token | Stack | Usage |
|-------|-------|-------|
| `--font-uncut` | `'Uncut Sans', system-ui, sans-serif` | UI text, labels, nav, body copy |
| `--font-fragment` | `'PP Fragment', Georgia, serif` | Headings, page titles, display text |

Font files go in `/public/fonts/` with `@font-face` declarations. System fallbacks are active until commercial files are added. Do not add other named fonts (e.g. Barlow Condensed, Fraunces) as fallbacks.

---

## Dark Mode

**Infrastructure is in place; dark-mode color tokens are not yet defined. Do not implement dark mode UI unless explicitly asked.**

What already exists and must not be removed:
- `is:inline` script in `Layout.astro` — reads `localStorage` (`'theme'` key), applies/removes `.dark` on `<html>` before paint, persists changes via `MutationObserver`
- `<ThemeToggle>` in the sidebar — wires the click handler only; does not re-run init logic
- Full `--color-zinc-*` scale in `global.css` — reserved for dark surfaces when the time comes

When implementing dark mode: define `dark:` CSS overrides for brand color tokens and add scoped `dark:` classes to components.

---

## Styling Conventions

### Always use CSS variables

```css
/* ✅ correct */
color: var(--color-orange-500);
font-family: var(--font-fragment);
background: var(--color-cream);

/* ❌ wrong */
color: #ff6900;
font-family: 'PP Fragment', Georgia, serif;
background: #eee5dd;
```

### Scoped styles

Use `<style>` blocks inside `.astro` files — Astro scopes them automatically. Only add to `global.css` if a rule must truly apply site-wide. Currently only `.row` qualifies.

### Scoped scripts

Use `<script>` inside `.astro` files for component-level behaviour. Only use `is:inline` in `Layout.astro` for scripts that must run before paint (dark mode init).

### View Transitions

When adding scroll listeners or other imperative setup, always clean up for navigation:

```javascript
function init() {
  const onScroll = () => { /* ... */ };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Remove before swap; { once: true } prevents listener accumulation
  document.addEventListener('astro:before-swap', () => {
    window.removeEventListener('scroll', onScroll);
  }, { once: true });
}

init();
document.addEventListener('astro:after-swap', init);
```

Astro's scoped CSS works with JS-added classes (e.g. `.visible`) because `data-astro-cid-*` is on the element at server render time.

### Components vs inline

Extract any UI pattern that appears in more than one place into a component. Use the established components listed above rather than re-implementing patterns inline.

### TypeScript / Props

Define `interface Props` only when a component has multiple props or non-obvious types. Single-prop and zero-prop components don't need one.

---

## Sidebar Scroll Behaviour (Home Page Only)

The "Selected Work" sub-nav (Brand / Physical / Digital) is only rendered on the home page (`currentPath === '/'`). It starts invisible (`opacity: 0; pointer-events: none`) and fades in when the user scrolls 200px past the top of `.work-sections`.

The scroll observer lives in `src/pages/index.astro`:
1. Caches `.work-sections` absolute top once on init (getBoundingClientRect + scrollY)
2. Passive `scroll` listener compares `window.scrollY` to the trigger point
3. Adds/removes `.visible` class on `.sidebar-work-nav`
4. Cleaned up via `astro:before-swap`, re-initialised via `astro:after-swap`

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/layouts/Layout.astro` | Root layout — HTML shell, grid, sidebar, footer, dark mode script |
| `src/styles/global.css` | Tailwind v4 import, `@theme {}` token definitions, `.row` utility |
| `src/content/config.ts` | Zod schemas for content collections |
| `astro.config.mjs` | Astro config (Tailwind via `@tailwindcss/vite`, no SSR adapter) |
| `src/components/Sidebar.astro` | Sticky left sidebar with nav, social links, ThemeToggle |
| `src/components/MainContent.astro` | `grid-column: 4/-1` content wrapper |
| `src/components/PageTitle.astro` | Serif h1 + optional subtitle (112px top margin) |
| `src/components/Tag.astro` | Cream pill label for content tags |
| `src/components/ThemeToggle.astro` | Dark/light toggle button (click handler only) |
| `src/components/Analytics.astro` | Vercel Analytics — included once via Layout |

---

## Deployment

Static output (`output: "static"`), deployed to Vercel. No SSR adapter. Vercel Analytics injected via `<Analytics />` in `Layout.astro`.
