import type { Metadata } from "next";

import { site } from "@/content/site";

/**
 * Metadata for a page other than the home page. Next.js replaces (rather than
 * merges) the root layout's openGraph and twitter objects when a page sets
 * its own, so each page passes its full set here: canonical URL, og:url,
 * title and description all point at that page, not the home page. The site
 * card is the share image unless the page has its own opengraph-image file
 * (case studies), which is picked up when ownImage is set.
 */
export function pageMetadata({
  path,
  title,
  description,
  openGraph,
  ownImage = false,
}: {
  path: string;
  title: string;
  description: string;
  openGraph?: { type: "article"; publishedTime?: string };
  ownImage?: boolean;
}): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  const image = { width: 1200, height: 630, alt: `${site.name} — ${site.role}` };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: `${site.name} · ${site.brand}`,
      url: path,
      title: fullTitle,
      description,
      ...(ownImage ? {} : { images: [{ url: "/opengraph-image", ...image }] }),
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ownImage ? {} : { images: [{ url: "/twitter-image", ...image }] }),
    },
  };
}
