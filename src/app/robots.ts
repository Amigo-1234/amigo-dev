import type { MetadataRoute } from "next";

import { site } from "@/content/site";

/*
 * Crawler policy: every public page may be crawled by everyone. Nothing on
 * this site is private, and being found is the point of a portfolio.
 *
 * Search and answer engines (named below only to document the intent; the
 * "*" rule already allows them):
 *   Googlebot        Google Search, including AI Overviews
 *   Bingbot          Bing, which also feeds Copilot and other search products
 *   OAI-SearchBot    ChatGPT search results     ChatGPT-User   links a ChatGPT user opens
 *   PerplexityBot    Perplexity search          Claude-SearchBot / Claude-User   Claude search and links
 *   Applebot         Siri and Spotlight         DuckDuckBot    DuckDuckGo
 *
 * AI-training crawlers (GPTBot, Google-Extended, ClaudeBot, CCBot,
 * Applebot-Extended) are also allowed, by choice. Blocking them would not
 * remove the site from any company's search results; to opt out of training
 * later, add a group like { userAgent: ["GPTBot", "Google-Extended", ...], disallow: "/" }.
 *
 * The non-standard "Host" directive is not used: Google ignores it, and the
 * preferred host is already set by redirects and canonical URLs.
 */
const searchCrawlers = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-SearchBot",
  "Claude-User",
  "Applebot",
  "DuckDuckBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: searchCrawlers, allow: "/" },
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
