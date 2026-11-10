import Link from "next/link";

import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";
import { nav, site } from "@/content/site";

import { Caption } from "./comic";
import { LocalTime } from "./local-time";
import { Skyline } from "./skyline";
import { SpiderBotArt } from "./spider-bot";
import { ButtonLink } from "./ui";
import { WebSlingerArt } from "./web-slinger";

/*
 * The end of every page, as the last scene of the film: the call to swing by,
 * the index and the profiles, and then the city at night, where the hero sits
 * on a ledge with a laptop lighting his face and the bot hangs off the
 * billboard. Server-rendered; the only live part is the local time.
 */

const SOCIAL = [
  {
    label: "GitHub",
    href: site.social.github,
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
        />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: site.social.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"
        />
      </svg>
    ),
  },
  {
    label: "X",
    href: site.social.x,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z" />
      </svg>
    ),
  },
];

const MAIL_ICON = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 5.5h18v13H3z M3 6l9 7 9-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
  </svg>
);

export function SiteFooter() {
  const year = new Date().getFullYear();
  const index = [{ label: "Home", href: "/" }, ...nav, { label: "Play DEBUG.EXE", href: "/play" }];

  return (
    <footer className="finale defer-render">
      {/* The call. */}
      <section aria-labelledby="finale-title" className="shell finale__call" data-buddy="End of the line, friend. Say hi? I'll swing your message over myself.">
        <Caption>With great code comes great responsibility</Caption>
        <h2 id="finale-title" className="finale__title">
          Swing by. <span className="finale__title-hot">Let&apos;s build.</span>
        </h2>
        <p className="finale__lede">
          Websites, applications and the systems behind them, for schools, businesses and teams. Tell me what needs to
          work, and I&apos;ll tell you how I&apos;d build it.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <ButtonLink href={`mailto:${site.email}`}>Email me</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Start a project
          </ButtonLink>
        </div>
      </section>

      {/* The index and the sign-off. */}
      <div className="shell finale__bar">
        <nav aria-label="Footer" className="finale__index">
          <ul>
            {index.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="nav-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="finale__sign">
          <p className="finale__mark">
            <svg viewBox="0 0 48 48" aria-hidden="true" className="finale__logo">
              <path d={MONOGRAM_INK} fill="currentColor" fillRule="evenodd" />
              <path d={MONOGRAM_BAR} fill="var(--accent)" />
            </svg>
            <span>
              © {year} {site.name} · Nigeria · <LocalTime />
              {" · "}
              {/* A full page load on purpose: the intro's gate runs in <head>, before React. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/?ignition" className="finale__replay">
                Replay the intro
              </a>
              <span className="finale__konami" title="Try it on your keyboard">
                {" "}
                · ↑↑↓↓←→←→BA
              </span>
            </span>
          </p>
          <ul className="finale__social" aria-label="Profiles">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="me noopener noreferrer" className="finale__icon" title={s.label}>
                  {s.icon}
                  <span className="sr-only">{s.label} (opens in a new tab)</span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="finale__icon" title="Email">
                {MAIL_ICON}
                <span className="sr-only">Email {site.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* The last shot: the city at night, the hero on a ledge, working late. */}
      <div className="finale__scene" aria-hidden="true" data-anim-zone>
        <Skyline seed={29} className="finale__city" />
        <div className="finale__roof">
          <span className="finale__roof-sign">AMIGODEV · NIGERIA</span>
        </div>
        <div className="finale__hero">
          <WebSlingerArt pose="sit" className="finale__hero-art" />
        </div>
        <div className="finale__bot">
          <SpiderBotArt />
        </div>
      </div>
    </footer>
  );
}
