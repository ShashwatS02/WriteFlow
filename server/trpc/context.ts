import { inferAsyncReturnType } from "@trpc/server";
import { pool, db } from "../../lib/db";

// Accept a flexible context shape so it can be called from Next.js adapters
// or the fetch adapter used in edge/route handlers.
export async function createContext(opts: { req?: any; res?: any } = {}) {
  const { req, res } = opts;
  return { req, res, pool, db };
}

export type Context = inferAsyncReturnType<typeof createContext>;
