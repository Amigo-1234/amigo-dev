"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { site } from "@/content/site";

import { toggleTheme } from "./theme-toggle";

/*
 * A small terminal with a fixed set of commands. Input is only ever matched
 * against the list below; nothing a visitor types is evaluated or executed.
 */

export type TerminalData = {
  projects: { slug: string; name: string; summary: string }[];
  skills: { title: string; items: string[] }[];
};

type Line = { id: number; kind: "input" | "output" | "error"; content: React.ReactNode };

const MAX_INPUT = 64;

const COMMANDS: { name: string; description: string; hidden?: boolean }[] = [
  { name: "help", description: "list commands" },
  { name: "about", description: "who I am" },
  { name: "projects", description: "list case studies" },
  { name: "open", description: "open a project or page, e.g. open eksu" },
  { name: "skills", description: "what I work with" },
  { name: "contact", description: "how to reach me" },
  { name: "hire", description: "go to the contact form" },
  { name: "play", description: "launch DEBUG.EXE" },
  { name: "theme", description: "switch light/dark" },
  { name: "date", description: "my local time" },
  { name: "clear", description: "clear the screen" },
  { name: "whoami", description: "", hidden: true },
  { name: "ls", description: "", hidden: true },
  { name: "history", description: "", hidden: true },
  { name: "sudo", description: "", hidden: true },
  { name: "barca", description: "", hidden: true },
  { name: "messi", description: "", hidden: true },
  { name: "coffee", description: "", hidden: true },
  { name: "exit", description: "", hidden: true },
];

const PAGES: Record<string, string> = { home: "/", about: "/about", projects: "/projects", work: "/projects", contact: "/contact", play: "/play" };

const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, weekday: "long", hour: "2-digit", minute: "2-digit" });

function Cmd({ children }: { children: React.ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

export function Welcome() {
  return (
    <>
      <p className="text-fg">
        AMIGODEV shell <span className="text-fg-subtle">v2.1</span>
      </p>
      <p className="text-fg-muted">
        Type <Cmd>help</Cmd> to see what I can do. Try <Cmd>projects</Cmd>, <Cmd>skills</Cmd> or <Cmd>open eksu</Cmd>.
      </p>
    </>
  );
}

export function Terminal({ data }: { data: TerminalData }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const [lines, setLines] = useState<Line[]>([{ id: 0, kind: "output", content: <Welcome /> }]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  const print = (kind: Line["kind"], content: React.ReactNode) =>
    setLines((prev) => [...prev, { id: nextId.current++, kind, content }].slice(-60));

  const findProject = (term: string) =>
    data.projects.find((p) => p.slug === term || p.slug.startsWith(term) || p.name.toLowerCase().includes(term));

  function run(raw: string) {
    const input = raw.trim().slice(0, MAX_INPUT);
    if (!input) return;
    print("input", input);
    setHistory((h) => [...h, input].slice(-30));
    setCursor(-1);

    const [command, ...rest] = input.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");

    switch (command) {
      case "help":
        print(
          "output",
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {COMMANDS.filter((c) => !c.hidden).map((c) => (
              <li key={c.name}>
                <Cmd>{c.name.padEnd(9, " ")}</Cmd>
                <span className="text-fg-muted">{c.description}</span>
              </li>
            ))}
          </ul>,
        );
        break;
      case "about":
        print(
          "output",
          <p className="text-fg-muted">
            {site.name} — full-stack developer and Mechanical Engineering student at Ekiti State University. I build web
            applications end to end and I&apos;m growing toward DevOps.{" "}
            <Link href="/about" className="text-fg underline underline-offset-4">
              Read more →
            </Link>
          </p>,
        );
        break;
      case "projects":
      case "ls":
        print(
          "output",
          <ol className="space-y-0.5">
            {data.projects.map((p, i) => (
              <li key={p.slug}>
                <span className="text-fg-subtle">{String(i + 1).padStart(2, "0")} </span>
                <Link href={`/projects/${p.slug}`} className="text-fg underline-offset-4 hover:underline">
                  {p.slug}
                </Link>
                <span className="hidden text-fg-muted sm:inline"> — {p.summary}</span>
              </li>
            ))}
            <li className="pt-1 text-fg-muted">
              Open one with <Cmd>open &lt;name or number&gt;</Cmd>
            </li>
          </ol>,
        );
        break;
      case "open":
      case "cd": {
        if (!arg) {
          print("error", "open what? Try: open eksu, open 2, open about");
          break;
        }
        const n = Number(arg);
        const project = Number.isInteger(n) && n >= 1 && n <= data.projects.length ? data.projects[n - 1] : findProject(arg);
        const page = PAGES[arg];
        if (page) {
          print("output", `opening ${page} …`);
          router.push(page);
        } else if (project) {
          print("output", `opening ${project.name} …`);
          router.push(`/projects/${project.slug}`);
        } else {
          print("error", `no project or page called “${arg}”. Try: projects`);
        }
        break;
      }
      case "skills":
        print(
          "output",
          <ul className="space-y-1">
            {data.skills.map((g) => (
              <li key={g.title}>
                <span className="text-fg">{g.title}: </span>
                <span className="text-fg-muted">{g.items.join(", ")}</span>
              </li>
            ))}
            <li className="text-fg-muted">
              Currently learning: <span className="text-accent">DevOps engineering</span>
            </li>
          </ul>,
        );
        break;
      case "contact":
        print(
          "output",
          <p className="text-fg-muted">
            email{" "}
            <a href={`mailto:${site.email}`} className="text-fg underline underline-offset-4">
              {site.email}
            </a>{" "}
            · github{" "}
            <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4">
              Amigo-1234
            </a>{" "}
            · or type <Cmd>hire</Cmd>
          </p>,
        );
        break;
      case "hire":
        print("output", "opening the contact form … good choice.");
        router.push("/contact");
        break;
      case "play":
        print("output", "launching DEBUG.EXE … mind the heisenbugs.");
        router.push("/play");
        break;
      case "theme":
        toggleTheme();
        print("output", "theme switched.");
        break;
      case "date":
        print("output", `${timeFormat.format(new Date())} in Nigeria (WAT)`);
        break;
      case "clear":
        setLines([]);
        break;
      case "whoami":
        print("output", "visitor — curious enough to open a terminal on a portfolio. I like you already.");
        break;
      case "history":
        print("output", history.length ? history.join("  ·  ") : "nothing yet.");
        break;
      case "sudo":
        print("error", "permission denied. This shell only knows a few safe commands — and that's on purpose.");
        break;
      case "barca":
      case "visca":
        print("output", "Visca el Barça! 🔵🔴  Més que un club.");
        break;
      case "messi":
        print("output", "Lionel Messi. Enough said. 🐐");
        break;
      case "coffee":
        print("output", "☕ 418 I'm a teapot. Try again after the deploy.");
        break;
      case "exit":
        print("output", "there's no exit — only `clear`. (Or the back button.)");
        break;
      case "rm":
        print("error", "nice try. Nothing gets deleted here.");
        break;
      default:
        print("error", `command not found: ${command}. Type help.`);
    }
  }

  function complete() {
    const v = value.trim().toLowerCase();
    if (!v) return;
    if (v.startsWith("open ")) {
      const term = v.slice(5);
      const match = data.projects.find((p) => p.slug.startsWith(term));
      if (match) setValue(`open ${match.slug}`);
      return;
    }
    const match = COMMANDS.find((c) => !c.hidden && c.name.startsWith(v));
    if (match) setValue(match.name + (match.name === "open" ? " " : ""));
  }

  return (
    <div className="glass overflow-hidden rounded-2xl font-mono text-[0.8125rem] leading-relaxed">
      <TerminalBar />
      <div
        ref={bodyRef}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => inputRef.current?.focus()}
        className="h-80 overflow-y-auto px-4 pb-2 pt-4 sm:px-5"
      >
        {lines.map((line) => (
          <div key={line.id} className="mb-2 break-words">
            {line.kind === "input" ? (
              <p>
                <Prompt /> <span className="text-fg">{line.content}</span>
              </p>
            ) : (
              <div className={line.kind === "error" ? "text-warn" : undefined}>{line.content}</div>
            )}
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(value);
            setValue("");
          }}
          className="flex items-center gap-2"
        >
          <label htmlFor={inputId}>
            <Prompt />
            <span className="sr-only">Terminal command</span>
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={value}
            maxLength={MAX_INPUT}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && value.trim()) {
                e.preventDefault();
                complete();
              } else if (e.key === "ArrowUp" && history.length) {
                e.preventDefault();
                const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
                setCursor(next);
                setValue(history[next]);
              } else if (e.key === "ArrowDown" && cursor !== -1) {
                e.preventDefault();
                const next = cursor + 1;
                if (next >= history.length) {
                  setCursor(-1);
                  setValue("");
                } else {
                  setCursor(next);
                  setValue(history[next]);
                }
              }
            }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-base text-fg caret-accent outline-none sm:text-[0.8125rem]"
            placeholder="type help"
          />
        </form>
      </div>
    </div>
  );
}

export function Prompt() {
  return (
    <span aria-hidden="true">
      <span className="text-accent">amigo@dev</span>
      <span className="text-fg-subtle"> ~ %</span>
    </span>
  );
}

export function TerminalBar() {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--glass-border)] px-4 py-2.5">
      <span aria-hidden="true" className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-accent/80" />
      </span>
      <span className="text-xs text-fg-subtle">amigo@dev: ~/portfolio</span>
    </div>
  );
}
