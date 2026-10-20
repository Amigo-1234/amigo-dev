"use client";

import { useEffect, useState } from "react";

import { site } from "@/content/site";

// Created on first use: a time-zone formatter loads zone data, which is
// noticeable on a slow phone if it happens while the page is starting up.
let format: Intl.DateTimeFormat | null = null;
const now = () => (format ??= new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, hour: "2-digit", minute: "2-digit" })).format(new Date());

/** The current time in Nigeria, so visitors elsewhere know when I'm likely to reply. */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(now());
    // First update in idle time, after hydration has finished.
    const idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(tick, { timeout: 2000 }) : window.setTimeout(tick, 200);
    const id = window.setInterval(tick, 15_000);
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.clearInterval(id);
    };
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--"} WAT
    </span>
  );
}
