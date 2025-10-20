// Quick test to verify tRPC endpoints are responding
const BASE = "http://127.0.0.1:3001/api/trpc";

async function testEndpoint(name, path, input) {
  const url =
    input !== undefined
      ? `${BASE}/${path}?input=${encodeURIComponent(JSON.stringify(input))}`
      : `${BASE}/${path}`;

  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);

  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`   Status: ${res.status}`);

    if (res.ok) {
      try {
        const data = JSON.parse(text);
        console.log(
          `   ✅ Success:`,
          JSON.stringify(data, null, 2).substring(0, 200)
        );
      } catch {
        console.log(`   ✅ Response (text):`, text.substring(0, 150));
      }
    } else {
      console.log(`   ❌ Error:`, text.substring(0, 200));
    }
  } catch (err) {
    console.log(`   ❌ Failed:`, err.message);
  }
}

async function main() {
  console.log("🚀 Testing WriteFlow tRPC endpoints...\n");

  // Give the server a moment if it just started
  await new Promise((r) => setTimeout(r, 1000));

  await testEndpoint("Health Check", "health.ping");
  await testEndpoint("Categories Stats", "categories.getStats");
  await testEndpoint("Posts (published, newest)", "posts.getAll", {
    page: 1,
    pageSize: 3,
    isPublished: true,
    sortBy: "newest",
  });

  console.log("\n✨ Tests complete!\n");
}

main().catch(console.error);
