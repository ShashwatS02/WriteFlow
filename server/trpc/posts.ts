import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./router";
import { TRPCError } from "@trpc/server";
import mapDbErrorToTRPC from "./errorMap";
import { slugify, countWords, estimateReadingTime } from "../../lib/utils";
import { posts, categories, postCategories } from "../../lib/schema";
import { eq, and, sql, desc, asc, inArray } from "drizzle-orm";

export const postsRouter = router({
  getAll: publicProcedure
    .input(
      z
        .object({
          // accept both UI and server naming
          published: z.boolean().optional(),
          isPublished: z.boolean().optional(),
          category: z.string().optional(),
          categories: z.array(z.string()).optional(),
          categoryIds: z.array(z.number().int()).optional(),
          search: z.string().optional(),
          page: z.number().int().min(1).optional(),
          pageSize: z.number().int().min(1).max(100).optional(),
          // accept either 'sort' or 'sortBy' for compatibility with different clients
          sort: z.enum(["newest", "oldest", "reading", "title"]).optional(),
          sortBy: z
            .enum(["newest", "oldest", "title", "readingTime"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });

      const inp = input || {};
      const page = inp.page || 1;
      const pageSize = inp.pageSize || 10;
      const offset = (page - 1) * pageSize;

      // Base query
      let q: any = ctx.db.select().from(posts);

      // Build a separate count query for total results (start with base posts select)
      let countQ: any = ctx.db.select().from(posts);

      const publishedFlag =
        typeof inp.isPublished === "boolean"
          ? inp.isPublished
          : typeof inp.published === "boolean"
            ? inp.published
            : undefined;
      if (typeof publishedFlag === "boolean") {
        q = q.where(eq(posts.isPublished, publishedFlag));
        countQ = countQ.where(eq(posts.isPublished, publishedFlag));
      }

      const catSlugs =
        inp.categories && inp.categories.length
          ? inp.categories
          : inp.category
            ? [inp.category]
            : [];
      const catIds =
        inp.categoryIds && inp.categoryIds.length ? inp.categoryIds : [];
      if (catIds.length || catSlugs.length) {
        q = q
          .innerJoin(postCategories, eq(postCategories.postId, posts.id))
          .innerJoin(categories, eq(postCategories.categoryId, categories.id))
          .where(
            catIds.length
              ? inArray(categories.id, catIds)
              : inArray(categories.slug, catSlugs)
          )
          .groupBy(posts.id);

        countQ = countQ
          .innerJoin(postCategories, eq(postCategories.postId, posts.id))
          .innerJoin(categories, eq(postCategories.categoryId, categories.id))
          .where(
            catIds.length
              ? inArray(categories.id, catIds)
              : inArray(categories.slug, catSlugs)
          )
          .groupBy(posts.id);
      }

      if (inp.search) {
        const term = `%${inp.search}%`;
        const cond = sql`(posts.title ILIKE ${term} OR posts.excerpt ILIKE ${term} OR posts.content ILIKE ${term})`;
        q = q.where(cond);
        countQ = countQ.where(cond);
      }

      // Sorting
      // pick sort value from either field and normalize to our internal keys
      const rawSort = inp.sort || inp.sortBy || "newest";
      if (rawSort === "newest") q = q.orderBy(desc(posts.createdAt));
      if (rawSort === "oldest") q = q.orderBy(asc(posts.createdAt));
      if (rawSort === "reading" || rawSort === "readingTime")
        q = q.orderBy(desc(posts.readingTime));
      if (rawSort === "title") q = q.orderBy(asc(posts.title));

      q = q.limit(pageSize).offset(offset);

      const itemsPromise = q;

      // If we've built a countQ that includes joins/grouping, the safest method
      // is to execute a wrapped raw SQL count. Otherwise, run a simple count select.
      let total = 0;
      if (countQ.toSQL) {
        try {
          const raw = await ctx.db.execute(
            // countQ may include GROUP BY; wrap in subquery to count rows
            sql`SELECT COUNT(*)::int as value FROM (${countQ.toSQL().sql}) as _`
          );
          total = Array.isArray(raw)
            ? (raw[0]?.value as number)
            : (raw as any).rows?.[0]?.value;
        } catch (e) {
          // fallback: run a simple count without joins (best-effort)
          const fallback = await ctx.db.select().from(posts).execute();
          total = Array.isArray(fallback)
            ? fallback.length
            : (fallback as any).rows?.length || 0;
        }
      } else {
        const cnt = await countQ.execute();
        total = Array.isArray(cnt)
          ? cnt.length
          : (cnt as any).rows?.length || 0;
      }

      const items = await itemsPromise;
      // return shape expected by client UI
      return {
        posts: items,
        pagination: {
          page,
          pageSize,
          total: Number(total || 0),
          totalPages: Math.ceil(Number(total || 0) / pageSize),
        },
      };
    }),

  // Related posts (compatibility)
  getRelated: publicProcedure
    .input(z.object({ postId: z.number().int(), limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const limit = input.limit || 3;
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const pcs = await ctx.db
        .select()
        .from(postCategories)
        .where(eq(postCategories.postId, input.postId));
      if (!pcs.length) return [];
      const catIds = pcs.map((p: any) => p.categoryId);
      const related = await ctx.db
        .select()
        .from(posts)
        .innerJoin(postCategories, eq(postCategories.postId, posts.id))
        .where(
          and(
            inArray(postCategories.categoryId, catIds),
            eq(posts.isPublished, true),
            sql`${posts.id} != ${input.postId}`
          )
        )
        .groupBy(posts.id)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
      return related;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });

      const [post] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      if (!post) return null;

      const cats = await ctx.db
        .select()
        .from(categories)
        .innerJoin(postCategories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));

      (post as any).categories = cats;
      return post;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const [post] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      if (!post) return null;
      const cats = await ctx.db
        .select()
        .from(categories)
        .innerJoin(postCategories, eq(postCategories.categoryId, categories.id))
        .where(eq(postCategories.postId, post.id));
      (post as any).categories = cats;
      return post;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(3),
        slug: z.string().optional(),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        categories: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });

      try {
        // generate slug and ensure uniqueness via Drizzle (best-effort loop)
        let baseSlug = input.slug ? slugify(input.slug) : slugify(input.title);
        let finalSlug = baseSlug;
        let i = 1;
        while (true) {
          const found = await ctx.db
            .select()
            .from(posts)
            .where(eq(posts.slug, finalSlug))
            .limit(1);
          if (!found.length) break;
          finalSlug = `${baseSlug}-${i++}`;
        }

        const wc = countWords(input.content);
        const rt = estimateReadingTime(wc);

        const [created] = await ctx.db
          .insert(posts)
          .values({
            slug: finalSlug,
            title: input.title,
            content: input.content,
            excerpt: input.excerpt || null,
            coverImageUrl: input.coverImageUrl || null,
            isPublished: !!input.isPublished,
            wordCount: wc,
            readingTime: rt,
          })
          .returning();

        if (input.categories && input.categories.length) {
          for (const cslug of input.categories) {
            const [cat] = await ctx.db
              .select()
              .from(categories)
              .where(eq(categories.slug, cslug))
              .limit(1);
            const catId = cat?.id;
            if (catId) {
              // avoid duplicate associations
              const exists = await ctx.db
                .select()
                .from(postCategories)
                .where(
                  and(
                    eq(postCategories.postId, created.id),
                    eq(postCategories.categoryId, catId)
                  )
                )
                .limit(1);
              if (!exists.length) {
                await ctx.db.insert(postCategories).values({
                  postId: created.id,
                  categoryId: catId,
                });
              }
            }
          }
        }

        return created;
      } catch (err: any) {
        mapDbErrorToTRPC(err);
      }
    }),

  checkSlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        excludeId: z.number().int().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const found = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      if (!found.length) return { exists: false };
      if (input.excludeId) return { exists: found[0].id !== input.excludeId };
      return { exists: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        coverImageUrl: z.string().url().optional(),
        categories: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });

      const [existing] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

      const updateObj: any = {};
      if (input.title) updateObj.title = input.title;
      if (input.slug) updateObj.slug = slugify(input.slug);
      if (typeof input.content === "string") {
        updateObj.content = input.content;
        const wc = countWords(input.content);
        updateObj.wordCount = wc;
        updateObj.readingTime = estimateReadingTime(wc);
      }
      if (input.excerpt !== undefined)
        updateObj.excerpt = input.excerpt || null;
      if (input.coverImageUrl !== undefined)
        updateObj.coverImageUrl = input.coverImageUrl || null;
      if (typeof input.isPublished === "boolean")
        updateObj.isPublished = input.isPublished;

      if (Object.keys(updateObj).length) {
        try {
          const [post] = await ctx.db
            .update(posts)
            .set({ ...updateObj, updatedAt: new Date() })
            .where(eq(posts.id, input.id))
            .returning();

          if (input.categories) {
            // replace categories via Drizzle
            await ctx.db
              .delete(postCategories)
              .where(eq(postCategories.postId, post.id))
              .returning();
            for (const cslug of input.categories) {
              const [cat] = await ctx.db
                .select()
                .from(categories)
                .where(eq(categories.slug, cslug))
                .limit(1);
              const catId = cat?.id;
              if (catId) {
                await ctx.db
                  .insert(postCategories)
                  .values({ postId: post.id, categoryId: catId });
              }
            }
          }

          return post;
        } catch (err: any) {
          mapDbErrorToTRPC(err);
        }
      }

      return existing;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      await ctx.db.delete(posts).where(eq(posts.id, input.id)).returning();
      return { success: true };
    }),

  togglePublish: adminProcedure
    .input(z.object({ id: z.number().int(), publish: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });
      const [existing] = await ctx.db
        .select({ isPublished: posts.isPublished })
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);
      if (!existing)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      const current = (existing as any).isPublished as boolean;
      const next =
        typeof input.publish === "boolean" ? input.publish : !current;
      const [updated] = await ctx.db
        .update(posts)
        .set({ isPublished: next, updatedAt: new Date() })
        .where(eq(posts.id, input.id))
        .returning();
      return updated;
    }),

  search: publicProcedure
    .input(
      z.object({
        q: z.string().min(1),
        page: z.number().optional(),
        pageSize: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not configured",
        });

      const page = input.page || 1;
      const pageSize = input.pageSize || 10;
      const offset = (page - 1) * pageSize;

      const term = `%${input.q}%`;
      // simple ILIKE-based search across title, excerpt, and content
      const items = await ctx.db
        .select()
        .from(posts)
        .where(
          sql`(title ILIKE ${term} OR excerpt ILIKE ${term} OR content ILIKE ${term})`
        )
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset);

      return { items };
    }),
});
