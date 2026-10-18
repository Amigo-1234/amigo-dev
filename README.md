# AMIGODEV — Muftau Idris

Personal site and portfolio of Muftau Idris (AMIGODEV), full-stack developer and engineering student.
Production: https://amigo-dev.vercel.app

## Stack

- Next.js 16 (App Router, static generation) · React 19 · TypeScript (strict)
- Tailwind CSS 4 with a small token set in `src/app/globals.css`
- Instrument Serif, Geist and Geist Mono, self-hosted through `next/font`
- No UI or animation libraries: motion is CSS (scroll-driven where supported) and always respects
  `prefers-reduced-motion`; nothing is hidden when JavaScript is unavailable

## Develop

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # ESLint + TypeScript
npm run build      # production build
```

## Where things live

| Path | What it holds |
| --- | --- |
| `src/content/site.ts` | Name, role, email, social links, optional CV path |
| `src/content/projects.ts` | Every project and case study, with screenshots and status |
| `src/content/profile.ts` | Story, skills (with evidence), journey, services, AI workflow, languages, interests |
| `src/content/writing.ts` | Technical articles. Empty for now; `/writing` returns 404 until a post exists |
| `src/assets/projects/` | Screenshots, captured from local builds of each project's repository |
| `src/components/` | Header, footer, command menu, theme, cards, contact form, hero drawing |
| `src/app/` | Routes, metadata, sitemap, robots, manifest and Open Graph images |

### Common changes

- **Add a project:** add screenshots to `src/assets/projects/<slug>/`, import them in
  `src/content/projects.ts` and add an entry. The index, case-study route, command menu, sitemap and
  Open Graph image pick it up automatically.
- **Add a CV:** put the PDF in `public/` and set `resume` in `src/content/site.ts`; the hero shows a
  Résumé button only when this is set.
- **Publish an article:** append to `posts` in `src/content/writing.ts`.

Content rule: only publish what can be verified. Project copy was checked against each project's
repository; planned features are listed as planned.

## Contact form

The form posts to EmailJS's REST API from the browser, with client-side validation, a honeypot,
a minimum fill time and a timeout. If sending fails, the visitor gets a pre-filled `mailto:` link,
and without JavaScript the form falls back to the visitor's email app. EmailJS IDs are public by
design; override them with the `NEXT_PUBLIC_EMAILJS_*` variables in `.env.example` and restrict the
allowed origin in the EmailJS dashboard.

## Deploy

The Vercel project `amigo-dev` builds `main` with `npm run build` (see `vercel.json`).
