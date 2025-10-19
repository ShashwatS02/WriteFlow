import { mockUpload } from "./uploadMock";

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url?: string; key?: string; error?: string }> {
  // 1) Try Uploadthing proxy
  try {
    const fd = new FormData();
    fd.append("file", file);
    const utRes = await fetch("/api/uploads/uploadthing", {
      method: "POST",
      body: fd,
    });
    if (utRes.ok) {
      const utBody = await utRes.json().catch(() => null);
      // If Uploadthing returns JSON with a URL, return that. Otherwise return raw text.
      if (utBody && utBody?.fileUrl) return { url: utBody.fileUrl };
      const text = await utRes.text();
      return { url: text };
    }
  } catch (e) {
    // ignore and try presign
  }

  // 2) Try S3 presign
  try {
    const res = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });

    const body = await res.json();
    if (res.ok && body?.uploadUrl) {
      // Use XHR to provide progress callbacks
      const uploadUrl: string = body.uploadUrl;
      const xhrResult = await new Promise<{ ok: boolean }>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader(
          "Content-Type",
          file.type || "application/octet-stream"
        );
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            resolve({ ok: xhr.status >= 200 && xhr.status < 300 });
          }
        };
        xhr.send(file as any);
      });
      if (xhrResult.ok) return { url: body.fileUrl, key: body.key };
    }
  } catch (e) {
    // ignore and fall back
  }

  // 3) Fallback to mock (dev)
  try {
    const url = await mockUpload(file as File);
    return { url };
  } catch (e: any) {
    return { error: e?.message || String(e) };
  }
}
