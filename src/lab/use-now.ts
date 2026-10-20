"use client";

import { useEffect, useState } from "react";

/** The current time, updated every `ms`. Null until mounted, so server and client markup match. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
