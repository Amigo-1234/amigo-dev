import { ImageResponse } from "next/og";

import { getProject, projects } from "@/content/projects";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "Case study by Muftau Idris";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <OgFrame
        eyebrow={`Case study · ${project.status.label}`}
        title={project.name}
        subtitle={project.summary}
        footer={project.stack.slice(0, 5).join("  ·  ")}
        tint={project.tint}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
