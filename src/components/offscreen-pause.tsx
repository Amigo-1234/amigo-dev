"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * Pauses the decorative loops (swinging, blinking, flickering windows) in any
 * [data-anim-zone] that is off screen, by marking it [data-offscreen]; CSS
 * does the pausing. Saves phones from painting animations nobody can see.
 */
export function OffscreenPause() {
  const pathname = usePathname();

  useEffect(() => {
    const zones = document.querySelectorAll<HTMLElement>("[data-anim-zone]");
    if (!zones.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.toggleAttribute("data-offscreen", !e.isIntersecting)),
      { rootMargin: "100px 0px" },
    );
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
