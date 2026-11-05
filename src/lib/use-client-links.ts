"use client";

import { useRouter } from "next/navigation";
import { useEffect, type RefObject } from "react";

/**
 * Pasted UI components render plain <a> elements. Inside `ref`, send clicks on
 * same-site links through the Next.js router so they navigate without a full
 * page reload, the way <Link> does. New-tab clicks, downloads, external and
 * mailto: links are left to the browser.
 */
export function useClientLinks(ref: RefObject<HTMLElement | null>) {
  const router = useRouter();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || !el.contains(a) || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      e.preventDefault();
      router.push(href);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [ref, router]);
}
