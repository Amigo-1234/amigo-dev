import { ImageResponse } from "next/og";

import { site } from "@/content/site";
import { OgFrame, ogFonts, ogPortrait, ogSize } from "@/lib/og";

export const alt = `${site.name} — ${site.role}`;
export const size = ogSize;
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Portfolio"
        title="Muftau Idris"
        subtitle="Full-stack developer and engineering student. I design, build, deploy and maintain web applications."
        footer={site.disciplines.join("  ·  ")}
        portrait={site.portrait ? await ogPortrait() : undefined}
      />
    ),
    { ...size, fonts: await ogFonts() },
  );
}
