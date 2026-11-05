import type { MetadataRoute } from "next";

import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} · ${site.brand}`,
    short_name: site.brand,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#0f2846",
    theme_color: "#0f2846",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
