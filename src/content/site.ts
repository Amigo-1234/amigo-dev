import type { StaticImageData } from "next/image";

import portraitImage from "@/assets/portrait/muftau-idris.jpg";

/**
 * Site-wide facts. Everything here is public and was confirmed by the owner
 * or carried over from the previous portfolio. Leave a field `null` rather
 * than guessing — components hide anything that is missing.
 */
export const site = {
  name: "Muftau Idris",
  brand: "AMIGODEV",
  role: "Full-Stack Developer & Engineering Student",
  disciplines: ["Software Engineering", "Web Applications", "Digital Infrastructure"],
  direction: "DevOps Engineering",
  /** Primary domain. Canonical, sitemap, robots, Open Graph and JSON-LD URLs all derive from it. */
  url: "https://www.amigodev.com.ng",
  description:
    "Muftau Idris (AMIGODEV) is a full-stack developer and Mechanical Engineering student at Ekiti State University who designs, builds, deploys and maintains web applications with Next.js, TypeScript and PostgreSQL.",
  locale: "en_NG",
  location: "Nigeria",
  timeZone: "Africa/Lagos",
  email: "Olamidesamson841@gmail.com",
  social: {
    github: "https://github.com/Amigo-1234",
    linkedin: "https://www.linkedin.com/in/muftau-idris-3221603a1",
  },
  /** Path to a verified CV in /public. The CV button only appears when this is set. */
  resume: null as string | null,
  /**
   * Portrait supplied by the owner. While null, a branded card is shown in its
   * place. To add one: put the image in src/assets/portrait/, import it here
   * and set { image, alt, focus } (focus is a CSS object-position, e.g. "50% 30%").
   */
  portrait: {
    image: portraitImage,
    alt: "Muftau Idris in a black suit, white shirt, tie and dark-rimmed glasses, seated in a leather chair in a warmly lit, wood-panelled room.",
    focus: "50% 30%",
  } as { image: StaticImageData; alt: string; focus: string } | null,
} as const;

export const nav = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/lab", label: "Lab" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;
