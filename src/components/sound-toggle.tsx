"use client";

import { useEffect } from "react";

import { cn } from "@/lib/cn";
import { installSound, setSound, useSound } from "@/lib/sound";

/**
 * The sound switch, always in the header. Off by default; the M key toggles
 * it from anywhere. When on, three bars bounce (on twos) as a level meter.
 */
export function SoundToggle({ className }: { className?: string }) {
  const on = useSound();
  useEffect(() => installSound(), []);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setSound(!on)}
      title={on ? "Sound on (M to mute)" : "Sound off (M to turn on)"}
      className={cn(
        "sound-toggle inline-flex items-center justify-center text-fg-muted",
        on && "text-fg",
        className,
      )}
    >
      <span className="sr-only">Sound</span>
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[1.125rem]">
        <path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor" />
        {on ? (
          <g className="sound-meter" fill="currentColor">
            <rect x="12.5" y="8" width="1.6" height="4" rx="0.5" />
            <rect x="15" y="6.5" width="1.6" height="7" rx="0.5" />
            <rect x="17.5" y="8.5" width="1.6" height="3" rx="0.5" />
          </g>
        ) : (
          <path d="M13 7.5l5 5M18 7.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
