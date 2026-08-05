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

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Dev server with Turbopack                    |
| `npm run build`     | Production build                             |
| `npm run typecheck` | `tsc --noEmit`                               |
| `npm run lint`      | ESLint                                       |
| `npm run format`    | Prettier over the whole repo                 |
| `npm run test`      | Vitest, unit tests                           |
| **`npm run check`** | typecheck + lint + test — run before pushing |

A Husky pre-commit hook runs `lint-staged`, so staged files are linted and
formatted automatically.

## Project structure

```
src/
├── app/[locale]/       Routes. The root layout lives here so <html lang> is correct
├── components/
│   ├── layout/         Header, navigation, footer
│   ├── home/           Hero, earth globe, tech orbit
│   ├── projects/       Cards, filters, case study sections
│   ├── effects/        Starfield, reveal animations
│   └── shared/         Icon registry, section primitives, locale switcher
├── config/             Single source of truth: site, navigation, i18n, categories, tech stack
├── content/projects/   One MDX file per case study
├── data/               Static data: social links, skills, education
├── dictionaries/       UI strings, it.json and en.json
├── lib/                cn, format, content layer, metadata builders
├── styles/             tokens.css → globals.css → typography.css
└── types/              Derived types, imported everywhere as @/types
```

### Two rules worth knowing

**Types flow in one direction.**
`config/project-categories.ts` → `lib/content/schema.ts` (zod) → `types/project.ts`
→ `types/index.ts`. No type is written twice: change the schema and every
component using the old field turns red.

**Design tokens are the only source of colour.**
`src/styles/tokens.css` feeds Tailwind's `@theme`, which generates the utilities
(`bg-surface`, `rounded-card`, `text-h1`). No hex codes in components.

## Adding a project

1. Create `src/content/projects/<slug>.mdx`
2. Fill the frontmatter — it is validated by zod at build time
3. Drop images in `public/images/projects/<slug>/`

That's it: listing, filters, sitemap and case study page pick it up
automatically.

## Roadmap

Development follows a 10-milestone backlog, mirrored to GitHub issues by
`scripts/bootstrap-backlog.ps1`. See the
[issues](https://github.com/AVENA50/Portfolio-imad-el-mir/issues).

## License

Code is MIT. Content, copy and images are © Imad El Mir — please don't reuse
the case studies as your own.
