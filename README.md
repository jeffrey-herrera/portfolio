# Portfolio

Personal portfolio built with Astro, TypeScript, and Tailwind CSS.

## Features

- ✨ Built with [Astro](https://astro.build) (latest version)
- 🎨 Styled with [Tailwind CSS v4](https://tailwindcss.com)
- 🌙 Dark mode support
- 📝 Markdown-based content with Content Collections
- 🎬 Smooth page transitions with View Transitions
- 📊 Analytics ready (Vercel Analytics)
- 🎯 TypeScript for type safety
- 🚀 Optimized for performance

## Project Structure

```
/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable components
│   ├── content/      # Markdown content
│   │   ├── work/     # Work/case studies
│   │   └── projects/ # Playground projects
│   ├── layouts/      # Page layouts
│   ├── pages/        # Routes
│   │   ├── index.astro      # Work page (homepage)
│   │   ├── about.astro      # About page
│   │   ├── playground.astro # Playground page
│   │   └── playlists.astro  # Playlists page
│   └── styles/       # Global styles
└── package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Adding Content

### Work/Case Studies

Add new work items in `src/content/work/` as Markdown files:

```markdown
---
title: "Project Name"
description: "Brief description"
publishedAt: 2024-01-15
featured: true
tags: ["Design", "Development"]
role: "Product Designer"
company: "Company Name"
year: "2024"
---

Your content here...
```

### Playground Projects

Add experiments in `src/content/projects/`:

```markdown
---
title: "Experiment Name"
description: "What it does"
publishedAt: 2024-02-01
tags: ["React", "TypeScript"]
url: "https://example.com"
github: "https://github.com/username/repo"
---

Project details...
```

## Customization

- Update personal info in `src/layouts/BaseLayout.astro`
- Modify navigation in `src/components/Navigation.astro`
- Adjust colors in `src/styles/global.css`
- Add your own content in `src/content/`

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com) but works with any static hosting platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/portfolio)

## License

MIT
