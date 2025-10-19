import { router } from "./router";
import { postsRouter } from "./posts";
import { categoriesRouter } from "./categories";
import { publicProcedure, router as trpcRouter } from "./router";

const healthRouter = trpcRouter({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
});

export const appRouter = router({
  posts: postsRouter,
  categories: categoriesRouter,
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
