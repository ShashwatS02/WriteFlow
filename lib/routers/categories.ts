import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { categories, posts, postCategories } from "../schema";
import { generateSlug } from "../utils";

// Color variants for category badges
export const COLOR_VARIANTS = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  colorVariant: z.enum(COLOR_VARIANTS).default("gray"),
});

const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.number(),
});

export const categoriesRouter = router({
  // Get all categories with post counts
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const categoriesWithCounts = await ctx.db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        description: categories.description,
        colorVariant: categories.colorVariant,
        createdAt: categories.createdAt,
        updatedAt: categories.updatedAt,
        postCount: sql<number>`COALESCE(COUNT(${postCategories.postId}), 0)`.as(
          "postCount"
        ),
        publishedPostCount:
          sql<number>`COALESCE(COUNT(CASE WHEN ${posts.isPublished} = true THEN 1 END), 0)`.as(
            "publishedPostCount"
          ),
      })
      .from(categories)
      .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
      .leftJoin(posts, eq(postCategories.postId, posts.id))
      .groupBy(categories.id)
      .orderBy(desc(categories.createdAt));

    return categoriesWithCounts;
  }),

  // Get category by ID with full details
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [category] = await ctx.db
        .select({
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
          description: categories.description,
          colorVariant: categories.colorVariant,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
          postCount:
            sql<number>`COALESCE(COUNT(${postCategories.postId}), 0)`.as(
              "postCount"
            ),
          publishedPostCount:
            sql<number>`COALESCE(COUNT(CASE WHEN ${posts.isPublished} = true THEN 1 END), 0)`.as(
              "publishedPostCount"
            ),
        })
        .from(categories)
        .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .leftJoin(posts, eq(postCategories.postId, posts.id))
        .where(eq(categories.id, input.id))
        .groupBy(categories.id);

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Get category by slug with full details
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [category] = await ctx.db
        .select({
          id: categories.id,
          slug: categories.slug,
          name: categories.name,
          description: categories.description,
          colorVariant: categories.colorVariant,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
          postCount:
            sql<number>`COALESCE(COUNT(${postCategories.postId}), 0)`.as(
              "postCount"
            ),
          publishedPostCount:
            sql<number>`COALESCE(COUNT(CASE WHEN ${posts.isPublished} = true THEN 1 END), 0)`.as(
              "publishedPostCount"
            ),
        })
        .from(categories)
        .leftJoin(postCategories, eq(categories.id, postCategories.categoryId))
        .leftJoin(posts, eq(postCategories.postId, posts.id))
        .where(eq(categories.slug, input.slug))
        .groupBy(categories.id);

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  // Create category (admin only)
  create: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { name, description, colorVariant } = input;

      // Generate unique slug
      const slug = await generateSlug(name, ctx.db, undefined, "categories");

      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          slug,
          name,
          description,
          colorVariant,
          updatedAt: new Date(),
        })
        .returning();

      return newCategory;
    }),

  // Update category (admin only)
  update: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { id, ...updateData } = input;
      // loosen type during active development
      const updateDataAny: any = updateData as any;

      // Update slug if name changed
      if (updateDataAny.name) {
        updateDataAny.slug = await generateSlug(
          updateDataAny.name,
          ctx.db,
          id,
          "categories"
        );
      }

      updateDataAny.updatedAt = new Date();

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return updatedCategory;
    }),

  // Delete category (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Check if category is being used by posts
      const [usage] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(postCategories)
        .where(eq(postCategories.categoryId, input.id));

      if (usage.count > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete category. It is used by ${usage.count} post(s).`,
        });
      }

      const deleted = await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning();

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return { success: true };
    }),

  // Get posts by category
  getPostsByCategory: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(12),
        publishedOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { categoryId, page, pageSize, publishedOnly } = input;
      const offset = (page - 1) * pageSize;

      const whereClause = publishedOnly
        ? `WHERE ${posts.isPublished} = true AND ${postCategories.categoryId} = ${categoryId}`
        : `WHERE ${postCategories.categoryId} = ${categoryId}`;

      const postsInCategory = await ctx.db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          isPublished: posts.isPublished,
          wordCount: posts.wordCount,
          readingTime: posts.readingTime,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .innerJoin(postCategories, eq(posts.id, postCategories.postId))
        .where(
          publishedOnly
            ? eq(postCategories.categoryId, categoryId) &&
                eq(posts.isPublished, true)
            : eq(postCategories.categoryId, categoryId)
        )
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Get total count
      const [{ count: total }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .innerJoin(postCategories, eq(posts.id, postCategories.postId))
        .where(
          publishedOnly
            ? eq(postCategories.categoryId, categoryId) &&
                eq(posts.isPublished, true)
            : eq(postCategories.categoryId, categoryId)
        );

      return {
        posts: postsInCategory,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Assign categories to post (admin only)
  assignToPost: adminProcedure
    .input(
      z.object({
        postId: z.number(),
        categoryIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { postId, categoryIds } = input;

      // Remove existing associations
      await ctx.db
        .delete(postCategories)
        .where(eq(postCategories.postId, postId));

      // Add new associations
      if (categoryIds.length > 0) {
        await ctx.db
          .insert(postCategories)
          .values(categoryIds.map((categoryId) => ({ postId, categoryId })));
      }

      return { success: true };
    }),

  // Get category statistics
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const stats = await ctx.db
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
      stats[0] || {
        totalCategories: 0,
        totalPosts: 0,
        publishedPosts: 0,
        totalReadingTime: 0,
      }
    );
  }),
});
