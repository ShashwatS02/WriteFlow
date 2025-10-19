// Use global fetch (available in Node 18+)

async function postBodyStyle() {
  const url = "http://127.0.0.1:3000/api/trpc";
  const body = {
    id: 1,
    jsonrpc: "2.0",
    method: "query",
    params: { path: "health.ping", input: null },
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("Body-style status", res.status);
    const text = await res.text();
    console.log("Body-style body:", text);
  } catch (err) {
    console.error("Body-style error", {
      name: err?.name,
      message: err?.message,
      cause: err?.cause,
      stack: err?.stack,
    });
    throw err;
  }
}

async function postUrlStyle() {
  const url = "http://127.0.0.1:3000/api/trpc/health.ping";
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });
    console.log("URL-style status", res.status);
    const text = await res.text();
    console.log("URL-style body:", text);
  } catch (err) {
    console.error("URL-style error", {
      name: err?.name,
      message: err?.message,
      cause: err?.cause,
      stack: err?.stack,
    });
    throw err;
  }
}

async function withRetries(fn, label) {
  const max = 10;
  for (let i = 1; i <= max; i++) {
    try {
      await fn();
      return;
    } catch (e) {
      console.log(`${label} attempt ${i}/${max} failed, retrying...`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

(async () => {
  await withRetries(postUrlStyle, "URL-style");
  await withRetries(postBodyStyle, "Body-style");
})();
