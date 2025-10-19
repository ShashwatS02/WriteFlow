import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadFile } from "../lib/upload";

describe("uploadFile", () => {
  let originalFetch: any;
  let originalXHR: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalXHR = (global as any).XMLHttpRequest;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    (global as any).XMLHttpRequest = originalXHR;
    vi.restoreAllMocks();
  });

  it("uses Uploadthing proxy when available", async () => {
    const fakeUrl = "https://cdn.example.com/image.jpg";
    global.fetch = vi.fn((input: any) => {
      if (String(input).includes("/api/uploads/uploadthing")) {
        return Promise.resolve(
          new Response(JSON.stringify({ fileUrl: fakeUrl }), {
            status: 200,
            headers: { "content-type": "application/json" },
          } as any)
        );
      }
      return Promise.reject(new Error("unexpected"));
    }) as any;

    const file = new File(["a"], "a.png", { type: "image/png" });
    const res = await uploadFile(file as any);
    expect(res.url).toBe(fakeUrl);
  });

  it("falls back to presign and uses XHR for PUT with progress", async () => {
    const uploadUrl = "https://s3.example.com/put-url";
    const fileUrl = "https://s3.example.com/uploads/1.png";

    // mock fetch: first /uploadthing fails, presign returns uploadUrl
    global.fetch = vi.fn((input: any, init?: any) => {
      const url = String(input);
      if (url.includes("/api/uploads/uploadthing")) {
        return Promise.resolve(
          new Response("not found", { status: 501 }) as any
        );
      }
      if (url.includes("/api/uploads/presign")) {
        return Promise.resolve(
          new Response(JSON.stringify({ uploadUrl, fileUrl, key: "k" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          } as any)
        );
      }
      return Promise.reject(new Error("unexpected"));
    }) as any;

    // Mock XMLHttpRequest to simulate upload progress and success
    class FakeXHR {
      readyState: number = 0;
      status: number = 0;
      onreadystatechange: (() => void) | null = null;
      upload: any = {};
      _sendData: any;
      open(method: string, url: string) {}
      setRequestHeader(k: string, v: string) {}
      send(data: any) {
        this.readyState = 4;
        this.status = 200;
        // simulate progress
        if (this.upload && this.upload.onprogress) {
          this.upload.onprogress({
            lengthComputable: true,
            loaded: 50,
            total: 100,
          });
          this.upload.onprogress({
            lengthComputable: true,
            loaded: 100,
            total: 100,
          });
        }
        if (this.onreadystatechange) this.onreadystatechange();
      }
    }

    (global as any).XMLHttpRequest = FakeXHR as any;

    const file = new File(["a".repeat(1024)], "a.png", { type: "image/png" });
    const res = await uploadFile(file as any, (p) => {
      // progress callback should be called with numbers 50 then 100
      expect(typeof p).toBe("number");
    });
    expect(res.url).toBe(fileUrl);
  });

  it("falls back to mockUpload when everything else fails", async () => {
    // force fetch to throw
    global.fetch = vi.fn(() => Promise.reject(new Error("network"))) as any;

    // mock uploadMock import by stubbing URL.createObjectURL
    const objUrl = "blob:http://example/123";
    const oldCreate = (global as any).URL.createObjectURL;
    (global as any).URL.createObjectURL = vi.fn(() => objUrl);

    const file = new File(["a"], "a.png", { type: "image/png" });
    const res = await uploadFile(file as any);
    expect(res.url).toBe(objUrl);

    (global as any).URL.createObjectURL = oldCreate;
  });
});
