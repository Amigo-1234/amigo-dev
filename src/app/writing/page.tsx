import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { posts } from "@/content/writing";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical notes by Muftau Idris on building, deploying and maintaining web applications.",
  alternates: { canonical: "/writing" },
};

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function WritingPage() {
  if (posts.length === 0) notFound();
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="shell pt-12 md:pt-20">
      <p className="label">Writing</p>
      <h1 className="mt-6 font-serif text-display">Notes from the build.</h1>
      <ul className="mt-16 border-t border-line">
        {sorted.map((post) => (
          <li key={post.slug} className="border-b border-line py-8">
            <Link href={`/writing/${post.slug}`} className="group grid gap-3 md:grid-cols-12">
              <time dateTime={post.date} className="label md:col-span-3">
                {date.format(new Date(post.date))}
              </time>
              <span className="md:col-span-9">
                <span className="font-serif text-3xl group-hover:text-accent">{post.title}</span>
                <span className="mt-2 block text-fg-muted">{post.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
