import { TRPCError } from "@trpc/server";

export function mapDbErrorToTRPC(err: any): never {
  if (err && (err.code === "23505" || /unique/i.test(err.message || ""))) {
    throw new TRPCError({ code: "CONFLICT", message: "Slug already exists" });
  }
  // rethrow original if we don't know how to map
  throw err;
}

export default mapDbErrorToTRPC;
