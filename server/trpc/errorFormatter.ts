import { TRPCError } from "@trpc/server";

export function formatTRPCError(err: unknown) {
  if (err instanceof TRPCError) {
    return { message: err.message, code: err.code };
  }
  return { message: "Unknown error", code: "INTERNAL_SERVER_ERROR" };
}
