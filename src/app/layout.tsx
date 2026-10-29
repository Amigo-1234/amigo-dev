import type { Metadata, Viewport } from "next";

import { CommandMenu } from "@/components/command-menu";
import { DeferRenderScript } from "@/components/defer-render-script";
import { EasterEggs } from "@/components/easter-eggs";
import { MenuScript } from "@/components/menu-script";
import { MotionLayer } from "@/components/motion-layer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme";
import { JsonLd } from "@/components/ui";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { siteGraph } from "@/lib/schema";

import { GeistMono, GeistSans, instrumentSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} (${site.brand}) — Full-Stack Developer`,
    template: `%s — ${site.name} · ${site.brand}`,
  },
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: `${site.name} · ${site.brand}`,
    title: `${site.name} (${site.brand}) — Full-Stack Developer`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    creator: site.xHandle,
    title: `${site.name} (${site.brand}) — Full-Stack Developer`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <ThemeScript />
        <MenuScript />
        <DeferRenderScript />
      </head>
      <body className="min-h-dvh">
        {/* The site-wide WebSite and Person entities; pages refer to them by @id. */}
        <JsonLd data={siteGraph()} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <MotionLayer />
        <EasterEggs />
        <CommandMenu
          projects={projects.map((p) => ({
            slug: p.slug,
            name: p.name,
            category: p.categories[0],
            keywords: `${p.client ?? ""} ${p.stack.join(" ")}`,
          }))}
        />
      </body>
    </html>
  );
}
