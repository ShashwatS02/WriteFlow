import { describe, it, expect } from "vitest";
import mapDbErrorToTRPC from "../server/trpc/errorMap";
import { TRPCError } from "@trpc/server";

describe("mapDbErrorToTRPC", () => {
  it("throws TRPC CONFLICT for Postgres 23505 unique violation", () => {
    const err = {
      code: "23505",
      message: "duplicate key value violates unique constraint",
    } as any;
    try {
      mapDbErrorToTRPC(err);
      // should not reach here
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect((e as any).code).toBe("CONFLICT");
    }
  });

  it("rethrows other errors", () => {
    const err = new Error("some other failure");
    try {
      mapDbErrorToTRPC(err);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBe(err);
    }
  });
});
