import type { MetadataRoute } from "next";

import { posts, site } from "@/lib/site";

export const dynamic = "force-static";

const routes = [
  "",
  "/about",
  "/blue-noble",
  "/team",
  "/how-it-works",
  "/services",
  "/blog",
  "/contact",
  "/download",
  "/login",
  "/signup",
  "/forgot-password",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...routes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
