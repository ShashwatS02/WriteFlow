import type { MetadataRoute } from "next";
import { db } from "../lib/db";
import { posts, categories } from "../lib/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    { url: `${base}/dashboard`, lastModified: new Date() },
  ];

  if (db) {
    try {
      const postRows = await db.select().from(posts).where(eq(posts.isPublished, true));
      for (const p of postRows as any[]) {
        items.push({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updatedAt) });
      }
      const catRows = await db.select().from(categories);
      for (const c of catRows as any[]) {
        items.push({ url: `${base}/blog?cats=${c.slug}`, lastModified: new Date(c.updatedAt) });
      }
    } catch {}
  }

  return items;
}


