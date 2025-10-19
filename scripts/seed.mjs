import { Pool } from "pg";
import dotenv from "dotenv";
import { existsSync } from "fs";

// Load env vars from .env.local if present, otherwise .env
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const connectionString =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error(
    "No DATABASE_URL or NEON_DATABASE_URL provided. Set environment variable and retry."
  );
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure unique constraints for upserts by slug
    await client.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug)"
    );
    await client.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug)"
    );

    // categories
    const categories = [
      {
        slug: "tech",
        name: "Tech",
        description: "Software, tools, and engineering.",
        colorVariant: "blue",
      },
      {
        slug: "design",
        name: "Design",
        description: "Product and visual design.",
        colorVariant: "purple",
      },
      {
        slug: "lifestyle",
        name: "Lifestyle",
        description: "Work, life, and balance.",
        colorVariant: "green",
      },
      {
        slug: "productivity",
        name: "Productivity",
        description: "Tips for getting things done.",
        colorVariant: "orange",
      },
      {
        slug: "tutorials",
        name: "Tutorials",
        description: "Step by step guides and how-tos.",
        colorVariant: "teal",
      },
      {
        slug: "reviews",
        name: "Reviews",
        description: "In-depth product and book reviews.",
        colorVariant: "pink",
      },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const res = await client.query(
        `INSERT INTO categories (slug, name, description, color_variant) VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, color_variant = EXCLUDED.color_variant RETURNING id`,
        [cat.slug, cat.name, cat.description, cat.colorVariant]
      );
      categoryIds[cat.slug] = res.rows[0].id;
    }

    // helpers
    const now = new Date();
    const wordsToReadingTime = (words) => Math.max(1, Math.ceil(words / 200));

    const demoPosts = [
      {
        slug: "introducing-writeflow",
        title: "Introducing WriteFlow: The Future of Content Management",
        excerpt:
          "An opinionated single-admin blogging platform built for creators who value simplicity, performance, and beautiful design. Discover what makes WriteFlow different.",
        content: `# Welcome to WriteFlow\n\nWriteFlow represents a new approach to content management—one that prioritizes **developer experience** without sacrificing user experience. Built with modern technologies and designed for the future, it's the platform we wish existed when we started our own content journey.\n\n## Why We Built WriteFlow\n\nThe content management landscape is cluttered with solutions that are either:\n\n- Too complex for simple use cases\n- Too limited for serious content creators\n- Too slow for modern web standards\n- Too inflexible for custom workflows\n\nWriteFlow strikes the perfect balance. It's **powerful enough** for serious bloggers yet **simple enough** for anyone to use.\n\n## Core Philosophy\n\nOur design philosophy centers around three key principles:\n\n### 1. Simplicity First\nEvery feature is designed with ease-of-use in mind. Complex workflows are abstracted away, leaving you with clean, intuitive interfaces.\n\n### 2. Performance by Default\nBuilt on Next.js 15 with modern caching strategies, WriteFlow delivers lightning-fast loading times and smooth interactions.\n\n### 3. Type Safety Throughout\nLeveraging TypeScript and tRPC, we ensure that your content is always consistent and your development experience is error-free.\n\n## Technical Architecture\n\n\`\`\`mermaid\ngraph TD\n    A[Next.js 15] --> B[tRPC v11]\n    B --> C[Drizzle ORM]\n    C --> D[Neon Postgres]\n    A --> E[React Query]\n    A --> F[Tailwind CSS]\n    F --> G[Dark Mode]\n\`\`\`\n\n## Getting Started\n\nSetting up WriteFlow is straightforward:\n\n1. Clone the repository\n2. Configure your environment variables\n3. Run the database migrations\n4. Start creating amazing content\n\nThe entire setup process takes less than 5 minutes.\n\n## What's Next?\n\nThis is just the beginning. We're constantly improving WriteFlow based on community feedback and our own content creation needs. Join us on this journey to make content management delightful again.\n\n*Ready to transform your content workflow? Let's dive in.*`,
        categories: ["tech", "productivity"],
        wordCount: 450,
        publishedOffsetDays: 30,
      },
      {
        slug: "design-systems-best-practices",
        title: "Design Systems: Building Scalable UI Foundations",
        excerpt:
          "How to create and maintain design systems that scale with your team and product. Learn from real-world examples and proven methodologies.",
        content: `# Building Scalable Design Systems\n\nDesign systems have evolved from nice-to-have documentation to essential infrastructure. They're the foundation that enables teams to build consistent, high-quality user interfaces at scale.\n\n## What Makes a Great Design System?\n\nA design system isn't just a collection of components—it's a **living ecosystem** that encompasses...`,
        categories: ["design", "tutorials"],
        wordCount: 1200,
        publishedOffsetDays: 25,
      },
      {
        slug: "productivity-hacks-for-remote-teams",
        title: "Remote Team Productivity: 10 Game-Changing Strategies",
        excerpt:
          "Transform your remote team's efficiency with proven strategies. From async communication to focus rituals, discover what actually works in distributed teams.",
        content: `# Mastering Remote Team Productivity\n\nRemote work isn't just about working from home—it's about reimagining how teams collaborate, communicate, and create value together across time and space.`,
        categories: ["productivity", "lifestyle"],
        wordCount: 800,
        publishedOffsetDays: 20,
      },
      {
        slug: "typescript-advanced-patterns",
        title: "TypeScript Patterns Every Developer Should Master",
        excerpt:
          "Unlock TypeScript's full potential with advanced patterns and techniques. From conditional types to template literals, elevate your type-safe development.",
        content: `# Advanced TypeScript Patterns for Professional Development\n\nTypeScript has evolved far beyond simple type annotations. Modern TypeScript offers powerful features that can transform how you write and maintain code.`,
        categories: ["tech", "tutorials"],
        wordCount: 1000,
        publishedOffsetDays: 18,
      },
    ];

    const additionalPosts = [
      {
        slug: "minimalist-design-principles",
        title: "The Art of Minimalist Design: Less is More",
        excerpt:
          "Discover how minimalist design principles create powerful, memorable user experiences. Learn to remove the unnecessary and emphasize what matters most.",
        content: `# The Power of Minimalism in Design\n\nMinimalism isn't about removing everything—it's about removing everything that doesn't serve a purpose. In an age of information overload, minimalist design provides clarity, focus, and peace of mind.`,
        categories: ["design", "lifestyle"],
        wordCount: 650,
        publishedOffsetDays: 15,
      },
    ];

    const allDemoPosts = [...demoPosts, ...additionalPosts];

    for (const p of allDemoPosts) {
      const publishedAt = new Date(now);
      publishedAt.setDate(now.getDate() - p.publishedOffsetDays);

      const readingTime = wordsToReadingTime(p.wordCount);

      const res = await client.query(
        `INSERT INTO posts (slug, title, excerpt, content, word_count, reading_time, is_published, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title RETURNING id`,
        [
          p.slug,
          p.title,
          p.excerpt,
          p.content,
          p.wordCount,
          readingTime,
          true,
          publishedAt.toISOString(),
          publishedAt.toISOString(),
        ]
      );

      const postId = res.rows[0].id;
      for (const c of p.categories) {
        const catId = categoryIds[c] || categoryIds["tech"];
        await client.query(
          `INSERT INTO post_categories (post_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [postId, catId]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Seed completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
