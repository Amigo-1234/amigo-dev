# AMIGODEV — Muftau Idris

Personal site and portfolio of Muftau Idris (AMIGODEV), full-stack developer and engineering student.
Production: https://amigo-dev.vercel.app

## Stack

- Next.js 16 (App Router, static generation) · React 19 · TypeScript (strict)
- Tailwind CSS 4 with a small token set in `src/app/globals.css`
- Instrument Serif, Geist and Geist Mono, self-hosted through `next/font`; Geist and Geist Mono are
  subset to the characters the site uses (`src/fonts/*-latin.woff2`, made with `pyftsubset` from the
  `geist` dev dependency) to keep the first paint fast on phones
- GSAP (with ScrollTrigger and ScrambleText) for motion, loaded on demand: the desktop hero intro
  loads it right away, everything else on the visitor's first interaction (`src/lib/gsap.ts`).
  All motion respects `prefers-reduced-motion`, and nothing is hidden when JavaScript is unavailable

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
| `src/assets/portrait/` | Place for the owner's portrait. Until one is set in `site.ts`, a branded card shows instead |
| `src/game/` | DEBUG.EXE: engine, sprites and React wrapper, loaded only on `/play` |
| `public/brand/` | AMIGODEV monogram and wordmark as standalone SVGs (outlined text, ink and paper versions, app tile) |
| `src/components/` | Header, footer, command menu, theme, cards, contact form, portrait, layer explorer, terminal, motion layer |
| `src/app/` | Routes, metadata, sitemap, robots, manifest and Open Graph images |

### Common changes

- **Add a project:** add screenshots to `src/assets/projects/<slug>/`, import them in
  `src/content/projects.ts` and add an entry. The index, case-study route, command menu, sitemap and
  Open Graph image pick it up automatically.
- **Add a CV:** put the PDF in `public/` and set `resume` in `src/content/site.ts`; the hero shows a
  Résumé button only when this is set.
- **Publish an article:** append to `posts` in `src/content/writing.ts`.
- **Add the portrait:** put the image in `src/assets/portrait/`, import it in `src/content/site.ts`
  and set `portrait: { image, alt, focus }`. For the social preview, also add a JPEG copy at
  `src/assets/portrait/og.jpg`.

Content rule: only publish what can be verified. Project copy was checked against each project's
repository; planned features are listed as planned.

## Brand

The monogram is an A and a D sharing one stem, with the crossbar running through both letters in
the accent colour. Its geometry lives in `src/components/brand.tsx` (`MONOGRAM_INK`,
`MONOGRAM_BAR`) and is reused by the favicon, the Apple icon and the Open Graph images.

## Motion and interaction

- Motion is declared with data attributes and driven by `src/components/motion-layer.tsx`:
  `.reveal`, `data-stagger`, `data-speed` (parallax), `data-drift`, `data-scramble`, `data-progress`,
  `data-magnetic` and `data-light` / `.spotlight` (pointer-following light, fine pointers only).
- The hero intro (`hero-motion.tsx`) runs on large screens only; a CSS fallback reveals the hero
  after 2.5s if the script never arrives.
- The terminal (`terminal.tsx`) matches input against a fixed list of commands; nothing typed is
  evaluated. It loads after the page is interactive.
- Easter eggs: a few undocumented terminal commands, a console note, and the Konami code.

## DEBUG.EXE (`/play`)

A small canvas arcade game: defend the production server from incoming bugs. No game engine — the
engine (`src/game/engine.ts`) is plain TypeScript drawing pixel sprites (`sprites.ts`) to a canvas.
The game code is lazy-loaded on `/play` only. Keyboard (arrows/WASD, Space, P) and touch (drag the
playfield, or the on-screen buttons) are supported; it pauses when the tab is hidden, honours reduced
motion, and keeps the personal best in `localStorage` only.

## Contact form

The form posts to EmailJS's REST API from the browser, with client-side validation, a honeypot,
a minimum fill time and a timeout. If sending fails, the visitor gets a pre-filled `mailto:` link,
and without JavaScript the form falls back to the visitor's email app. EmailJS IDs are public by
design; override them with the `NEXT_PUBLIC_EMAILJS_*` variables in `.env.example` and restrict the
allowed origin in the EmailJS dashboard.

## Deploy

The Vercel project `amigo-dev` builds `main` with `npm run build` (see `vercel.json`).
