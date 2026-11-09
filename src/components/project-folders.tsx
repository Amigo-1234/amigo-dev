"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

import GlassFolder, { type ArtRecipe, type FolderFile } from "@/components/ui/glass-folder-cards";
import { useClientLinks } from "@/lib/use-client-links";

import { useTheme } from "./theme-toggle";

/*
 * Every project as a glass folder. The back panel is generated art in the
 * project's own tint, the files are its real screenshots (through the Next.js
 * image optimiser, at the size a file is drawn, at its default quality of 75), and the front file is the
 * case study. Open a folder to fan the screens out; any file opens the case
 * study. The folders follow the site theme: milk glass on paper, smoked glass
 * on black.
 */
export type FolderProject = {
  slug: string;
  name: string;
  /** Short status for the folder's second line, e.g. "Live" or "In development". */
  status: string;
  tint: string;
  live?: string;
  shots: Array<{ src: string; caption: string; device: "desktop" | "mobile" }>;
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

/** Ink folding through the project's tint, on the site's black. */
function recipeFor(tint: string, i: number): ArtRecipe {
  return {
    style: i % 3 === 1 ? "streak" : "marble",
    colors: ["#050506", mix(tint, "#050506", 0.62), mix(tint, "#000000", 0.25), tint, mix(tint, "#ffffff", 0.45), "#f3f3f1"],
    scale: 0.7,
    warp: i % 3 === 1 ? 1.5 : 3.2,
    angle: -0.6 + i * 0.9,
    gloss: 0.45,
    veins: i % 3 === 1 ? 0 : 0.45,
  };
}

const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;
/** "Home feed with Moments, the composer…" → "Home feed with Moments" */
const shortCaption = (c: string) => c.split(/[.,;:—]/)[0].trim();

export function ProjectFolders({ projects }: { projects: FolderProject[] }) {
  const theme = useTheme();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  useClientLinks(ref);

  return (
    // Folders are 340px. Screens too narrow for that (under 372px with the 16px gutters) scale them in CSS,
    // so the size is right from the first paint and nothing shifts after hydration.
    <div
      ref={ref}
      className="grid grid-cols-1 justify-items-center gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3 max-[23.25rem]:[zoom:0.84]"
    >
      {projects.map((p, i) => {
        const href = `/projects/${p.slug}`;
        const files: FolderFile[] = [
          ...p.shots.slice(0, 3).map((s) => ({
            name: shortCaption(s.caption),
            meta: s.device === "mobile" ? "Phone" : "Desktop",
            image: optimised(s.src),
            href,
          })),
          // The case study sits at the front, nearest the glass.
          { name: "Case study", meta: "Read", href },
        ];
        return (
          <GlassFolder
            key={p.slug}
            label={p.name}
            meta={p.status}
            tone={theme === "dark" ? "dark" : "light"}
            art={recipeFor(p.tint, i)}
            seed={i * 7 + 3}
            files={files}
            action="more"
            menu={[
              { label: "Read the case study", onSelect: () => router.push(href) },
              ...(p.live ? [{ label: "Visit the live site ↗", onSelect: () => window.open(p.live, "_blank", "noopener,noreferrer") }] : []),
            ]}
            labelPlacement={i % 2 === 0 ? "bottom-left" : "top-left"}
            width={340}
            appearDelay={(i % 3) * 120}
          />
        );
      })}
    </div>
  );
}
