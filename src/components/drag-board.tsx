"use client";

import { useEffect, useRef } from "react";

import { sfx } from "@/lib/sound";

/*
 * Makes everything marked [data-drag] inside it draggable with a mouse, pen or
 * finger. The pieces are server-rendered; this only moves them (the --dx and
 * --dy custom properties), lifts the one in hand above the rest, and keeps it
 * on the board. Nothing is saved: a reload tidies the bench.
 */
export function DragBoard({ className, children, ...rest }: React.ComponentPropsWithoutRef<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const board = ref.current;
    if (!board) return;
    let z = 10;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const item = (e.target as HTMLElement).closest<HTMLElement>("[data-drag]");
      if (!item || !board.contains(item)) return;
      e.preventDefault();
      item.setPointerCapture(e.pointerId);
      item.style.zIndex = String(++z);
      item.classList.add("is-dragging");
      sfx("tick");

      const dx0 = parseFloat(item.style.getPropertyValue("--dx")) || 0;
      const dy0 = parseFloat(item.style.getPropertyValue("--dy")) || 0;
      const x0 = e.clientX;
      const y0 = e.clientY;
      // How far it may travel before leaving the board.
      const b = board.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      const min = [b.left - r.left + dx0 - r.width * 0.3, b.top - r.top + dy0 - r.height * 0.3];
      const max = [b.right - r.right + dx0 + r.width * 0.3, b.bottom - r.bottom + dy0 + r.height * 0.3];

      const move = (ev: PointerEvent) => {
        const dx = Math.max(min[0], Math.min(max[0], dx0 + ev.clientX - x0));
        const dy = Math.max(min[1], Math.min(max[1], dy0 + ev.clientY - y0));
        item.style.setProperty("--dx", `${dx}px`);
        item.style.setProperty("--dy", `${dy}px`);
      };
      const up = () => {
        item.classList.remove("is-dragging");
        sfx("panel");
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerup", up);
        item.removeEventListener("pointercancel", up);
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerup", up);
      item.addEventListener("pointercancel", up);
    };

    board.addEventListener("pointerdown", onDown);
    return () => board.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}
