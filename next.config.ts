import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The project's public vercel.app domain sends visitors and crawlers to
      // the primary domain, keeping the path and query string (308).
      {
        source: "/:path*",
        has: [{ type: "host", value: "amigo-dev\\.vercel\\.app" }],
        destination: "https://www.amigodev.com.ng/:path*",
        permanent: true,
      },
      // The previous single-page site lived at /index.html with #anchors.
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
