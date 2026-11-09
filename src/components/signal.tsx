"use client";

import { ComicText } from "@/components/ui/comic-text";
import { ConfettiButton } from "@/components/ui/confetti";
import ElectricLogo from "@/components/ui/electric-logo";
import { useWebBurstOptions } from "@/lib/web-burst";

import { useTheme } from "./theme-toggle";

/*
 * The interlude between the work and the rest: the AMIGODEV mark traced in
 * live current (React Bits ElectricLogo; hover charges it, a click sends a
 * ripple), the four verbs printed comic-style, and a button that shoots a
 * burst of tiny spiders.
 */
const ELECTRIC = {
  dark: { color: "#ffe1e1", glowColor: "#ff4545", theme: "dark" },
  light: { color: "#c8102e", glowColor: "#ff6b6b", theme: "light" },
} as const;

export function Signal() {
  const theme = useTheme();
  const burst = useWebBurstOptions();

  return (
    <section aria-labelledby="signal-heading" className="defer-render relative mt-28 overflow-hidden border-y border-line bg-ink-sunken md:mt-40">
      <div className="shell grid items-center gap-6 py-16 md:grid-cols-2 md:py-20">
        <div className="relative h-[18rem] sm:h-[24rem]">
          {/* Rebuilt when the theme flips, so the light version draws ink instead of light. */}
          <ElectricLogo
            key={theme}
            src="/brand/amigodev-mark-paper.svg"
            {...ELECTRIC[theme]}
            scale={0.62}
            strands={4}
            bend={0.6}
            crackle={1.5}
            arcs={1}
            speed={2.2}
            interactive
          />
        </div>
        <div className="text-center md:text-left">
          <h2 id="signal-heading" className="sr-only">
            Design, build, deploy, maintain
          </h2>
          <ComicText
            as="p"
            fontSize={3.4}
            className="text-center leading-[1.05] md:text-left [&]:tracking-wide"
            dotColor={theme === "dark" ? "#ff4545" : "#c8102e"}
            backgroundColor={theme === "dark" ? "#f3f3f1" : "#ffffff"}
            strokeColor="#0a0a0b"
          >
            Design. Build. Deploy. Maintain.
          </ComicText>
          <p className="mx-auto mt-6 max-w-md text-fg-muted md:mx-0">
            One person on every layer, from the first sketch to the server it runs on, and still there after launch.
          </p>
          <ConfettiButton variant="outline" className="mt-8" options={burst}>
            Shoot a web
            <span aria-hidden="true">🕸</span>
          </ConfettiButton>
        </div>
      </div>
    </section>
  );
}
