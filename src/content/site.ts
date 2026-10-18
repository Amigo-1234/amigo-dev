import portraitImage from "@/assets/portrait/muftau-idris.webp";

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
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://amigo-dev.vercel.app").replace(/\/$/, ""),
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
  /** Portrait supplied by the owner. Set to null to show the designed fallback instead. */
  portrait: {
    image: portraitImage,
    alt: "Muftau Idris in a black turtleneck, chin resting on his hand, at a desk in a warmly lit workspace.",
    /** Where the face sits, for responsive cropping (CSS object-position). */
    focus: "50% 30%",
  } as { image: typeof portraitImage; alt: string; focus: string } | null,
} as const;

export const nav = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;
