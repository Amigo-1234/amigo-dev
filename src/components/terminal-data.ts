import { building, buildingAsOf } from "@/content/building";
import { experiments } from "@/content/lab";
import { skills } from "@/content/profile";
import { projects } from "@/content/projects";

/*
 * What the terminal knows, taken straight from the site's content files so it
 * can never say anything the case studies don't. Imported only by the
 * terminal, which itself loads only when someone opens it.
 */
export const terminalData = {
  projects: projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    stack: [...p.stack],
    status: p.status.label,
    live: p.links.live?.href,
  })),
  skills: skills.map((g) => ({ title: g.title, items: [...g.items] })),
  building: { asOf: buildingAsOf, items: building.map((b) => ({ slug: b.slug, name: b.name, now: b.now, next: b.next, lastCommit: b.lastCommit })) },
  lab: experiments.map((e) => ({ code: e.code, title: e.title, href: e.href, kind: e.kind })),
};

export type TerminalData = typeof terminalData;
