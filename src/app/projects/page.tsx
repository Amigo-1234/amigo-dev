import type { Metadata } from "next";

import { ProjectFilter } from "@/components/project-filter";
import { categories, projects, smallerWork, toCard } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies from Muftau Idris: a university sports platform, a food ordering system, a bilingual school records platform, a social network and websites for organisations in Nigeria.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="shell pt-12 md:pt-20">
      <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-12 md:pb-16">
        <div className="md:col-span-8">
          <p className="label">Index of work · {projects.length} case studies</p>
          <h1 className="mt-6 font-serif text-display">
            Projects<span className="text-accent">.</span>
          </h1>
        </div>
        <p className="self-end text-lg leading-relaxed text-fg-muted md:col-span-4">
          Applications and websites for schools, a kitchen, a university sports community, a mosque and my own
          products. Each page says what is live, what is still being built and what I did.
        </p>
      </header>

      <div className="pt-10">
        <ProjectFilter projects={projects.map(toCard)} categories={categories} />
      </div>

      <section aria-labelledby="smaller-heading" className="mt-28 border-t border-line pt-10">
        <h2 id="smaller-heading" className="label">
          Smaller builds
        </h2>
        <ul className="mt-6">
          {smallerWork.map((item) => (
            <li key={item.name} className="grid gap-2 border-b border-line py-5 md:grid-cols-12 md:gap-8">
              <p className="font-serif text-2xl md:col-span-4">{item.name}</p>
              <p className="text-fg-muted md:col-span-6">{item.description}</p>
              <p className="font-mono text-xs text-fg-subtle md:col-span-2 md:text-right">{item.stack.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
