import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../server/trpc/index";

async function run() {
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc",
        headers() {
          return { "x-admin-token": process.env.ADMIN_API_TOKEN || "" };
        },
        transformer: superjson,
      }),
    ],
  });

  try {
    const post = await trpc.posts.create.mutate({
      title: "Test via script",
      content: "Hello",
    });
    console.log("created", post);
  } catch (err) {
    console.error("error", err);
  }
}

run();
