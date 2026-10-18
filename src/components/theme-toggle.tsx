"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Private browsing can refuse storage; the theme still applies for this visit.
  }
}

export function toggleTheme() {
  setTheme(readTheme() === "dark" ? "light" : "dark");
}

export function useTheme() {
  return useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        "group relative inline-flex size-10 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-line-strong hover:text-fg",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
        {/* A half-filled disc: the filled side follows the active theme. */}
        <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z"
          fill="currentColor"
          className="origin-center transition-transform duration-500 ease-[var(--ease-out-expo)] dark:rotate-180"
        />
      </svg>
    </button>
  );
}
