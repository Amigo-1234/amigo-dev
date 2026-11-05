import { cn } from "@/lib/cn";

/*
 * A drawing-office status stamp: a double ruled box in one colour, set very
 * slightly off-square the way a hand stamp lands. It is ordinary text, so it is
 * read out and translated like any other.
 */
const tones = {
  redline: "text-accent",
  ok: "text-ok",
  warn: "text-warn",
  muted: "text-fg-muted",
} as const;

export function Stamp({
  children,
  note,
  tone = "redline",
  className,
}: {
  children: React.ReactNode;
  /** A second, smaller line, e.g. a date or a qualifier. */
  note?: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-2 flex-col items-center gap-0.5 border-2 border-current px-3 py-1.5 text-center font-mono uppercase leading-tight outline outline-1 outline-offset-2 outline-current",
        tones[tone],
        className,
      )}
    >
      <span className="text-[0.6875rem] font-semibold tracking-[0.16em]">{children}</span>
      {note && <span className="text-[0.625rem] tracking-[0.12em]">{note}</span>}
    </span>
  );
}
