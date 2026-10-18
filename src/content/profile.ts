/*
 * Personal and professional content. Skills list only what the projects in
 * projects.ts demonstrate; `evidence` names the projects that show each group.
 */

export const story = [
  "I'm Muftau Idris, a Nigerian developer of Yoruba heritage with roots in Lagos. I study Mechanical Engineering at Ekiti State University, and alongside the degree I build software that people use: school records systems, an ordering platform for a kitchen, a university sports hub and websites for organisations I care about.",
  "Engineering taught me to start from how a system behaves under load, over time and when something fails. I bring the same habit to software. My work runs from the interface to the database: authentication and permissions, real-time features, payments, deployment, domains and the unglamorous work of keeping things running after launch.",
  "The part I enjoy most is understanding how complex systems fit together. That is why I'm steering toward infrastructure and DevOps, and why I'm learning it the way I learned everything else: by building, breaking things in safe places, and reading the documentation properly.",
];

export type SkillGroup = {
  title: string;
  blurb: string;
  items: string[];
  evidence: string[];
};

export const skills: SkillGroup[] = [
  {
    title: "Frontend",
    blurb: "Interfaces that work on a cheap phone on mobile data, not only on a fast laptop.",
    items: ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Astro", "Responsive interfaces", "Accessibility"],
    evidence: ["EKSU Sports Hub", "Markaz il Ginna", "BIA JUPEB"],
  },
  {
    title: "Backend & data",
    blurb: "Schemas, permissions and server logic that make the rules impossible to skip.",
    items: ["Supabase", "PostgreSQL", "Firebase", "Drizzle ORM", "Authentication", "Authorization & RBAC", "Row Level Security", "Database design", "Real-time features", "Payment & API integration"],
    evidence: ["Kandy's Treats", "Markaz il Ginna", "EKSU Sports Hub"],
  },
  {
    title: "Deployment & infrastructure",
    blurb: "Getting software online, on the right domain, with the right configuration, and keeping it there.",
    items: ["Git", "GitHub", "Vercel", "Deployment workflows", "Domains & DNS", "Environment configuration", "Database migrations", "Production debugging", "Object storage (Cloudflare R2)"],
    evidence: ["Amigo World", "BIA JUPEB", "Markaz il Ginna"],
  },
  {
    title: "Quality & tooling",
    blurb: "Tests where mistakes are expensive, and tools that catch them early.",
    items: ["pgTAP database tests", "Vitest", "Node test runner", "Playwright", "axe-core", "ESLint", "Web Push", "VS Code"],
    evidence: ["EKSU Sports Hub", "Markaz il Ginna", "BIA JUPEB"],
  },
];

export const learning = {
  title: "DevOps engineering",
  blurb:
    "My next direction. I already handle deployments, domains, environment configuration and production debugging on my own projects. I'm now studying the wider discipline — CI/CD pipelines, containers, infrastructure as code and observability — and I'll list those tools here when I have shipped work that uses them.",
};

export const journey = [
  {
    stage: "Mechanical Engineering",
    detail: "Studying at Ekiti State University. Physics, systems thinking and the discipline of working to a specification.",
    state: "Ongoing",
  },
  {
    stage: "Software development",
    detail: "HTML, CSS and JavaScript first, then Firebase-backed apps with sign-in, real-time data and file uploads.",
    state: "Foundation",
  },
  {
    stage: "Full-stack applications",
    detail: "Next.js, TypeScript and PostgreSQL. Permissions, payments, bilingual interfaces, migrations and live systems people depend on.",
    state: "Current work",
  },
  {
    stage: "Infrastructure & DevOps",
    detail: "Deployment pipelines, environments, monitoring and the systems that keep software running. Learning it the same way: by building.",
    state: "Direction",
  },
] as const;

export const services = [
  { title: "Business websites", body: "Fast, search-friendly sites that explain what you do and make it easy to contact you.", evidence: ["bia-jupeb", "haqslam"] },
  { title: "Full-stack web applications", body: "Accounts, data, permissions and the workflows behind them.", evidence: ["eksu-sports-hub", "amigo-world"] },
  { title: "Admin dashboards", body: "Back-office tools for the people running the business: orders, records, reports.", evidence: ["kandys-treats", "eksu-sports-hub"] },
  { title: "Educational platforms", body: "Student records, results and portals, including bilingual and right-to-left interfaces.", evidence: ["markaz-il-ginna", "bia-jupeb"] },
  { title: "Ordering & booking systems", body: "Menus, baskets, payments, wallets and enquiry flows.", evidence: ["kandys-treats", "fara-hotel-suites"] },
  { title: "Modernisation, deployment & maintenance", body: "Rebuilding older sites and apps, moving them to better infrastructure, and keeping them healthy.", evidence: ["markaz-il-ginna", "amigo-world"] },
] as const;

export const aiWorkflow = {
  intro:
    "AI tools are a normal part of how I work. They make me faster at the parts of the job that are about reading, searching and drafting. They don't replace knowing what correct looks like.",
  uses: [
    { title: "Prototyping", body: "Sketching an approach quickly so I can judge it against a real constraint before committing to it." },
    { title: "Code analysis", body: "Reading unfamiliar code, tracing a data flow, and asking what breaks if this changes." },
    { title: "Debugging", body: "Narrowing down a failure from logs and symptoms, then confirming the cause myself." },
    { title: "Research", body: "Comparing approaches and reading documentation faster — with the source open beside it." },
    { title: "Workflow", body: "Drafting tests, migrations and documentation that I then review line by line." },
    { title: "Learning", body: "Asking why, not only how, while I study infrastructure and DevOps." },
  ],
  principles: [
    "I decide the architecture and I own every line that ships.",
    "Anything that touches money, data or permissions is tested, not trusted.",
    "I use AI to build software. I don't build or train AI models, and I don't claim to.",
  ],
};

export const exploring = [
  { title: "DevOps & CI/CD", body: "Automated checks and deployments, preview environments and safe rollbacks." },
  { title: "Infrastructure", body: "How hosting, databases, storage and networks fit together, and what they cost." },
  { title: "Observability", body: "Knowing a system is unhealthy before a user reports it." },
  { title: "AI-assisted engineering", body: "Using AI tools well: faster delivery without lowering the bar on review and testing." },
] as const;

export const languages = [
  { name: "English", native: "English", greeting: "Hello", level: "Working language", dir: "ltr", lang: "en" },
  { name: "Spanish", native: "Español", greeting: "Hola", level: "Learning", dir: "ltr", lang: "es" },
  { name: "French", native: "Français", greeting: "Bonjour", level: "Learning", dir: "ltr", lang: "fr" },
  { name: "Arabic", native: "العربية", greeting: "مرحبا", level: "Basic · learning", dir: "rtl", lang: "ar" },
] as const;

export const interests = [
  { title: "Football", body: "FC Barcelona supporter and a long-time admirer of Lionel Messi.", mark: "football" },
  { title: "Chess", body: "A good teacher of patience, and of thinking two moves past the obvious one.", mark: "chess" },
  { title: "Engineering & physics", body: "The part of my degree that keeps changing how I look at software.", mark: "physics" },
  { title: "Artificial intelligence", body: "Following the field closely and using it daily in my own work.", mark: "ai" },
  { title: "Content & digital media", body: "Making things to share, and learning how people find and watch them.", mark: "media" },
  { title: "Languages", body: "Learning Spanish, French and Arabic, slowly and on purpose.", mark: "languages" },
] as const;

/** The four layers in the interactive system drawing. */
export const layers = [
  {
    id: "interface",
    name: "Interface",
    tech: "Next.js · React · Tailwind CSS",
    body: "Server-rendered React that works on a cheap phone over mobile data. Mobile-first layouts, accessible forms and keyboard support, and full right-to-left layouts where a product needs Arabic.",
    evidence: ["markaz-il-ginna", "eksu-sports-hub"],
  },
  {
    id: "application",
    name: "Application",
    tech: "TypeScript · Auth · APIs",
    body: "The rules: who is signed in, what they are allowed to do, and what a valid request looks like. Checked on the server every time — never only in the interface.",
    evidence: ["kandys-treats", "markaz-il-ginna"],
  },
  {
    id: "data",
    name: "Data",
    tech: "PostgreSQL · Supabase · Firebase",
    body: "Schemas designed around the real business, versioned migrations, Row Level Security, append-only histories for money and records, and real-time updates where people are watching live.",
    evidence: ["eksu-sports-hub", "kandys-treats"],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    tech: "Vercel · DNS · Git → DevOps",
    body: "Deployments, domains and DNS, environment configuration, object storage and production debugging. The layer I'm growing into next: CI/CD, containers, infrastructure as code and observability.",
    evidence: ["amigo-world", "bia-jupeb"],
  },
] as const;

export type LayerId = (typeof layers)[number]["id"];
