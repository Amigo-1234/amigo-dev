/*
 * Technical writing. Add a post by appending to `posts`; the /writing index,
 * the post route and the sitemap pick it up automatically. While the list is
 * empty those routes return 404 and nothing is linked, so no placeholder
 * article is ever published.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date, e.g. "2026-11-02". */
  date: string;
  tags: string[];
  blocks: Block[];
};

export const posts: Post[] = [];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
