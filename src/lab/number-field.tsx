"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

/*
 * A numeric input that lets you type freely: the text you are typing is kept as
 * a draft, and the value is only committed while it parses and sits in range,
 * so typing "12" never passes through a clamped "8". Leaving the field puts back
 * the committed value.
 */
export function NumberField({
  value,
  onCommit,
  min,
  max,
  step = 1,
  integer = false,
  unit,
  className,
  inputClassName,
  ...aria
}: {
  value: number;
  onCommit: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  integer?: boolean;
  unit?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const parse = (text: string) => {
    if (text.trim() === "") return null;
    const n = Number(text);
    if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) return null;
    return n;
  };
  const invalid = draft !== null && parse(draft) === null;
  return (
    <span className={cn("flex items-center", className)}>
      <input
        {...aria}
        type="number"
        inputMode={integer ? "numeric" : "decimal"}
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parse(e.target.value);
          if (n !== null) onCommit(n);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => e.key === "Enter" && setDraft(null)}
        className={cn(
          "min-w-0 bg-transparent font-mono text-sm tabular-nums text-fg outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          invalid && "text-warn",
          inputClassName,
        )}
      />
      {unit && <span className="shrink-0 pr-3 font-mono text-xs text-fg-subtle">{unit}</span>}
    </span>
  );
}
