import type { StaticImageData } from "next/image";

import eksuHome from "@/assets/projects/eksu-sports-hub/home-d.webp";
import eksuMatch from "@/assets/projects/eksu-sports-hub/match-d.webp";
import eksuMatchMobile from "@/assets/projects/eksu-sports-hub/match-m.webp";
import eksuTableMobile from "@/assets/projects/eksu-sports-hub/table-m.webp";
import kandyHome from "@/assets/projects/kandys-treats/home-d.webp";
import kandyMenu from "@/assets/projects/kandys-treats/menu-d.webp";
import markazHome from "@/assets/projects/markaz-il-ginna/home-d.webp";
import markazArabicMobile from "@/assets/projects/markaz-il-ginna/ar-m.webp";
import markazHomeMobile from "@/assets/projects/markaz-il-ginna/home-m.webp";
import biaHome from "@/assets/projects/bia-jupeb/home-d.webp";
import biaFees from "@/assets/projects/bia-jupeb/fees-d.webp";
import biaHomeMobile from "@/assets/projects/bia-jupeb/home-m.webp";
import haqslamHome from "@/assets/projects/haqslam/home-d.webp";
import haqslamPrayer from "@/assets/projects/haqslam/prayer-d.webp";
import haqslamLibraryMobile from "@/assets/projects/haqslam/library-m.webp";
import amigoWorlds from "@/assets/projects/amigo-world/worlds-d.webp";
import amigoSupport from "@/assets/projects/amigo-world/support-d.webp";
import amigoWorldsMobile from "@/assets/projects/amigo-world/worlds-m.webp";

/*
 * Every statement in this file was checked against the project's own
 * repository (README, docs, migrations, source) in October 2026. Screenshots
 * were captured from local builds of each repository; captions say when a
 * build was running on the project's demo data.
 */

export type Category = "Web application" | "Website" | "Education" | "Community" | "Commerce" | "Concept";

export type StatusTone = "live" | "building" | "concept";

export type Shot = {
  image: StaticImageData;
  alt: string;
  caption: string;
  device: "desktop" | "mobile";
};

export type Project = {
  slug: string;
  name: string;
  /** Who it is for. Omitted for my own products. */
  client?: string;
  kind: "Own product" | "Client project" | "Unofficial concept";
  categories: Category[];
  status: { label: string; tone: StatusTone };
  /** One line, used on cards. */
  summary: string;
  /** A short paragraph for the case-study header. */
  intro: string;
  role: string;
  stack: string[];
  links: { live?: { href: string; label: string }; source?: string };
  /** Brand colour of the project, used only for subtle tints. */
  tint: string;
  featured: boolean;
  shots: Shot[];
  overview: string[];
  problem: string[];
  approach: string[];
  architecture: { label: string; detail: string }[];
  features: { title: string; body: string }[];
  challenges: { title: string; problem: string; solution: string }[];
  /** What exists today versus what is planned. */
  state: { done: string[]; next?: string[]; note?: string };
};

export const projects: Project[] = [
  {
    slug: "eksu-sports-hub",
    name: "EKSU Sports Hub",
    kind: "Own product",
    categories: ["Web application", "Education"],
    status: { label: "In active development", tone: "building" },
    summary: "Live scores, fixtures and league tables for Ekiti State University sport, run from a match operator console.",
    intro:
      "A sports platform for Ekiti State University. Students follow live scores, fixtures, results and tables; staff run competitions from an admin dashboard and control live matches from a separate operator console.",
    role: "Product design, front end, database, security model and deployment",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Row Level Security", "Supabase Realtime", "Web Push", "pgTAP"],
    links: { source: "https://github.com/Amigo-1234/eksu-sports-hub" },
    tint: "#7a1f2b",
    featured: true,
    shots: [
      { image: eksuHome, device: "desktop", alt: "EKSU Sports Hub home page with live matches, today's fixtures and a league table preview.", caption: "Home: live now, today's matches and the table. Local build running on the project's demo data." },
      { image: eksuMatch, device: "desktop", alt: "Match centre for an inter-faculty football match with score, timeline of goals and cards, and match information.", caption: "Match centre with a live timeline. Demo data." },
      { image: eksuMatchMobile, device: "mobile", alt: "The match centre on a phone, with the score header and event timeline.", caption: "Match centre on a phone." },
      { image: eksuTableMobile, device: "mobile", alt: "League table on a phone with played, won, drawn, lost, goal difference, points and form.", caption: "League table with form guide." },
    ],
    overview: [
      "Campus football results usually live in group chats and on paper. EKSU Sports Hub gives them one public home: what is live, what is next, who is top of the table, and what happened in each match.",
      "Behind the public site are two tools for staff. The admin dashboard manages competitions, teams, squads, fixtures, operator assignments and corrections. The match operator console is a deliberately plain app for the person at the pitch: score, clock, goals, cards, substitutions, stoppage time and periods.",
    ],
    problem: [
      "A live score is only useful if it is right. The system has to accept updates from a phone at the side of a pitch, on an unreliable connection, and show the same score and match minute to everyone watching.",
      "It also has to keep the public read-only, keep operators limited to the matches assigned to them, and leave a trail when anything is corrected.",
    ],
    approach: [
      "I built the public site with Next.js server components behind a single data-source interface, so pages never know whether they are reading real data or the demo data used for development.",
      "All writes go through PostgreSQL functions (RPCs) rather than table updates from the browser. Row Level Security decides who can read what, and roles (admin, manager, operator) decide who can call which function.",
      "The database has its own test suite in pgTAP covering security, match flow, admin actions, realtime publication, line-ups, registration and notifications.",
    ],
    architecture: [
      { label: "Public site", detail: "Next.js App Router with loading, error and empty states on every route. Home, live, fixtures, results, tables, competitions, teams and a match centre." },
      { label: "Operator console", detail: "A separate app at /op with its own state machine. Commands are queued as intents, applied optimistically and reconciled with the server's canonical state." },
      { label: "Admin dashboard", detail: "Competitions, teams, squads, fixtures, operator assignments, live monitoring, event-based corrections, standings, staff and a read-only audit log." },
      { label: "Database", detail: "Supabase PostgreSQL with Row Level Security and SECURITY DEFINER functions as the only write path. 21 versioned migrations." },
      { label: "Realtime", detail: "Supabase Realtime sends a lightweight hint; clients then refetch canonical state instead of trusting the payload." },
      { label: "Notifications", detail: "Anonymous, per-device Web Push for followed matches and teams. Messages are queued in an outbox table in the same transaction as the match change." },
    ],
    features: [
      { title: "Live match centre", body: "Score, running minute, timeline, line-ups on a responsive pitch that follows substitutions and red cards, stats and head-to-head." },
      { title: "Competitions and tables", body: "League tables calculated from completed matches, competition switching, fixtures and results by date, and top scorers." },
      { title: "Player registration and screening", body: "Players register with a private student number and are screened per team and season (pending, cleared, rejected, suspended) before joining a squad." },
      { title: "Line-ups and eligibility", body: "Formation, starting XI, bench and captain picked by an admin or the assigned operator. Kick-off needs both line-ups confirmed." },
      { title: "Match notifications", body: "Reminders, kick-off and goal alerts per match or team, with per-device preferences and no account required." },
      { title: "Corrections with history", body: "Mistakes are voided or added as new events; the score is recomputed from the events that remain, and every change is logged." },
    ],
    challenges: [
      { title: "Keeping the match clock honest", problem: "A ticking counter on each device drifts, and pauses or stoppage time make it worse.", solution: "The minute is derived from timestamps (period start, pauses, offset) and the server's clock, measured once per session, so every screen computes the same minute." },
      { title: "Updating from a weak connection", problem: "An operator can tap Goal twice, lose signal, or act before the last action reached the server.", solution: "Actions become ordered intents with retry and discard. The console shows the optimistic result immediately, then replays anything still pending on top of the server's state." },
      { title: "A public site that cannot be written to", problem: "Browsers talk to the database directly in a Supabase app, so a missed check is a public write.", solution: "No table is writable from the browser. Writes exist only as checked database functions, and pgTAP tests assert that anonymous users, operators and non-staff are refused." },
    ],
    state: {
      done: [
        "Public site, admin dashboard and operator console running on Supabase",
        "Hosted Supabase project with migrations applied and the database test suite run against it",
        "Player registration, screening, squads and line-ups",
        "Per-device match and team notifications",
      ],
      note: "The project is still being extended; the public launch date and domain are not final.",
    },
  },
  {
    slug: "kandys-treats",
    name: "Kandy's Treats",
    client: "Kandy's Treats, a Nigerian kitchen in Ado-Ekiti",
    kind: "Client project",
    categories: ["Web application", "Commerce"],
    status: { label: "In production · partial launch", tone: "live" },
    summary: "Food ordering, payments, wallet and the back-office tools a small kitchen runs on every day.",
    intro:
      "An ordering platform and operations back office for Kandy's Treats. Customers build a plate, pay by card or wallet and track the order; staff run orders, menu, inventory, finance and the team from one admin console.",
    role: "Full-stack development, payments integration, database design and migration",
    stack: ["HTML", "CSS", "JavaScript", "Supabase", "PostgreSQL", "Row Level Security", "Edge Functions", "Paystack", "Firebase (earlier backend)"],
    links: { live: { href: "https://kandystreats.com.ng", label: "kandystreats.com.ng" } },
    tint: "#d6337a",
    featured: true,
    shots: [
      { image: kandyHome, device: "desktop", alt: "Kandy's Treats home page with a plate of jollof rice and chicken, a food search box and delivery information.", caption: "Customer storefront. Local build; the menu renders from the bundled snapshot of the real menu." },
      { image: kandyMenu, device: "desktop", alt: "The full menu with category filters and dish cards showing prices per scoop.", caption: "Menu with category filters and per-scoop pricing." },
    ],
    overview: [
      "Kandy's Treats sells Nigerian food by the scoop: you build a plate from rice, proteins and sides, choose delivery or pickup, and pay. The platform covers that customer journey and the work behind it.",
      "It started on Firebase. The current version runs on Supabase and PostgreSQL, with the storefront kept as fast, build-free HTML, CSS and JavaScript.",
    ],
    problem: [
      "Money is involved at every step: prices, packaging fees, coupons, delivery fees, wallet balances and refunds. None of those figures can be trusted if they are calculated in the browser.",
      "The kitchen also needed more than a checkout. Staff take orders, track stock, close the day, manage the team and answer customers, and those jobs had to sit on the same data.",
    ],
    approach: [
      "Orders are created and priced only on the server. Checkout re-reads every line from the menu, recalculates fees and coupons, and writes the order inside a database function. The browser is never granted insert or update rights on orders, wallets or payment tables.",
      "Payments are initialised server-side and confirmed by verification plus signed webhooks, so a closed tab or a retried callback cannot double-credit a wallet.",
      "I moved the backend from Firebase to Supabase in versioned SQL migrations, keeping old menu IDs resolvable so existing links still work.",
    ],
    architecture: [
      { label: "Storefront", detail: "Static HTML, CSS and vanilla JavaScript with no build step. Paints from a bundled menu snapshot, then refreshes from live data." },
      { label: "Database", detail: "Supabase PostgreSQL with Row Level Security and column-level grants. Over 80 versioned migrations." },
      { label: "Server logic", detail: "SECURITY DEFINER functions for checkout, wallet movements and admin actions; Supabase Edge Functions for Paystack, email and push." },
      { label: "Payments", detail: "Paystack, initialised on the server and confirmed by verification and webhooks. Card details never touch the site." },
    ],
    features: [
      { title: "Build-your-plate ordering", body: "Per-scoop pricing, proteins and sides as their own lines, packaging rules, coupons, and delivery or pickup." },
      { title: "Wallet", body: "Fund, pay and receive refunds through a ledger of wallet transactions rather than an editable balance." },
      { title: "Order tracking", body: "Order statuses with history and transition rules, notifications and push alerts." },
      { title: "Admin console", body: "Orders, menu and catalogue, customers, support conversations, announcements, careers and settings." },
      { title: "Inventory and finance", body: "An append-only inventory ledger, ingredients, end-of-day staff reports, sales reporting and a finance audit trail." },
      { title: "Team and partners", body: "Staff invitations, role tiers, suspension, and partner referrals with order commission." },
    ],
    challenges: [
      { title: "Prices the browser cannot change", problem: "A client-calculated total can be edited before it is submitted.", solution: "The server recomputes every figure from the menu table inside the same transaction that creates the order, and the client is denied write access to the tables involved." },
      { title: "Migrating a live business", problem: "Moving from Firebase to Supabase risked breaking links, accounts and history the kitchen relies on.", solution: "A staged migration: schema and policies first, then features, with legacy Firebase IDs stored alongside new rows so old menu links and accounts still resolve." },
      { title: "Showing stale prices", problem: "A customer could see a cached price for a dish that had been repriced or sold out.", solution: "Pages render the snapshot immediately, then repaint from live data, and the basket drops lines that no longer exist before checkout." },
    ],
    state: {
      done: [
        "Customer storefront, accounts, checkout, wallet and Paystack payments",
        "Admin console for orders, menu, inventory, finance, staff and support",
        "Firebase to Supabase migration of the core data and logic",
      ],
      note: "The platform went to a partial launch in September 2026 and is still being refined with the kitchen.",
    },
  },
  {
    slug: "markaz-il-ginna",
    name: "Markaz il Ginna",
    client: "Markaz il Ginna, an Islamic school",
    kind: "Client project",
    categories: ["Web application", "Education"],
    status: { label: "Live · rebuild in phases", tone: "building" },
    summary: "A bilingual English and Arabic school records system: students, staff, results and a family portal.",
    intro:
      "A school management and student results platform, rebuilt from a static Firebase app. Staff register students and publish results; students and parents sign in to see them, in English or Arabic.",
    role: "Architecture, database design, authentication, development and deployment",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL (Neon)", "Drizzle ORM", "Neon Auth", "argon2id", "Vitest"],
    links: { live: { href: "https://www.markazulginna.com.ng", label: "markazulginna.com.ng" } },
    tint: "#0f5a43",
    featured: true,
    shots: [
      { image: markazHome, device: "desktop", alt: "Markaz il Ginna school portal landing page in English with links to the student portal and staff login.", caption: "Public landing page in English. Local build." },
      { image: markazArabicMobile, device: "mobile", alt: "The same landing page in Arabic, laid out right to left.", caption: "The Arabic version, mirrored right to left." },
      { image: markazHomeMobile, device: "mobile", alt: "The English landing page on a phone.", caption: "English on a phone." },
    ],
    overview: [
      "The school's first system was a static Firebase app. Version 2 is a ground-up rebuild on PostgreSQL, designed around how a school actually works: sessions, terms, levels, subjects, enrolments, results and families.",
      "Every page exists in English and Arabic. The Arabic version is a full right-to-left layout, not a translated overlay.",
    ],
    problem: [
      "Student records are sensitive and long-lived. Results must not be silently overwritten, families must only ever see their own child, and staff need different powers depending on their job.",
      "The interface had to work equally well in two scripts and two reading directions.",
    ],
    approach: [
      "The browser never talks to the database. Every read and write goes through server code that authenticates the caller, checks a named permission and validates input.",
      "History is append-only: results, enrolments and identifiers are corrected with new records, and an audit log records who did what.",
      "Business rules such as student IDs and grading policy live in plain TypeScript modules with unit tests, separate from React and the database.",
    ],
    architecture: [
      { label: "Application", detail: "Next.js App Router with Server Components and Server Actions. Every route lives under /en or /ar." },
      { label: "Database", detail: "PostgreSQL on Neon through Drizzle ORM: UUID keys, integer kobo for money, constraints and triggers that enforce the rules as well as the code." },
      { label: "Staff access", detail: "Neon Auth sign-in, then role and permission checks on every server action." },
      { label: "Family access", detail: "Student ID and PIN sign-in, with PINs hashed using argon2id and sign-in throttling." },
      { label: "Internationalisation", detail: "Typed dictionaries (a missing Arabic string is a compile error), logical CSS properties for mirroring, and Intl formatting in the Africa/Lagos time zone." },
    ],
    features: [
      { title: "Student records", body: "Registration, profiles, guardians, placement, status changes and never-recycled student IDs." },
      { title: "Staff administration", body: "A staff workspace with permissions per role, academic sessions, terms and enrolments." },
      { title: "Results", body: "Score entry, validation, grading, ranking and publication by term, level and subject." },
      { title: "Student and parent portal", body: "Overview, published results and profile, scoped to the signed-in student." },
      { title: "Bilingual interface", body: "English and Arabic throughout, right-to-left layout, and both scripts with their own fonts." },
    ],
    challenges: [
      { title: "Two directions, one codebase", problem: "Mirroring a layout by hand for Arabic doubles the work and drifts over time.", solution: "Logical properties (start/end instead of left/right) mirror components automatically, and typed dictionaries make a missing translation fail the build." },
      { title: "Mixed-script data", problem: "Latin names inside Arabic pages, and the reverse, scramble their reading order.", solution: "Free text uses bidi-plaintext rendering and dir=auto inputs; IDs, PINs and emails stay left-to-right inside Arabic pages." },
      { title: "Records that must not be rewritten", problem: "A results system that allows silent edits cannot be trusted.", solution: "Corrections are new records, enforced by database constraints and an audit log, not only by application code." },
    ],
    state: {
      done: [
        "Bilingual foundation, design system and PostgreSQL schema",
        "Staff and student authentication with roles and permissions",
        "Student administration, results and the student portal",
      ],
      next: ["Fees and payment ledger", "Promotion and graduation", "Reports and further hardening"],
    },
  },
  {
    slug: "amigo-world",
    name: "Amigo World",
    kind: "Own product",
    categories: ["Web application", "Community"],
    status: { label: "In development · early access", tone: "building" },
    summary: "A social network with posts, Moments, encrypted messages and live community events called Worlds.",
    intro:
      "My own social platform, now being rebuilt from its first Firebase version. Posts, profiles, Explore, notifications, encrypted one-to-one messages, 24-hour Moments, live events called Worlds and a Support Hub for honest feedback.",
    role: "Everything: product, design, front end, database, security and operations",
    stack: ["React", "TypeScript", "Vite", "PostgreSQL (Neon)", "Supabase (schema origin)", "Cloudflare R2", "Web Push", "Vercel", "GitHub Actions"],
    links: {
      live: { href: "https://amigo-app-one.vercel.app", label: "Early-access build" },
      source: "https://github.com/Amigo-1234/amigo-app",
    },
    tint: "#f05a3b",
    featured: true,
    shots: [
      { image: amigoWorlds, device: "desktop", alt: "Amigo World's Worlds page showing a live event card with a countdown, competition entries and a join button.", caption: "Worlds: live and upcoming community events. Local build running on the app's demo data." },
      { image: amigoSupport, device: "desktop", alt: "The Support Hub with requests for feedback on songs and projects, credits and reputation counters.", caption: "Support Hub, where people trade honest feedback. Demo data." },
      { image: amigoWorldsMobile, device: "mobile", alt: "Worlds on a phone with a bottom navigation bar.", caption: "The mobile layout with bottom navigation." },
    ],
    overview: [
      "Amigo World began as a small Firebase social app with a feed, profiles and a global chat. The current rebuild is a typed React application with a PostgreSQL backend, designed for the features a real community needs: safety tools, moderation and reliable messaging.",
      "It is in early access. Some features are live-tested end to end; others are tested locally and still waiting for live checks.",
    ],
    problem: [
      "A social app is mostly the parts nobody sees: who can see a post, what happens after a block, how reports reach a moderator, and how messages stay private. Those have to be enforced by the server, not hidden by the interface.",
    ],
    approach: [
      "Screens talk to a DataSource interface with three implementations: the legacy Firebase app (kept as the rollback path), the PostgreSQL backend and an in-memory demo. That let the rebuild proceed without touching the version people were already using.",
      "Visibility, blocking, suspension and rate limits are enforced in the database. Media goes to a private Cloudflare R2 bucket through short-lived signed links that the database authorises.",
      "Live checks run from GitHub Actions against preview and production deployments: media, push, Worlds and messaging journeys, with test accounts cleaned up afterwards.",
    ],
    architecture: [
      { label: "Client", detail: "React 19, TypeScript and Vite with React Router. Plain CSS with design tokens." },
      { label: "Backend", detail: "PostgreSQL on Neon with Neon Auth and the Data API. The schema was first written as Supabase migrations." },
      { label: "Media", detail: "Private Cloudflare R2 bucket; uploads and reads use signed links issued only after a database check." },
      { label: "Messages", detail: "End-to-end encrypted one-to-one messages using the Matrix Olm/Megolm implementation (vodozemac); the server stores ciphertext only." },
      { label: "Operations", detail: "Vercel deployments, GitHub Actions smoke tests, privacy-safe error reports and performance measurements." },
    ],
    features: [
      { title: "Feed and profiles", body: "Latest and Following feeds, likes, replies, photo posts, profiles with posts, replies and media tabs, and follow lists." },
      { title: "Explore and search", body: "People and post search with Top, People, Posts and Media tabs, and suggestions." },
      { title: "Notifications", body: "Follows, likes, replies and mentions, grouped, with read state and an unread badge." },
      { title: "Worlds", body: "Admin-created live events with countdowns, posts, live chat and an optional competition with a leaderboard." },
      { title: "Support Hub", body: "Ask for feedback on a song, video or project and help others in return, with credits and reputation." },
      { title: "Moderation", body: "Reports, suspension, warnings, blocking, rate limits and an admin queue with an audit log." },
    ],
    challenges: [
      { title: "Rebuilding without breaking the live app", problem: "Existing users were on Firebase; a big-bang switch would risk their accounts and posts.", solution: "A DataSource seam, a repeatable read-only migration with validation reports, and the Firebase build kept as an instant rollback." },
      { title: "Private messages that stay private", problem: "Admins and the database should not be able to read conversations.", solution: "Messages are encrypted on the device; moderators only see what a reporter chooses to share." },
      { title: "Photos on slow networks", problem: "Full-size images made the feed slow on mobile data.", solution: "Feed-sized copies, tiny blurred previews stored with each post, and cacheable signed links. Measured on a 4G profile, the first feed photo went from 6.0 s to 4.0 s." },
    ],
    state: {
      done: [
        "Feed, profiles, Explore, notifications, Worlds and Support Hub",
        "Encrypted one-to-one messages with photos",
        "Moderation, blocking, suspension and rate limits",
        "Media storage on Cloudflare R2 and Web Push",
      ],
      next: ["Final legal text before public launch", "Voice notes and video posts", "Creator programme (designed, not open)"],
      note: "Not yet publicly launched.",
    },
  },
  {
    slug: "bia-jupeb",
    name: "BIA JUPEB",
    client: "Boma's Intellectual Academy, Akoka, Lagos",
    kind: "Client project",
    categories: ["Website", "Education"],
    status: { label: "Live", tone: "live" },
    summary: "The website for a JUPEB admission centre: programme information, fees, timetables and admission guides.",
    intro:
      "A redesigned website for Boma's Intellectual Academy, which prepares students for JUPEB, a route into 200 level at Nigerian universities. It explains the programme, publishes fees in full and leads prospective students to the admissions team.",
    role: "Design, development, content structure, SEO and deployment",
    stack: ["Astro", "TypeScript", "GSAP", "axe-core", "Playwright", "Vercel"],
    links: { live: { href: "https://biajupeb.com.ng", label: "biajupeb.com.ng" } },
    tint: "#c8102e",
    featured: false,
    shots: [
      { image: biaHome, device: "desktop", alt: "BIA JUPEB home page headline 'Your direct route to 200 Level' beside a classroom photo.", caption: "Home page. Local build." },
      { image: biaFees, device: "desktop", alt: "Fees page listing registration, science and non-science programme fees and physical tutorial fees.", caption: "Fees, published in full from the academy's official payment advice." },
      { image: biaHomeMobile, device: "mobile", alt: "The home page on a phone with a photo carousel and an enquiry button.", caption: "On a phone." },
    ],
    overview: [
      "Families comparing JUPEB centres want plain answers: what the programme is, what it costs, when classes hold and how to apply. The site is organised around those questions.",
      "It replaced an earlier static HTML version; old URLs redirect permanently to their new pages.",
    ],
    problem: [
      "The academy needed a site that ranks for the questions students actually search, builds trust with real results and people, and turns a visit into a call or a visit to the centre.",
    ],
    approach: [
      "I rebuilt it with Astro so every page ships as static HTML, with small scripts only where interaction needs them.",
      "Content sits in structured files (team, testimonials, achievements, official figures), so updates do not mean editing layouts.",
      "Accessibility and responsive layouts are checked with axe-core and a Playwright run across screen sizes.",
    ],
    architecture: [
      { label: "Site", detail: "Astro static build served by Vercel, with permanent redirects from the legacy site." },
      { label: "Content", detail: "Structured content collections for team, testimonials, achievements and official 2026 information." },
      { label: "Quality", detail: "Unit tests for fee calculations, axe-core accessibility checks and responsive browser tests." },
    ],
    features: [
      { title: "Programme and admission information", body: "What JUPEB is, who it suits and how admission works, with clear calls to the admissions line." },
      { title: "Fees in full", body: "Registration, programme and tutorial fees for 2026/27 taken from the official payment advice." },
      { title: "Timetables", body: "Weekly class timetables for the first semester and the free online classes before resumption." },
      { title: "Guides for search", body: "Articles answering common questions, such as JUPEB versus IJMB and getting into UNILAG through JUPEB." },
      { title: "Proof", body: "Success stories, a hall of excellence, the team and a gallery." },
    ],
    challenges: [
      { title: "Not promising what does not exist", problem: "An enquiry form implies someone receives and tracks it.", solution: "Until a backend exists, calls to action go to the admissions phone line and the centre. The data model for tracked enquiries is ready but deliberately not switched on." },
      { title: "Moving without losing search traffic", problem: "The old site's pages were already indexed.", solution: "Every legacy URL has a permanent redirect to its new page." },
    ],
    state: {
      done: ["Redesigned site live on the academy's domain", "Fees, timetable, guides, team and success stories", "Redirects from the previous site"],
      next: ["Stored and tracked admission enquiries, once a backend is in place"],
    },
  },
  {
    slug: "haqslam",
    name: "HAQSLAM",
    client: "Haqiqat-s-Salam Society of Nigeria",
    kind: "Client project",
    categories: ["Website", "Community"],
    status: { label: "Live", tone: "live" },
    summary: "A mosque and community website with calculated daily prayer times and a page-by-page library of the society's books.",
    intro:
      "The website of Haqiqat-s-Salam Society of Nigeria (HAQSLAM), an Islamic society in Ijaye-Ojokoro, Lagos. It introduces the society and its founder, lists gatherings and events, calculates daily prayer times for Lagos and puts the society's devotional books online.",
    role: "Design, development, content verification and deployment",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Adhan", "Vercel"],
    links: { live: { href: "https://haqqs.vercel.app", label: "haqqs.vercel.app" } },
    tint: "#14453a",
    featured: false,
    shots: [
      { image: haqslamHome, device: "desktop", alt: "HAQSLAM home page with the society's name in Arabic and English and a portrait of the founder.", caption: "Home page. Local build." },
      { image: haqslamPrayer, device: "desktop", alt: "Prayer times page showing calculated prayer start times for Lagos and a countdown to the next prayer.", caption: "Calculated prayer start times for Lagos with a live countdown." },
      { image: haqslamLibraryMobile, device: "mobile", alt: "The Islamic library page on a phone with book covers.", caption: "The library on a phone." },
    ],
    overview: [
      "The society's previous site was a set of static pages. Version 2 is a Next.js site built around what members and visitors come for: prayer times, gatherings, the founder, the books and how to get in touch.",
      "Content is published only when it can be traced to the society's own material, such as event flyers and book covers. Anything unconfirmed is withheld or clearly marked.",
    ],
    problem: [
      "Religious content has to be accurate and respectful. Prayer times, names and titles, and the society's history cannot be guessed.",
    ],
    approach: [
      "Prayer start times are calculated daily for Lagos with the Adhan library and a documented method, and the page says plainly that they are calculated times, not the mosque's Iqamah timetable.",
      "The original book scans were converted to light WebP pages so each book can be read page by page on a phone.",
      "Old .html addresses redirect to the new pages, and the old cache-first service worker is replaced by one that clears itself so returning visitors are not stuck on the old site.",
    ],
    architecture: [
      { label: "Site", detail: "Next.js App Router with static content modules, sitemap and robots configuration." },
      { label: "Prayer times", detail: "Adhan calculations in the Africa/Lagos time zone, with tests for date handling, prayer order and countdown rollover." },
      { label: "Library", detail: "WebP copies of the original scans, generated by a script, with a page-by-page reader." },
    ],
    features: [
      { title: "Daily prayer times", body: "Calculated start times for Lagos with a countdown to the next prayer." },
      { title: "Islamic library", body: "The society's devotional books, readable page by page." },
      { title: "Events and gallery", body: "Gatherings and annual events, each with its own page, and a photo gallery." },
      { title: "Founder and society", body: "About pages written from verified sources." },
      { title: "Contact and donations", body: "Confirmed contact details; bank details are withheld until reconfirmed by the society." },
    ],
    challenges: [
      { title: "Accuracy over completeness", problem: "It is tempting to fill gaps in history or schedules.", solution: "A content-status document tracks every fact as verified, awaiting confirmation or missing, and the site follows it." },
      { title: "Retiring an old service worker", problem: "The old site cached itself aggressively, so returning visitors could keep seeing it.", solution: "A replacement worker clears the caches, unregisters itself and reloads open tabs once." },
    ],
    state: {
      done: ["Version 2 site live", "Prayer times, library, events, gallery, founder and contact pages", "Redirects from the legacy site"],
      next: ["Confirmed weekly programme times", "Society history and founder biography, once documented"],
    },
  },
  {
    slug: "fara-hotel-suites",
    name: "FARA Hotel & Suites",
    kind: "Unofficial concept",
    categories: ["Website", "Concept"],
    status: { label: "Private concept", tone: "concept" },
    summary: "An unofficial website concept for a hotel in Lagos: rooms, lounge, gallery and a reservation enquiry.",
    intro:
      "A website concept I designed and built for a hotel in Alagbado, Lagos, to present as a proposal. It is not affiliated with, approved or operated by the hotel, so it is not public and has no screenshots here.",
    role: "Research, design and development",
    stack: ["Astro", "TypeScript", "CSS", "Vercel"],
    links: {},
    tint: "#1d2b45",
    featured: false,
    shots: [],
    overview: [
      "A static, fast website for a hotel: rooms, the lounge, services, a curated gallery, location and a reservation enquiry.",
      "Because it is an unofficial proposal, every page is marked noindex and the deployment stays private.",
    ],
    problem: [
      "Hotels in the area are mostly found through listing sites. A direct site needs to show the rooms well, load quickly on mobile data and make an enquiry easy without pretending to be a booking engine.",
    ],
    approach: [
      "Static HTML for every route with Astro, responsive AVIF and WebP images, and small scripts for navigation, the gallery and the enquiry.",
      "The enquiry validates dates in the Africa/Lagos time zone and prepares a message the guest can copy or send by phone, rather than claiming an online booking that does not exist.",
    ],
    architecture: [
      { label: "Site", detail: "Astro static build, scoped component styles and one shared design system." },
      { label: "Interaction", detail: "Accessible full-screen mobile menu, filterable gallery with a native dialog lightbox, and an enquiry form with date validation." },
    ],
    features: [
      { title: "Rooms and lounge", body: "Room types and the lounge presented with large responsive photographs." },
      { title: "Gallery", body: "Category filters and a keyboard-accessible lightbox." },
      { title: "Reservation enquiry", body: "Dates, guests and room interest, with query-string prefill and a copyable summary." },
    ],
    challenges: [
      { title: "Honest by design", problem: "A concept site could be mistaken for the hotel's official site.", solution: "An unofficial notice in the footer, noindex on every page and a private deployment." },
    ],
    state: {
      done: ["Complete static site with QA notes"],
      note: "Shown here by description only. It has not been adopted by the hotel.",
    },
  },
];

/** Smaller builds that are worth listing but do not need a case study. */
export const smallerWork = [
  {
    name: "JUVIC Global Concept",
    description: "Front end for an eyewear store: catalogue, product pages and a cart kept in the browser. Checkout was not built.",
    stack: ["HTML", "CSS", "JavaScript"],
  },
] as const;

export type ProjectCardData = Pick<Project, "slug" | "name" | "summary" | "status" | "categories" | "stack" | "kind" | "tint" | "client"> & {
  cover?: Shot;
};

/** The subset of a project that cards need, so client components don't receive whole case studies. */
export function toCard(p: Project): ProjectCardData {
  return {
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    status: p.status,
    categories: p.categories,
    stack: p.stack,
    kind: p.kind,
    tint: p.tint,
    client: p.client,
    cover: p.shots.find((s) => s.device === "desktop"),
  };
}

export const categories: Category[] = ["Web application", "Website", "Education", "Community", "Commerce", "Concept"];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length];
}
