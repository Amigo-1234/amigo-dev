import type { MetadataRoute } from "next";

import { experiments } from "@/content/lab";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { contentUpdated, type UpdatedPath } from "@/content/updated";
import { posts } from "@/content/writing";

/*
 * Every indexable page, with the date its content last changed (see
 * src/content/updated.ts). changefreq and priority are left out: Google
 * ignores them, and lastmod is the signal it does use when it is accurate.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lab = experiments.map((e) => e.href).filter((href) => href !== "/play") as UpdatedPath[];
  const pages: UpdatedPath[] = ["/", "/about", "/projects", "/contact", "/lab", "/play", ...lab];
  // Pages marked noindex stay on the site but are left out of the sitemap.
  const caseStudies = projects.filter((p) => !p.noindex).map((p) => ({
    url: `${site.url}/projects/${p.slug}`,
    lastModified: contentUpdated.caseStudies,
  }));
  const writing = posts.length
    ? [{ url: `${site.url}/writing` }, ...posts.map((p) => ({ url: `${site.url}/writing/${p.slug}`, lastModified: p.date }))]
    : [];
  return [
    // The home URL is written exactly as its canonical tag (no trailing slash).
    ...pages.map((path) => ({ url: path === "/" ? site.url : `${site.url}${path}`, lastModified: contentUpdated[path] })),
    ...caseStudies,
    ...writing,
  ];
}
