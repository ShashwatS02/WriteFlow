import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

// simple admin middleware: expects an `x-admin-token` header matching
// process.env.ADMIN_API_TOKEN. This is intentionally minimal for a
// single-admin setup — replace with a proper auth solution later.
import { TRPCError } from "@trpc/server";

const isAdmin = t.middleware(({ ctx, next }) => {
  const token = ctx.req?.headers["x-admin-token"] as string | undefined;
  const expected = process.env.ADMIN_API_TOKEN;

  // Local dev convenience: if no ADMIN_API_TOKEN is configured and we're
  // not in production, allow the request but log a warning so developers
  // are aware. In production, the token is mandatory.
  if (!expected && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "ADMIN_API_TOKEN not set: allowing admin actions in development"
    );
    return next();
  }

  if (!expected || token !== expected) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }
  return next();
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(isAdmin);
