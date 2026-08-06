# Portfolio — Imad El Mir

Personal portfolio and engineering case studies.
Built with **Next.js 15**, **TypeScript**, **Tailwind CSS v4** and **MDX**.

Bilingual: Italian by default (`/it`), English on `/en`.

> Live: _coming soon_

---

## Stack

| Layer     | Choice                                            | Why                                                             |
| --------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Framework | Next.js 15, App Router, React 19                  | Server Components by default, streaming, file-based routing     |
| Language  | TypeScript, `strict` + `noUncheckedIndexedAccess` | Runtime bugs become compile errors                              |
| Styling   | Tailwind CSS v4                                   | CSS-first config: design tokens live in `src/styles/tokens.css` |
| Content   | MDX + gray-matter + zod                           | A project is a file; invalid frontmatter fails the build        |
| i18n      | `[locale]` segment + JSON dictionaries            | No runtime library, static rendering per locale                 |
| Icons     | lucide-react + react-icons                        | Typed registry, brand marks included                            |
| Quality   | ESLint, Prettier, Husky, Vitest                   | `npm run check` runs the same suite as CI                       |
| Deploy    | Vercel                                            | Native Next.js target                                           |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000> — you'll be redirected to `/it` or `/en`
depending on your browser language.

## Scripts

| Command               | What it does                                 |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Dev server with Turbopack                    |
| `npm run build`       | Production build                             |
| `npm run typecheck`   | `tsc --noEmit`                               |
| `npm run lint`        | ESLint                                       |
| `npm run format`      | Prettier over the whole repo                 |
| `npm run test`        | Vitest, unit tests                           |
| `npm run test:e2e`    | Playwright, end-to-end against a real build  |
| `npm run test:e2e:ui` | Playwright in watch mode, with a UI          |
| **`npm run check`**   | typecheck + lint + test — run before pushing |

A Husky pre-commit hook runs `lint-staged`, so staged files are linted and
formatted automatically.

End-to-end tests need browsers, installed once with
`npx playwright install chromium`. They build the site and start it on
port 3000 by themselves — nothing to launch beforehand.

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull
request, in two stages:

1. **Static checks** — types, lint, formatting, unit tests. Under a minute.
2. **End-to-end** — build plus Playwright. Only runs if stage 1 passed;
   starting a browser when the types don't compile is wasted time.

A red pull request can't be merged. On failure the Playwright report is
uploaded as an artifact.

## Project structure

```
src/
├── app/
│   ├── [locale]/       Routes. The root layout lives here so <html lang> is correct
│   │   └── opengraph-image.tsx   Social preview, generated at build time
│   ├── api/contact/    The only server route: receives the form, sends the email
│   ├── sitemap.ts      Generated from MAIN_NAV and the project files
│   └── robots.ts       Blocks indexing until the site is deliberately made public
├── components/
│   ├── layout/         Header, navigation, footer
│   ├── home/           Hero, earth globe, tech orbit
│   ├── about/          Portrait frame, podium, 3D badge (unused, parked)
│   ├── projects/       Cards, filters, case study sections
│   ├── contact/        Form and contact details
│   ├── effects/        Starfield, reveal animations
│   └── shared/         Icon registry, section primitives, locale switcher, JSON-LD
├── config/             Single source of truth: site, navigation, i18n, categories, tech stack
├── content/projects/   it/ and en/ — one MDX file per case study, per language
├── data/               Static data: social links, skills, education
├── dictionaries/       UI strings, it.json and en.json
├── lib/
│   ├── content/        MDX pipeline, zod schema, project reader
│   ├── contact/        Form schema, rate limiting, email templates
│   ├── metadata.ts     One builder for every page's title, canonical and hreflang
│   ├── json-ld.ts      schema.org structured data
│   └── og-image.tsx    The social preview layout
├── styles/             tokens.css → globals.css → typography.css
└── types/              Derived types, imported everywhere as @/types

tests/
├── unit/               Vitest — pure functions, no DOM
└── e2e/                Playwright — real browser, real build
```

### Two rules worth knowing

**Types flow in one direction.**
`config/project-categories.ts` → `lib/content/schema.ts` (zod) → `types/project.ts`
→ `types/index.ts`. No type is written twice: change the schema and every
component using the old field turns red.

**Design tokens are the only source of colour.**
`src/styles/tokens.css` feeds Tailwind's `@theme`, which generates the utilities
(`bg-surface`, `rounded-card`, `text-h1`). No hex codes in components.

**Nothing about the site is written down twice.** The navigation array
builds the menu _and_ the sitemap. The project files feed the listing, the
case studies, the structured data and the social images. The stats on the
About page are counted from the projects, so they can't claim ten while
`/projects` shows two.

## Deploying

See [`docs/deploy.md`](docs/deploy.md). It covers the Vercel setup, the
environment variables, and how to keep the site private until it's ready —
the free plan can't password-protect a production domain, so the trick is
not to create one yet.

## Adding a project

1. Create **two** files with the same slug, one per language:
   `src/content/projects/it/<slug>.mdx` and
   `src/content/projects/en/<slug>.mdx`
2. Fill the frontmatter — zod validates it at build time, so a typo in a
   category or a tech slug stops the build instead of silently rendering
   nothing
3. Drop images in `public/images/projects/<slug>/`

That's it. Listing, filters, sitemap, JSON-LD, social preview image and the
case study page all pick it up automatically — none of them keeps its own
list of projects.

> A unit test checks that the structural fields (category, stack, dates,
> links) match between the two languages. Prose may differ; facts may not.

## Roadmap

Development follows a 10-milestone backlog, mirrored to GitHub issues by
`scripts/bootstrap-backlog.ps1`. See the
[issues](https://github.com/AVENA50/Portfolio-imad-el-mir/issues).

## License

Code is MIT. Content, copy and images are © Imad El Mir — please don't reuse
the case studies as your own.
