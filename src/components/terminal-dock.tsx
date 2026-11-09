"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { sfx } from "@/lib/sound";

import { TerminalBar } from "./terminal-bar";

/*
 * The terminal, available on every page: the header's ">_ terminal" button or
 * the ` key slides it up over whatever you are reading. It is a modal dialog
 * (focus stays inside, Escape or a click outside closes it, focus returns to
 * where it was). The terminal's code loads the first time it opens.
 */

const TERMINAL_EVENT = "amigodev:terminal";

/** Open the terminal dock from anywhere (a button, the command menu). */
export function openTerminal() {
  window.dispatchEvent(new Event(TERMINAL_EVENT));
}

const Terminal = dynamic(() => import("./terminal").then((m) => m.Terminal), {
  ssr: false,
  loading: () => (
    <div className="terminal-body px-4 pt-4 text-[#b8b4ad]">
      <p>Starting the shell…</p>
    </div>
  ),
});

export function TerminalDock() {
  const ref = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const open = () => {
      if (dialog.open) return;
      setMounted(true);
      dialog.showModal();
      sfx("gear");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "`" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.documentElement.getAttribute("data-ignition") === "idle") return;
      e.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    };
    window.addEventListener(TERMINAL_EVENT, open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(TERMINAL_EVENT, open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // A command that navigates (open eksu, hire) closes the dock on arrival.
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      aria-label="Terminal"
      className="terminal-dock"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      onClose={() => sfx("close")}
    >
      <div className="terminal-dock__screen">
        <div className="relative">
          <TerminalBar />
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="terminal-dock__close absolute right-3 top-1/2 -translate-y-1/2"
          >
            Close <span aria-hidden="true">· esc</span>
          </button>
        </div>
        {mounted && <Terminal autoFocus bar={false} className="contents" />}
      </div>
    </dialog>
  );
}
