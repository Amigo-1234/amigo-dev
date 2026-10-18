"use client";

import { useEffect, useState } from "react";

import { site } from "@/content/site";

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: site.timeZone,
  hour: "2-digit",
  minute: "2-digit",
});

/** The current time in Nigeria, so visitors elsewhere know when I'm likely to reply. */
export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {now ?? "--:--"} WAT
    </span>
  );
}
