import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

/*
 * What I work with, as comic stickers hanging on silk from one sagging strand
 * of web. Each is a simple mark for a tool named in src/content/profile.ts
 * (plus the gear, for the engineering degree). The names are real text for
 * screen readers; the drawings are decorative.
 */

const gear = compactPath(gearPath(gearGeometry(10, 3.6), 5));

type Tool = { name: string; bg: string; art: React.ReactNode; drop: number; k: number };

const TOOLS: Tool[] = [
  {
    name: "React",
    bg: "#20232a",
    drop: 2.4,
    k: 0.9,
    art: (
      <g fill="none" stroke="#61dafb" strokeWidth="2.6">
        <ellipse cx="32" cy="32" rx="22" ry="8.5" />
        <ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="22" ry="8.5" transform="rotate(120 32 32)" />
        <circle cx="32" cy="32" r="3.6" fill="#61dafb" stroke="none" />
      </g>
    ),
  },
  {
    name: "TypeScript",
    bg: "#3178c6",
    drop: 4.6,
    k: 1.2,
    art: (
      <text x="56" y="54" textAnchor="end" fontFamily="var(--font-sans)" fontSize="27" fontWeight="800" fill="#fff">
        TS
      </text>
    ),
  },
  {
    name: "Next.js",
    bg: "#0b0b0d",
    drop: 1.6,
    k: 0.7,
    art: (
      <>
        <circle cx="32" cy="32" r="21" fill="none" stroke="#f2eee6" strokeWidth="2.6" />
        <path d="M24 43 V21 L42 44 M40 21 V35" fill="none" stroke="#f2eee6" strokeWidth="3.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    name: "PostgreSQL",
    bg: "#336791",
    drop: 5.2,
    k: 1.35,
    art: (
      <g fill="none" stroke="#fff" strokeWidth="3">
        <ellipse cx="32" cy="18" rx="16" ry="6" />
        <path d="M16 18 V46 C16 54 48 54 48 46 V18 M16 32 C16 40 48 40 48 32" />
      </g>
    ),
  },
  {
    name: "Tailwind CSS",
    bg: "#0f172a",
    drop: 3,
    k: 1,
    art: (
      <path
        transform="translate(8 9) scale(2)"
        fill="#38bdf8"
        d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12 4.800zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6 12z"
      />
    ),
  },
  {
    name: "Supabase",
    bg: "#1c1c1c",
    drop: 1.9,
    k: 0.8,
    art: <path d="M35 8 L14 36 H30 L28 56 L50 27 H34 Z" fill="#3ecf8e" stroke="#0b0b0d" strokeWidth="1.5" strokeLinejoin="round" />,
  },
  {
    name: "Git",
    bg: "#f05032",
    drop: 4.2,
    k: 1.15,
    art: (
      <g fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round">
        <path d="M22 16 V48 M22 34 C22 26 42 30 42 22" />
        <circle cx="22" cy="14" r="4.5" fill="#f05032" />
        <circle cx="22" cy="50" r="4.5" fill="#f05032" />
        <circle cx="42" cy="20" r="4.5" fill="#f05032" />
      </g>
    ),
  },
  {
    name: "DevOps (where I'm heading)",
    bg: "#ff3b4e",
    drop: 2.8,
    k: 0.95,
    art: <path d="M32 32 C24 20 10 22 10 32 C10 42 24 44 32 32 C40 20 54 22 54 32 C54 42 40 44 32 32 Z" fill="none" stroke="#0b0b0d" strokeWidth="4.2" strokeLinejoin="round" />,
  },
  {
    name: "Mechanical engineering",
    bg: "#ffd23f",
    drop: 5.6,
    k: 1.4,
    art: (
      <>
        <path d={gear} transform="translate(32 32)" fill="#0b0b0d" />
        <circle cx="32" cy="32" r="6" fill="#ffd23f" />
      </>
    ),
  },
];

export function ToolStickers({ className }: { className?: string }) {
  return (
    <div className={["tools", className].filter(Boolean).join(" ")}>
      {/* The strand they hang from: one sagging line of silk across the scene. */}
      <svg aria-hidden="true" viewBox="0 0 1000 40" preserveAspectRatio="none" className="tools__strand">
        <path d="M0 4 Q500 44 1000 4" />
      </svg>
      <ul className="tools__row" aria-label="Tools I work with">
        {TOOLS.map((t, i) => (
          <li key={t.name} className="tool" style={{ "--drop": `${t.drop}rem`, "--k": t.k, "--i": i } as React.CSSProperties}>
            <span className="tool__silk" aria-hidden="true" />
            <span className="tool__sticker" style={{ "--bg": t.bg } as React.CSSProperties}>
              <svg viewBox="0 0 64 64" aria-hidden="true">
                {t.art}
              </svg>
            </span>
            <span className="tool__name">{t.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
