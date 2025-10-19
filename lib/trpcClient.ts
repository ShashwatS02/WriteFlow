import { useQuery, useMutation } from "@tanstack/react-query";

type ProcedureCall = (
  path: string,
  input?: any,
  type?: "query" | "mutation"
) => Promise<any>;

const call: ProcedureCall = async (path, input, type = "query") => {
  // tRPC v11 HTTP conventions: GET for queries (input in ?input=...), POST for mutations
  const isQuery = type === "query";
  const base = `/api/trpc/${encodeURIComponent(path)}`;
  const url = isQuery
    ? input === undefined
      ? base
      : `${base}?input=${encodeURIComponent(JSON.stringify(input))}`
    : base;
  const res = await fetch(url, {
    method: isQuery ? "GET" : "POST",
    headers: { "content-type": "application/json" },
    body: isQuery ? undefined : JSON.stringify(input ?? null),
  });

  const text = await res.text();
  if (!res.ok) throw new Error("tRPC call failed: " + text);
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error("Unable to parse tRPC response: " + text);
  }
  if (data?.error) throw new Error(JSON.stringify(data.error));
  // tRPC v11 returns { result: { data: { json: ... } } } by default
  if (data?.result?.data?.json !== undefined) return data.result.data.json;
  if (data?.result?.data !== undefined) return data.result.data;
  return data?.result;
};

function makeNamespace(prefix: string) {
  return new Proxy(
    {},
    {
      get(_, prop: string) {
        const path = `${prefix}.${prop}`;
        return {
          useQuery: (input?: any, options?: any) =>
            useQuery({
              queryKey: [path, input],
              queryFn: () => call(path, input, "query"),
              ...options,
            }),
          useMutation: (options?: any) =>
            useMutation({
              mutationFn: (input: any) => call(path, input, "mutation"),
              ...options,
            }),
          query: {
            query: (input?: any) => call(path, input),
          },
          mutate: (input?: any) => call(path, input),
          mutateAsync: (input?: any) => call(path, input),
        } as any;
      },
    }
  ) as any;
}

export const trpc = {
  posts: makeNamespace("posts"),
  categories: makeNamespace("categories"),
};

export default trpc;
