import { nav, site } from "@/content/site";
import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";

const columns: FooterColumn[] = [
  {
    title: "Contact",
    links: [
      { label: "Start a conversation", href: "/contact" },
      { label: site.email, href: `mailto:${site.email}` },
    ],
  },
  {
    title: "Index",
    links: [{ href: "/" , label: "Home" }, ...nav, { href: "/play", label: "Play DEBUG.EXE" }],
  },
  {
    title: "Elsewhere",
    links: [
      { href: site.social.github, label: "GitHub" },
      { href: site.social.linkedin, label: "LinkedIn" },
      { href: site.social.x, label: "X" },
    ],
  },
];

export function SiteFooter() {
  return (
    <div className="defer-render relative mt-24 md:mt-36">
      <HalftoneWordmarkFooter
        wordmark="amigo"
        label="Have something that needs to work properly?"
        meta={`© ${new Date().getFullYear()} ${site.name} · Nigeria`}
        columns={columns}
        preset="night"
        height="560px"
      />
    </div>
  );
}
