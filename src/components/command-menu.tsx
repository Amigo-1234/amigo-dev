"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

import { renderAll } from "./defer-render-script";
import { toggleTheme } from "./theme-toggle";

const OPEN_EVENT = "amigodev:command-menu";

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Item = {
  id: string;
  group: "Pages" | "Projects" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  href?: string;
  external?: string;
  action?: "theme" | "copy-email";
};

export type ProjectEntry = { slug: string; name: string; category: string; keywords: string };

const pages: Item[] = [
  { id: "home", group: "Pages", label: "Home", href: "/" },
  { id: "work", group: "Pages", label: "All projects", keywords: "work portfolio case studies", href: "/projects" },
  { id: "about", group: "Pages", label: "About me", keywords: "story languages interests journey", href: "/about" },
  { id: "services", group: "Pages", label: "Services", keywords: "hire freelance client", href: "/#services" },
  { id: "contact", group: "Pages", label: "Contact", keywords: "email message hire", href: "/contact" },
  { id: "play", group: "Pages", label: "Play DEBUG.EXE", keywords: "game arcade bugs fun", href: "/play" },
];

const actions: Item[] = [
  { id: "theme", group: "Actions", label: "Switch theme", keywords: "dark light mode", action: "theme" },
  { id: "copy-email", group: "Actions", label: "Copy email address", hint: site.email, action: "copy-email" },
  { id: "github", group: "Actions", label: "Open GitHub", hint: "github.com/Amigo-1234", external: site.social.github },
  { id: "linkedin", group: "Actions", label: "Open LinkedIn", external: site.social.linkedin },
];

export function CommandMenu({ projects }: { projects: ProjectEntry[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");
  const listId = useId();

  const close = useCallback(() => dialogRef.current?.close(), []);

  const run = (item: Item) => {
    if (item.action === "copy-email") {
      navigator.clipboard?.writeText(site.email).then(
        () => setNotice("Email address copied"),
        () => setNotice(`Copy failed. The address is ${site.email}`),
      );
      return;
    }
    close();
    if (item.action === "theme") toggleTheme();
    else if (item.external) window.open(item.external, "_blank", "noopener,noreferrer");
    else if (item.href) {
      renderAll(item.href);
      router.push(item.href);
    }
  };

  const items = useMemo<Item[]>(
    () => [
      ...pages,
      ...projects.map<Item>((p) => ({
        id: `p-${p.slug}`,
        group: "Projects",
        label: p.name,
        hint: p.category,
        keywords: p.keywords,
        href: `/projects/${p.slug}`,
      })),
      ...actions,
    ],
    [projects],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    setQuery("");
    setActive(0);
    setNotice("");
    dialog.showModal();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, [open, close]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) run(item);
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search and quick actions"
      className="glass mx-auto mt-[12vh] w-[min(36rem,calc(100%-2rem))] overflow-hidden rounded-2xl p-0 text-fg backdrop:bg-ink/70 backdrop:backdrop-blur-sm [&[open]]:animate-[page-enter_0.3s_var(--ease-out-expo)_both]"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 shrink-0 text-fg-subtle">
          <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          aria-label="Search pages, projects and actions"
          placeholder="Search pages, projects, actions…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onInputKey}
          className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle"
          autoComplete="off"
          spellCheck={false}
        />
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[0.6875rem] text-fg-subtle sm:block">Esc</kbd>
      </div>

      <ul id={listId} role="listbox" aria-label="Results" className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
        {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-fg-muted">Nothing matches “{query}”.</li>}
        {results.map((item, i) => {
          const heading = item.group !== results[i - 1]?.group ? item.group : null;
          return (
            <li key={item.id} role="presentation">
              {heading && (
                <div role="presentation" className="label px-3 pb-1.5 pt-3">
                  {heading}
                </div>
              )}
              <div
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => run(item)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm",
                  i === active ? "bg-surface-strong text-fg" : "text-fg-muted",
                )}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className={cn("size-1.5 rounded-full", i === active ? "bg-accent" : "bg-line-strong")} />
                  {item.label}
                </span>
                {item.hint && <span className="truncate font-mono text-xs text-fg-subtle">{item.hint}</span>}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2.5 text-xs text-fg-subtle">
        <span aria-live="polite">{notice || "↑ ↓ to move · Enter to open"}</span>
        <span className="font-mono">{site.brand}</span>
      </div>
    </dialog>
  );
}
