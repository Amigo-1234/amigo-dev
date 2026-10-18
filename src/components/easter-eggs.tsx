"use client";

import { useEffect, useState } from "react";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/*
 * Small surprises for the curious:
 * - a note in the browser console for developers;
 * - the Konami code toggles "blueprint mode", which draws the page's layout
 *   boxes like a construction drawing.
 */
export function EasterEggs() {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    console.log(
      "%cAMIGODEV%c\nHey, fellow developer. This site is Next.js + TypeScript + Tailwind + GSAP.\nTry the terminal on the home page, Ctrl/⌘+K anywhere, or ↑↑↓↓←→←→BA.",
      "font: 600 20px/1.4 system-ui; color: #f26b3a; letter-spacing: .12em",
      "font: 13px/1.6 ui-monospace, monospace",
    );

    let progress = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        const root = document.documentElement;
        const on = !root.hasAttribute("data-blueprint");
        root.toggleAttribute("data-blueprint", on);
        setToast(on ? "Blueprint mode on — every box, drawn. Enter the code again to switch it off." : "Blueprint mode off.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      {toast && (
        <p className="glass rounded-full px-5 py-2.5 text-sm text-fg [animation:page-enter_0.4s_var(--ease-out-expo)_both]">{toast}</p>
      )}
    </div>
  );
}
