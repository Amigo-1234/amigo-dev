import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { type Block, getPost, posts } from "@/content/writing";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    path: `/writing/${post.slug}`,
    title: post.title,
    description: post.summary,
    openGraph: { type: "article", publishedTime: post.date },
  });
}

function renderBlock(block: Block, key: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={key} className="mt-12 font-serif text-4xl">
          {block.text}
        </h2>
      );
    case "list":
      return (
        <ul key={key} className="mt-5 list-disc space-y-2 pl-5 text-lg text-fg-muted marker:text-accent">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre key={key} className="mt-6 overflow-x-auto rounded-xl border border-line bg-ink-sunken p-5 font-mono text-sm leading-relaxed">
          <code data-language={block.language}>{block.code}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote key={key} className="mt-6 border-l-2 border-accent pl-5 font-serif text-2xl">
          {block.text}
        </blockquote>
      );
    default:
      return (
        <p key={key} className="mt-5 text-lg leading-relaxed text-fg-muted">
          {block.text}
        </p>
      );
  }
}

export default async function PostPage({ params }: PageProps<"/writing/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <article className="shell max-w-3xl pt-12 md:pt-20">
      <time dateTime={post.date} className="label">
        {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.date))}
      </time>
      <h1 className="mt-6 font-serif text-headline">{post.title}</h1>
      <p className="mt-6 text-xl text-fg-muted">{post.summary}</p>
      <div className="mt-10 border-t border-line pt-4">{post.blocks.map(renderBlock)}</div>
    </article>
  );
}
