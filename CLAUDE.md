# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
```

## Architecture

This is a static portfolio site built with **Astro v5**, **Tailwind CSS v4**, and **TypeScript**. There is no CMS — all content is managed via Markdown files in `src/content/`.

### Routing

File-based routing in `src/pages/`:
- `/` → `index.astro` (work listing)
- `/about` → `about.astro`
- `/playground` → `playground.astro` (projects listing)
- `/work/[slug]` → `work/[...slug].astro` (dynamic, generated at build time via `getStaticPaths()`)

### Content Collections

Content is defined in `src/content/config.ts` using Zod schemas, stored as Markdown with YAML frontmatter:

- `src/content/work/` — portfolio case studies with fields: `title`, `description`, `publishedAt`, `featured`, `cover`, `tags`, `role`, `company`, `year`
- `src/content/projects/` — side projects with fields: `title`, `description`, `publishedAt`, `featured`, `cover`, `tags`, `url`, `github`

### Dark Mode

Dark mode is managed via a CSS class on `<html>`, persisted in `localStorage`, with `prefers-color-scheme` as the fallback. An inline `<script>` in `BaseLayout.astro` runs before paint to prevent flash. Event listeners are reattached after each View Transition navigation.

### Key Files

- `src/layouts/BaseLayout.astro` — root layout; contains dark mode logic, View Transitions setup, and Vercel Analytics
- `src/styles/global.css` — Tailwind v4 imports and CSS custom properties (zinc color palette)
- `src/content/config.ts` — Zod schemas for all content collections
- `astro.config.mjs` — Astro config (Tailwind via Vite plugin, no SSR adapter — pure static)

### Styling

- Tailwind CSS v4 (configured via `@tailwindcss/vite` Vite plugin, not `astro-integration`)
- Color palette: zinc grayscale
- Markdown content rendered with `@tailwindcss/typography` (`.prose` class)
- Mobile-first responsive design using `md:` breakpoints

### Deployment

Optimized for Vercel static deployment. Vercel Analytics is integrated via `src/components/Analytics.astro`, injected in `BaseLayout.astro`.

## Conventions

### Components

Extract any UI pattern that appears more than once into a component in `src/components/`. This keeps Tailwind classes DRY and makes global changes a single edit.

Established components to use (create if they don't exist yet):
- **`<Tag>`** — the tag pill (`px-3 py-1 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 ...`). Used on work listings, project listings, and work detail pages.
- **`<WorkCard>`** / **`<ProjectCard>`** — separate card components for work and project items respectively. Keep them separate so they can diverge as needed.
- **`<Container>`** — page content wrapper. Accepts a `size` prop: `wide` (`max-w-6xl`) for listing pages, `narrow` (`max-w-4xl`) for detail/text pages. All pages should use this instead of repeating the padding and max-width classes inline.

### Scoped JS and CSS

Use Astro's built-in scoping rather than global styles or external script files:
- **Scoped styles**: Use `<style>` inside `.astro` files — Astro automatically scopes them to that component.
- **Scoped scripts**: Use `<script>` inside `.astro` files for component-level behavior. For scripts that must run before paint (e.g. dark mode), use `is:inline` in `BaseLayout.astro`.
- Avoid adding new global CSS to `global.css` unless it genuinely applies site-wide.

### TypeScript

Define an explicit `interface Props` in a component's frontmatter only when it has multiple props or non-obvious types. Single-prop or zero-prop components don't need one.
