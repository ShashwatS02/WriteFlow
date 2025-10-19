import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 191 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  colorVariant: varchar("color_variant", { length: 50 }).default("gray"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 191 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImageUrl: varchar("cover_image_url", { length: 2048 }),
  isPublished: boolean("is_published").notNull().default(false),
  wordCount: integer("word_count").notNull().default(0),
  readingTime: integer("reading_time").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postCategories = pgTable(
  "post_categories",
  {
    postId: integer("post_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.postId, table.categoryId),
  })
);

export type Post = typeof posts;
export type Category = typeof categories;
export type PostCategory = typeof postCategories;
