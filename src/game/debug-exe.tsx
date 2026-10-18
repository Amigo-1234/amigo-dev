"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Game, H, W } from "./engine";

type Phase = "ready" | "playing" | "paused" | "over";

const BEST_KEY = "amigodev:debug-exe:best";

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be unavailable (private mode); the best score just won't persist.
  }
}

const MOVE_KEYS: Record<string, "left" | "right"> = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
const FIRE_KEYS = new Set([" ", "Spacebar", "ArrowUp", "w", "W"]);
/** Keys that would scroll the page; swallowed while the game is running. */
const SCROLL_KEYS = new Set(["ArrowDown", "s", "S", "PageDown", "PageUp", "Home", "End"]);

export function DebugExe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  const heldRef = useRef({ left: false, right: false, fire: false, touchFire: false });

  const [phase, setPhaseState] = useState<Phase>("ready");
  const [best, setBest] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const syncInput = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    const h = heldRef.current;
    game.input.left = h.left;
    game.input.right = h.right;
    game.input.fire = h.fire || h.touchFire;
  }, []);

  // The game loop runs only while playing; a paused or finished game costs nothing.
  const run = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    let last = 0;
    const frame = (ts: number) => {
      const game = gameRef.current;
      if (!game || phaseRef.current !== "playing") return;
      const dt = Math.min(1 / 30, (ts - (last || ts)) / 1000);
      last = ts;
      game.update(dt);
      game.draw();
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const start = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;
    game.reset();
    heldRef.current = { left: false, right: false, fire: false, touchFire: false };
    setNewBest(false);
    setPhase("playing");
    setAnnouncement("Game started. Sprint 1.");
    wrapRef.current?.focus({ preventScroll: true });
    run();
  }, [run, setPhase]);

  const pause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    cancelAnimationFrame(rafRef.current);
    setPhase("paused");
    setAnnouncement("Paused.");
  }, [setPhase]);

  const resume = useCallback(() => {
    if (phaseRef.current !== "paused") return;
    setPhase("playing");
    setAnnouncement("Resumed.");
    wrapRef.current?.focus({ preventScroll: true });
    run();
  }, [run, setPhase]);

  // Create the game once the canvas exists, and keep the canvas sharp at any size.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const stored = readBest();
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const game = new Game(
      ctx,
      {
        onGameOver: (score) => {
          cancelAnimationFrame(rafRef.current);
          const previous = readBest();
          const isBest = score > previous;
          if (isBest) saveBest(score);
          setBest(Math.max(previous, score));
          setFinalScore(score);
          setNewBest(isBest && score > 0);
          setPhase("over");
          setAnnouncement(`Production is down. Final score ${score}.${isBest && score > 0 ? " New personal best!" : ""}`);
          game.best = Math.max(previous, score);
          game.draw();
        },
        onAnnounce: setAnnouncement,
      },
      { reducedMotion, best: stored, font: `${font}, monospace` },
    );
    gameRef.current = game;
    game.reset();
    queueMicrotask(() => setBest(stored));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(((rect.width * H) / W) * dpr);
      game.draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      gameRef.current = null;
    };
  }, [setPhase]);

  // Keyboard controls. Game keys never scroll the page while it's on screen.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.closest("dialog")) return;
      const p = phaseRef.current;
      const move = MOVE_KEYS[e.key];

      if (p === "playing") {
        if (move) {
          heldRef.current[move] = true;
          e.preventDefault();
        } else if (FIRE_KEYS.has(e.key)) {
          heldRef.current.fire = true;
          e.preventDefault();
        } else if (e.key === "p" || e.key === "P" || e.key === "Escape") {
          pause();
          e.preventDefault();
        } else if (SCROLL_KEYS.has(e.key)) {
          e.preventDefault();
        }
        syncInput();
      } else if (p === "paused" && (e.key === "p" || e.key === "P" || e.key === "Escape")) {
        resume();
        e.preventDefault();
      } else if ((p === "ready" || p === "over") && e.key === "Enter" && target?.tagName !== "BUTTON" && target?.tagName !== "A") {
        start();
        e.preventDefault();
      } else if (move || FIRE_KEYS.has(e.key)) {
        // Arrow keys and space would scroll the page under the game; keep it still.
        if (wrapRef.current?.contains(target)) e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const move = MOVE_KEYS[e.key];
      if (move) heldRef.current[move] = false;
      if (FIRE_KEYS.has(e.key)) heldRef.current.fire = false;
      syncInput();
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    const onBlur = () => {
      heldRef.current = { left: false, right: false, fire: false, touchFire: false };
      syncInput();
      pause();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pause, resume, start, syncInput]);

  // Touch / pointer on the playfield: drag to move, auto-fire while touching.
  const toLogicalX = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * W;
  };
  const onFieldDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phaseRef.current !== "playing" || !gameRef.current) return;
    capture(e);
    gameRef.current.input.targetX = toLogicalX(e);
    heldRef.current.touchFire = true;
    syncInput();
  };
  const onFieldMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!heldRef.current.touchFire || !gameRef.current) return;
    gameRef.current.input.targetX = toLogicalX(e);
  };
  const onFieldUp = () => {
    if (gameRef.current) gameRef.current.input.targetX = null;
    heldRef.current.touchFire = false;
    syncInput();
  };

  // On-screen buttons: held while pressed.
  const setHeld = useCallback(
    (key: "left" | "right" | "fire", value: boolean) => {
      heldRef.current[key] = value;
      syncInput();
    },
    [syncInput],
  );

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <div
        ref={wrapRef}
        tabIndex={-1}
        className="game-frame relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[#0b0b0c] shadow-[0_30px_80px_-30px_rgb(242_107_58/0.35)] outline-none"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="DEBUG.EXE playfield: bugs fall toward the production server at the bottom; your patch cannon moves along the bottom and fires upward."
          className="block aspect-[3/4] w-full touch-none select-none [image-rendering:pixelated]"
          onPointerDown={onFieldDown}
          onPointerMove={onFieldMove}
          onPointerUp={onFieldUp}
          onPointerCancel={onFieldUp}
        />
        <div aria-hidden="true" className="game-scanlines pointer-events-none absolute inset-0" />

        {phase === "playing" && (
          <button
            type="button"
            onClick={pause}
            className="absolute right-2 top-16 rounded-md border border-white/15 bg-black/40 px-2 py-1 font-mono text-[0.625rem] text-white/80 backdrop-blur-sm"
          >
            Pause
          </button>
        )}

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-[#0b0b0c]/75 p-6 text-center text-[#ecebe6] backdrop-blur-[2px]">
            <div className="w-full">
              {phase === "ready" && (
                <>
                  <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-[#ff9a5c]">C:\AMIGODEV&gt; RUN</p>
                  <p className="mt-3 font-sans text-4xl font-semibold tracking-tight sm:text-5xl">
                    DEBUG<span className="text-[#f26b3a]">.EXE</span>
                  </p>
                  <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-[#a6a59e]">
                    Production is under attack. Patch the bugs before they reach the server.
                  </p>
                  <button type="button" onClick={start} className="mt-6 inline-flex h-12 items-center rounded-full bg-[#f26b3a] px-7 font-mono text-sm font-semibold text-[#0b0b0c]">
                    Start debugging
                  </button>
                  {best > 0 && <p className="mt-4 font-mono text-xs text-[#a6a59e]">Personal best: {best}</p>}
                </>
              )}
              {phase === "paused" && (
                <>
                  <p className="font-mono text-3xl font-semibold">PAUSED</p>
                  <p className="mt-2 text-sm text-[#a6a59e]">The bugs will wait. Probably.</p>
                  <div className="mt-6 flex justify-center gap-2">
                    <button type="button" onClick={resume} className="h-11 rounded-full bg-[#f26b3a] px-6 font-mono text-sm font-semibold text-[#0b0b0c]">
                      Resume
                    </button>
                    <button type="button" onClick={start} className="h-11 rounded-full border border-white/25 px-6 font-mono text-sm">
                      Restart
                    </button>
                  </div>
                </>
              )}
              {phase === "over" && (
                <>
                  <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-[#ff5d6c]">FATAL: PRODUCTION IS DOWN</p>
                  <p className="mt-3 font-mono text-5xl font-semibold tabular-nums">{finalScore}</p>
                  <p className="mt-2 font-mono text-xs text-[#a6a59e]">{newBest ? "New personal best! Ship it." : `Personal best: ${best}`}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={start} className="h-11 rounded-full bg-[#f26b3a] px-6 font-mono text-sm font-semibold text-[#0b0b0c]">
                      Redeploy
                    </button>
                    <Link href="/projects" className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 font-mono text-sm">
                      Back to the work
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch controls: large, held while pressed. Keyboard players use arrows/WASD + space. */}
      <div className="mt-3 hidden grid-cols-[1fr_1fr_1.4fr] gap-2 select-none [-webkit-touch-callout:none] pointer-coarse:grid" aria-label="Touch controls" role="group">
        <HoldButton label="Move left" onHold={(v) => setHeld("left", v)} className="game-btn">
          ◀
        </HoldButton>
        <HoldButton label="Move right" onHold={(v) => setHeld("right", v)} className="game-btn">
          ▶
        </HoldButton>
        <HoldButton label="Fire patch" onHold={(v) => setHeld("fire", v)} className="game-btn game-btn-fire">
          FIRE
        </HoldButton>
      </div>

      <p className="mt-3 text-center font-mono text-xs text-fg-subtle pointer-coarse:hidden">
        ← → or A D to move · Space to fire · P to pause
      </p>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

/** Keeps receiving a pointer's events after it slides off the element. Never lets a failed capture block input. */
function capture(e: React.PointerEvent<Element>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // The pointer may already be gone (or synthetic); the press still counts.
  }
}

/** A button that reports being held down (touch, pen or mouse) until released. */
function HoldButton({
  label,
  onHold,
  className,
  children,
}: {
  label: string;
  onHold: (held: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onPointerDown={(e) => {
        e.preventDefault();
        capture(e);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
      onLostPointerCapture={() => onHold(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}
