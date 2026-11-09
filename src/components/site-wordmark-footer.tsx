"use client";

import { useRef, useSyncExternalStore } from "react";

import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";
import { nav, site } from "@/content/site";
import { useClientLinks } from "@/lib/use-client-links";

import { LocalTime } from "./local-time";
import { useTheme } from "./theme-toggle";

/*
 * The site footer: AMIGODEV printed as halftone dots that part around the
 * pointer, in the current theme's own colours (black or paper, with the
 * site red as the warm colour). Its links are real anchors; same-site ones are
 * routed client-side.
 */
const PALETTES = {
  dark: { background: "#050506", ink: "#f3f3f1", warm: "#ff4545" },
  light: { background: "#ebe7dd", ink: "#151513", warm: "#c8102e" },
} as const;

const columns: FooterColumn[] = [
  {
    title: "Index",
    links: [{ label: "Home", href: "/" }, ...nav.map((n) => ({ label: n.label, href: n.href })), { label: "Play DEBUG.EXE", href: "/play" }],
  },
  {
    title: "Elsewhere",
    links: [
      // rel="me": these are the owner's own profiles.
      { label: "GitHub", href: site.social.github, external: true, rel: "me noopener noreferrer" },
      { label: "LinkedIn", href: site.social.linkedin, external: true, rel: "me noopener noreferrer" },
      { label: "X", href: site.social.x, external: true, rel: "me noopener noreferrer" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Start a project", href: "/contact" },
      { label: "Email", href: `mailto:${site.email}` },
    ],
  },
];

/** The canvas needs a real family name, so read the one next/font gave the page. */
const noop = () => () => {};
const pageFont = () => getComputedStyle(document.body).fontFamily;
const FALLBACK_FONT = '"Helvetica Neue", Arial, system-ui, sans-serif';

export function SiteWordmarkFooter() {
  const theme = useTheme();
  const font = useSyncExternalStore(noop, pageFont, () => FALLBACK_FONT);
  const ref = useRef<HTMLDivElement>(null);
  useClientLinks(ref);

  return (
    <div ref={ref}>
      <HalftoneWordmarkFooter
        wordmark="amigodev"
        label={`${site.name} · ${site.brand}`}
        meta="Full-stack developer · Nigeria"
        columns={columns}
        palette={PALETTES[theme]}
        fontFamily={font}
        fontWeight={800}
        monoFamily="var(--font-geist-mono), ui-monospace, monospace"
        crop={0.18}
        height="clamp(540px, 46vw, 620px)"
        note={
          <>
            © {new Date().getFullYear()} · <LocalTime /> ·{" "}
            <span title="Try it on your keyboard">↑↑↓↓←→←→BA</span>
          </>
        }
      />
    </div>
  );
}
