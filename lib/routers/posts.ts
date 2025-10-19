import { z } from "zod";
import { eq, desc, asc, like, and, or, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "../trpc";
import { posts, categories, postCategories } from "../schema";
import {
  generateSlug,
  calculateWordCount,
  calculateReadingTime,
} from "../utils";

// Validation schemas
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  categoryIds: z.array(z.number()).optional().default([]),
  isPublished: z.boolean().default(false),
});

const updatePostSchema = createPostSchema.partial().extend({
  id: z.number(),
});

const getPostsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(12),
  search: z.string().optional(),
  categoryIds: z.array(z.number()).optional(),
  isPublished: z.boolean().optional(),
  sortBy: z
    .enum(["newest", "oldest", "title", "readingTime"])
    .default("newest"),
});

export const postsRouter = router({
  // Get all posts with filtering, search, and pagination
  getAll: publicProcedure
    .input(getPostsSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { page, pageSize, search, categoryIds, isPublished, sortBy } =
        input;
      const offset = (page - 1) * pageSize;

      // Build where conditions
      const conditions = [];

      if (isPublished !== undefined) {
        conditions.push(eq(posts.isPublished, isPublished));
      }

      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          or(
            like(posts.title, searchTerm),
            like(posts.content, searchTerm),
            like(posts.excerpt, searchTerm)
          )
        );
      }

      let query = ctx.db
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
          categories: sql<any>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${categories.id},
                'name', ${categories.name},
                'slug', ${categories.slug},
                'colorVariant', ${categories.colorVariant}
              )
            ) FILTER (WHERE ${categories.id} IS NOT NULL),
            '[]'::json
          )`.as("categories"),
        })
        .from(posts)
        .leftJoin(postCategories, eq(posts.id, postCategories.postId))
        .leftJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(posts.id);

      // Apply sorting (cast to any to satisfy Drizzle typings in this workspace)
      switch (sortBy) {
        case "oldest":
          query = (query as any).orderBy(asc(posts.createdAt));
          break;
        case "title":
          query = (query as any).orderBy(asc(posts.title));
          break;
        case "readingTime":
          query = (query as any).orderBy(desc(posts.readingTime));
          break;
        case "newest":
        default:
          query = (query as any).orderBy(desc(posts.createdAt));
      }

      const results = await query.limit(pageSize).offset(offset);

      // Filter by categories if specified (done after SQL join for simplicity)
      let filteredResults = results;
      if (categoryIds && categoryIds.length > 0) {
        filteredResults = results.filter((post) =>
          post.categories.some((cat: any) => categoryIds.includes(cat.id))
        );
      }

      // Get total count for pagination
      const countQuery = ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const [{ count: total }] = await countQuery;

      return {
        posts: filteredResults,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  // Get post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [post] = await ctx.db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          content: posts.content,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          isPublished: posts.isPublished,
          wordCount: posts.wordCount,
          readingTime: posts.readingTime,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          categories: sql<any>`COALESCE(
            json_agg(
              json_build_object(
                'id', ${categories.id},
                'name', ${categories.name},
                'slug', ${categories.slug},
                'colorVariant', ${categories.colorVariant}
              )
            ) FILTER (WHERE ${categories.id} IS NOT NULL),
            '[]'::json
          )`.as("categories"),
        })
        .from(posts)
        .leftJoin(postCategories, eq(posts.id, postCategories.postId))
        .leftJoin(categories, eq(postCategories.categoryId, categories.id))
        .where(eq(posts.slug, input.slug))
        .groupBy(posts.id);

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return post;
    }),

  // Create post (admin only)
  create: adminProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const {
        title,
        content,
        excerpt,
        coverImageUrl,
        categoryIds,
        isPublished,
      } = input;

      // Generate slug and calculate metadata
      const slug = await generateSlug(title, ctx.db);
      const wordCount = calculateWordCount(content);
      const readingTime = calculateReadingTime(wordCount);

      // Insert post
      const [newPost] = await ctx.db
        .insert(posts)
        .values({
          slug,
          title,
          content,
          excerpt,
          coverImageUrl: coverImageUrl || null,
          isPublished,
          wordCount,
          readingTime,
          updatedAt: new Date(),
        })
        .returning();

      // Associate categories
      if (categoryIds.length > 0) {
        await ctx.db
          .insert(postCategories)
          .values(
            categoryIds.map((categoryId) => ({
              postId: newPost.id,
              categoryId,
            }))
          );
      }

      return newPost;
    }),

  // Update post (admin only)
  update: adminProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { id, categoryIds, ...updateData } = input;
      const updateAny: any = updateData as any;

      // Calculate metadata if content updated
      if (updateAny.content) {
        const wordCount = calculateWordCount(updateAny.content);
        updateAny.wordCount = wordCount;
        updateAny.readingTime = calculateReadingTime(wordCount);
      }

      // Update slug if title changed
      if (updateAny.title) {
        updateAny.slug = await generateSlug(updateAny.title, ctx.db, id);
      }

      updateAny.updatedAt = new Date();

      // Update post
      const [updatedPost] = await ctx.db
        .update(posts)
        .set(updateAny)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Update categories if provided
      if (categoryIds !== undefined) {
        await ctx.db
          .delete(postCategories)
          .where(eq(postCategories.postId, id));
        if (categoryIds.length > 0) {
          await ctx.db
            .insert(postCategories)
            .values(
              categoryIds.map((categoryId) => ({ postId: id, categoryId }))
            );
        }
      }

      return updatedPost;
    }),

  // Delete post (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const deleted = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning();

      if (deleted.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return { success: true };
    }),

  // Toggle publish status (admin only)
  togglePublish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const [post] = await ctx.db
        .select({ isPublished: posts.isPublished })
        .from(posts)
        .where(eq(posts.id, input.id));

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const [updatedPost] = await ctx.db
        .update(posts)
        .set({
          isPublished: !post.isPublished,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, input.id))
        .returning();

      return updatedPost;
    }),

  // Get related posts
  getRelated: publicProcedure
    .input(z.object({ postId: z.number(), limit: z.number().default(3) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get categories of the current post
      const postCategoriesQuery = await ctx.db
        .select({ categoryId: postCategories.categoryId })
        .from(postCategories)
        .where(eq(postCategories.postId, input.postId));

      if (postCategoriesQuery.length === 0) {
        return [];
      }

      const categoryIds = postCategoriesQuery.map((pc) => pc.categoryId);

      // Find related posts (excluding current post)
      const relatedPosts = await ctx.db
        .select({
          id: posts.id,
          slug: posts.slug,
          title: posts.title,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          readingTime: posts.readingTime,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .innerJoin(postCategories, eq(posts.id, postCategories.postId))
        .where(
          and(
            inArray(postCategories.categoryId, categoryIds),
            eq(posts.isPublished, true),
            sql`${posts.id} != ${input.postId}`
          )
        )
        .groupBy(posts.id)
        .orderBy(desc(posts.createdAt))
        .limit(input.limit);

      return relatedPosts;
    }),
});
