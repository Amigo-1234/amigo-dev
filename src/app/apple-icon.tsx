import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b0b0c", alignItems: "center", justifyContent: "center" }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M14 50 32 14l18 36" fill="none" stroke="#ecebe6" strokeWidth="4" strokeLinejoin="round" />
          <path d="M22 37h20" stroke="#ecebe6" strokeWidth="4" />
          <circle cx="32" cy="37" r="4.5" fill="#f26b3a" />
        </svg>
      </div>
    ),
    size,
  );
}
