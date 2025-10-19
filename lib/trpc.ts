import { initTRPC, TRPCError } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { db } from './db';

// Context creation
export async function createContext({ req }: FetchCreateContextFnOptions) {
  // Check for admin token in x-admin-token header
  const adminToken = req.headers.get('x-admin-token');
  const isAdmin = adminToken === process.env.ADMIN_API_TOKEN && adminToken;
  
  return {
    db,
    isAdmin,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// Middleware for admin-only procedures
const isAdminMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Admin token required' 
    });
  }
  return next();
});

// Export router and procedure builders
export const router = t.router;
export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(isAdminMiddleware);
