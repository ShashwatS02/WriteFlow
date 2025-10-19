import { z } from "zod";
import { publicProcedure, router } from "./router";
import { TRPCError } from "@trpc/server";
import { slugify } from "../../lib/utils";
import db from "../../lib/db";
import { categories, posts, postCategories } from "../../lib/schema";
import { eq, desc, sql } from "drizzle-orm";

const colorVariants = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "indigo",
  "purple",
  "pink",
];

export const categoriesRouter = router({
  getAll: publicProcedure.input(z.object({}).optional()).query(async () => {
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not configured",
      });
    const items = await db.select().from(categories).orderBy(categories.name);
    return items;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);
      if (!cat) return null;
      const recentPosts = await db
        .select()
        .from(posts)
        .innerJoin(postCategories, eq(postCategories.postId, posts.id))
        .where(eq(postCategories.categoryId, input.id))
        .orderBy(desc(posts.createdAt))
        .limit(10);
      (cat as any).posts = recentPosts;
      return cat;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().optional(),
        description: z.string().optional(),
        colorVariant: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const slug = input.slug ? slugify(input.slug) : slugify(input.name);
      let finalSlug = slug;
      let i = 1;
      while (true) {
        const found = await db
          .select()
          .from(categories)
          .where(eq(categories.slug, finalSlug))
          .limit(1);
        if (!found.length) break;
        finalSlug = `${slug}-${i++}`;
      }
      const color =
        input.colorVariant && colorVariants.includes(input.colorVariant)
          ? input.colorVariant
          : "gray";
      const [created] = await db
        .insert(categories)
        .values({
          slug: finalSlug,
          name: input.name,
          description: input.description || null,
          colorVariant: color,
        })
        .returning();
      return created;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        colorVariant: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const [existing] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });

      const updateObj: any = {};
      if (input.name) updateObj.name = input.name;
      if (input.slug) updateObj.slug = slugify(input.slug);
      if (input.description !== undefined)
        updateObj.description = input.description || null;
      if (input.colorVariant !== undefined)
        updateObj.colorVariant = colorVariants.includes(
          input.colorVariant || ""
        )
          ? input.colorVariant
          : "gray";

      if (Object.keys(updateObj).length) {
        const [updated] = await db
          .update(categories)
          .set(updateObj)
          .where(eq(categories.id, input.id))
          .returning();
        return updated;
      }

      return existing;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      await db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();
      return { success: true };
    }),

  // Statistics across categories and posts
  getStats: publicProcedure.query(async () => {
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not configured",
      });

    const rows = await db
      .select({
        totalCategories: sql<number>`COUNT(DISTINCT ${categories.id})`.as(
          "totalCategories"
        ),
        totalPosts: sql<number>`COUNT(DISTINCT ${posts.id})`.as("totalPosts"),
        publishedPosts:
          sql<number>`COUNT(DISTINCT CASE WHEN ${posts.isPublished} = true THEN ${posts.id} END)`.as(
            "publishedPosts"
          ),
        totalReadingTime:
          sql<number>`COALESCE(SUM(CASE WHEN ${posts.isPublished} = true THEN ${posts.readingTime} END), 0)`.as(
            "totalReadingTime"
          ),
      })
      .from(categories)
      .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .leftJoin(posts, eq(postCategories.postId, posts.id));

    return (
      rows[0] || {
        totalCategories: 0,
        totalPosts: 0,
        publishedPosts: 0,
        totalReadingTime: 0,
      }
    );
  }),
});
