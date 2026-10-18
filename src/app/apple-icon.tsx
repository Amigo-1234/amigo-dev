import { ImageResponse } from "next/og";

import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0b0c", alignItems: "center", justifyContent: "center" }}>
        <svg width="116" height="116" viewBox="0 0 48 48">
          <path fill="#ecebe6" fillRule="evenodd" d={MONOGRAM_INK} />
          <path fill="#f26b3a" d={MONOGRAM_BAR} />
        </svg>
      </div>
    ),
    size,
  );
}
