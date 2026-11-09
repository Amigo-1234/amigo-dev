"use client";

import { useRouter } from "next/navigation";

import FlexCarousel from "@/components/ui/flex-carousel";

/*
 * Every real screenshot from every project in one row, bent through an
 * invisible lens (React Bits FlexCarousel). Drag, scroll or use the arrow
 * keys; select the centred screen to open its case study.
 */
export type Screen = { src: string; alt: string; project: string; slug: string; caption: string };

const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`;

export function ScreensCarousel({ screens }: { screens: Screen[] }) {
  const router = useRouter();
  const items = screens.map((s) => ({ src: optimised(s.src), alt: s.alt, title: s.project, subtitle: s.caption }));

  return (
    <div className="relative h-[26rem] w-full sm:h-[34rem]">
      <FlexCarousel
        items={items}
        preset="liquid"
        intro="rise"
        fit="landscape"
        cardHeight={0.52}
        gap={14}
        radius={10}
        squeeze={0.2}
        focusOnClick={false}
        captions
        captureWheel={false}
        ariaLabel="Project screenshots. Use the arrow keys to move, Enter to open the case study."
        onSelect={(i) => router.push(`/projects/${screens[i].slug}`)}
      />
    </div>
  );
}
