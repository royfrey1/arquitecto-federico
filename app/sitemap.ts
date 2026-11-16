import type { MetadataRoute } from "next";
import { obras } from "@/data/obras";
import { abs } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: abs("/"), changeFrequency: "monthly", priority: 1 },
    { url: abs("/cuestionario"), changeFrequency: "yearly", priority: 0.8 },
    ...obras.map((o) => ({
      url: abs(`/obras/${o.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
      images: [abs(o.videoPrincipal.poster)],
    })),
  ];
}
