import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { posts } from "@/content/writing";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects", "/about", "/contact", "/play"].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
  const caseStudies = projects.map((p) => ({
    url: `${site.url}/projects/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const writing = posts.length
    ? [{ url: `${site.url}/writing`, changeFrequency: "weekly" as const, priority: 0.6 }, ...posts.map((p) => ({ url: `${site.url}/writing/${p.slug}`, lastModified: p.date, priority: 0.6 }))]
    : [];
  return [...pages, ...caseStudies, ...writing];
}
