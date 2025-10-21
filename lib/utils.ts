import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { posts, categories } from "./schema";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function estimateReadingTime(words: number) {
  return Math.max(1, Math.round(words / 200));
}

export function countWords(text: string) {
  return text ? text.trim().split(/\s+/).length : 0;
}

// Generate a unique slug from a title
export async function generateSlug(
  title: string,
  db: NodePgDatabase<any>,
  excludeId?: number,
  table: "posts" | "categories" = "posts"
): Promise<string> {
  // Create base slug
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  if (!baseSlug) {
    baseSlug = "untitled";
  }

  let slug = baseSlug;
  let counter = 1;

  // Check for uniqueness
  while (true) {
    const targetTable = table === "posts" ? posts : categories;
    const whereCondition = excludeId
      ? sql`${targetTable.slug} = ${slug} AND ${targetTable.id} != ${excludeId}`
      : eq(targetTable.slug, slug);

    const existing = await db
      .select({ slug: targetTable.slug })
      .from(targetTable)
      .where(whereCondition)
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Calculate word count from markdown content
export function calculateWordCount(content: string): number {
  // Remove markdown syntax and count words
  const plainText = content
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links, keep text
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "") // Remove images
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();

  if (!plainText) return 0;

  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

// Calculate reading time based on word count (200 words per minute)
export function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "just now" : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return `${Math.floor(diffDays / 365)} years ago`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

// Generate table of contents from markdown
export function generateTableOfContents(markdown: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: Array<{ id: string; title: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    toc.push({ id, title, level });
  }

  return toc;
}

// Class name utility (with tailwind-merge for proper CSS class merging)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
