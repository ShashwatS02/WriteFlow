import { NextResponse } from "next/server";

// This is a simple proxy that accepts a multipart/form-data file upload and
// forwards it to Uploadthing or returns 501 when Uploadthing is not configured.
export async function POST(request: Request) {
  const uploadthingUrl = process.env.UPLOADTHING_URL;
  const uploadthingSecret = process.env.UPLOADTHING_SECRET;
  const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024); // 5MB default

  if (!uploadthingUrl || !uploadthingSecret) {
    return NextResponse.json(
      { error: "Uploadthing not configured" },
      { status: 501 }
    );
  }

  try {
    // Basic validation: ensure Content-Type is multipart/form-data and size isn't too large.
    const contentType = request.headers.get("content-type") || "";
    const contentLength = Number(request.headers.get("content-length") || "0");
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }
    if (contentLength && contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const bodyBuffer = await request.arrayBuffer();
    if (bodyBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    // Forward the incoming request body to Uploadthing. We preserve headers so
    // multipart form data is forwarded correctly.
    const res = await fetch(uploadthingUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${uploadthingSecret}`,
        // Let fetch set the correct content-type with boundary
      },
      body: bodyBuffer,
    });

    const resContentType = res.headers.get("content-type") || "text/plain";
    const text = await res.text();
    // Try to parse JSON and normalize it to { fileUrl }
    try {
      const json = JSON.parse(text);
      // Uploadthing typically returns an object with file metadata; attempt to
      // extract a public URL field. This may need adjustment depending on
      // your Uploadthing setup. We'll try common keys.
      const fileUrl =
        json?.fileUrl || json?.url || json?.data?.fileUrl || json?.data?.url;
      if (fileUrl)
        return NextResponse.json({ fileUrl }, { status: res.status });
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": resContentType },
      });
    } catch (e) {
      return new NextResponse(text, {
        status: res.status,
        headers: { "content-type": resContentType },
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
