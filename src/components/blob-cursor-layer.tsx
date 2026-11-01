"use client";

import dynamic from "next/dynamic";

type BlobCursorProps = {
  material?: "chrome" | "jelly" | "pearl" | "ink";
  color?: string;
  blend?: "normal" | "difference" | "exclusion" | "multiply" | "screen" | "overlay";
  size?: number;
  morph?: number;
  morphSpeed?: number;
  depth?: number;
  trail?: number;
  lag?: number;
  goo?: number;
  stretch?: number;
  wobble?: number;
  drip?: number;
  splash?: boolean;
  splashCount?: number;
  splashSpeed?: number;
  splashSize?: number;
  splashGravity?: number;
  regrow?: number;
  shine?: number;
  shadow?: boolean;
  hideCursor?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const BlobCursor = dynamic<BlobCursorProps>(() => import("@/components/ui/BlobCursor"), { ssr: false });

/** Full viewport cursor layer. It stays out of the way of links and controls. */
export function BlobCursorLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <BlobCursor
        material="chrome"
        color="#f26b3a"
        blend="screen"
        size={76}
        morph={0.18}
        morphSpeed={0.3}
        trail={10}
        lag={0.62}
        splash={false}
        drip={0}
        shine={0.9}
        hideCursor={false}
      />
    </div>
  );
}
