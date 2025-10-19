"use client";
import React, { useEffect, useState, useRef } from "react";
import { mockUpload } from "../lib/uploadMock";
import { uploadFile } from "../lib/upload";
import { useUpdatePost, useCategories } from "../lib/hooks/usePosts";
import trpc from "../lib/trpcClient";
import { toast } from "sonner";

export default function PostEditor({ post }: { post: any }) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [cover, setCover] = useState(post?.coverImageUrl || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    post?.categories?.map((c: any) => c.slug) || []
  );
  const [slugTaken, setSlugTaken] = useState(false);
  const update = useUpdatePost();
  const savingRef = useRef(false);
  const { data: allCategories } = useCategories();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const tempObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setTitle(post?.title || "");
    setContent(post?.content || "");
  }, [post]);

  // small debounce implementation
  function debounceFn<T extends (...args: any[]) => void>(fn: T, wait = 10000) {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  const save = React.useCallback(
    debounceFn(() => {
      if (!post?.id) return;
      if (slugTaken) return; // don't autosave when slug conflicts
      savingRef.current = true;
      update.mutate(
        {
          id: post.id,
          title,
          content,
          slug,
          excerpt,
          coverImageUrl: cover,
          categories: selectedCategories,
        },
        {
          onSettled() {
            savingRef.current = false;
          },
          onError(err: any) {
            // map tRPC CONFLICT to UI state
            if (err?.data?.code === "CONFLICT" || err?.code === "CONFLICT") {
              setSlugTaken(true);
              toast.error("Slug already exists. Please choose another.");
            } else {
              toast.error(err?.message || "Save failed");
            }
          },
        }
      );
    }, 10000),
    [post?.id, title, content]
  );

  useEffect(() => {
    save();
    return () => {};
  }, [title, content, save]);

  // debounce slug check
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    if (!slug) {
      setSlugTaken(false);
      return;
    }
    t = setTimeout(async () => {
      try {
        const res = await trpc.posts.checkSlug.query({
          slug,
          excludeId: post?.id,
        });
        setSlugTaken(res.exists);
      } catch (e) {
        // ignore
      }
    }, 500);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [slug, post?.id]);

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    // Try production upload (S3 presign). If not configured or it fails,
    // fall back to the dev mock uploader which returns a blob URL.
    try {
      const res = await uploadFile(f);
      if (res?.error) {
        const url = await mockUpload(f);
        setContent((c: string) => c + `\n\n![](${url})\n`);
      } else {
        setContent((c: string) => c + `\n\n![](${res.url})\n`);
      }
    } catch (e) {
      const url = await mockUpload(f);
      setContent((c: string) => c + `\n\n![](${url})\n`);
    }
  };

  const onInsertImageClick = () => {
    fileInputRef.current?.click();
  };

  const onFilePicked = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setUploadPercent(0);
    const onProgress = (p: number) => {
      setUploadPercent(p);
    };
    try {
      // create a temporary preview immediately
      const obj = URL.createObjectURL(f);
      tempObjectUrlRef.current = obj;
      setPreviewUrl(obj);

      const res = await uploadFile(f, onProgress);
      if (res?.error) {
        toast.error(res.error || "Upload failed");
      } else if (res?.url) {
        setContent((c: string) => c + `\n\n![](${res.url})\n`);
        // Replace temp preview with final uploaded URL
        if (tempObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(tempObjectUrlRef.current);
          } catch {}
          tempObjectUrlRef.current = null;
        }
        setPreviewUrl(res.url);
        toast.success("Image uploaded");
      }
    } catch (e) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadPercent(null);
    }
  };

  const onCoverChange = async (f: File | undefined) => {
    if (!f) return;
    try {
      // preview immediately
      const obj = URL.createObjectURL(f);
      tempObjectUrlRef.current = obj;
      setPreviewUrl(obj);
      setUploadPercent(0);
      const onProgress = (p: number) => setUploadPercent(p);
      const res = await uploadFile(f, onProgress);
      if (res?.error) {
        const url = await mockUpload(f);
        setCover(url);
      } else {
        // swap temp preview with final URL
        if (tempObjectUrlRef.current) {
          try {
            URL.revokeObjectURL(tempObjectUrlRef.current);
          } catch {}
          tempObjectUrlRef.current = null;
        }
        setCover(res.url || "");
        setPreviewUrl(res.url || null);
      }
    } catch (e) {
      const url = await mockUpload(f);
      setCover(url);
    }
  };

  // revoke any remaining object URL on unmount
  useEffect(() => {
    return () => {
      if (tempObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(tempObjectUrlRef.current);
        } catch {}
        tempObjectUrlRef.current = null;
      }
    };
  }, []);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((s) =>
      s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        <input
          className="w-full p-2 border"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full p-2 border"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        {slugTaken && (
          <div className="text-sm text-red-600">
            This slug is already in use. Please choose another.
          </div>
        )}
        <input
          className="w-full p-2 border"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
        />
      </div>
      <textarea
        className="w-full p-2 border min-h-[300px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      />
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 bg-slate-200 rounded"
          onClick={onInsertImageClick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Insert image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            onFilePicked(e.target.files ? e.target.files[0] : undefined)
          }
        />
        {uploadPercent !== null && (
          <div className="w-48">
            <div className="h-2 bg-slate-200 rounded overflow-hidden">
              <div
                className="h-2 bg-blue-600"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">{uploadPercent}%</div>
          </div>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="h-12 w-12 object-cover rounded"
          />
        )}
      </div>
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm">Cover image</label>
          <div className="mt-1">
            {cover ? (
              <img src={cover} className="h-24 object-cover" alt="cover" />
            ) : (
              <div className="h-24 w-40 bg-slate-100" />
            )}
          </div>
          <div className="mt-2 flex gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                onCoverChange(e.target.files ? e.target.files[0] : undefined)
              }
              className=""
            />
            {cover && (
              <button
                className="px-2 py-1 bg-red-100 text-red-600 rounded"
                onClick={() => {
                  setCover("");
                  // persist removal
                  update.mutate({
                    id: post.id,
                    coverImageUrl: null,
                    title,
                    content,
                    slug,
                    excerpt,
                    categories: selectedCategories,
                  });
                }}
              >
                Remove cover
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm">Categories</label>
          <div className="flex gap-2 mt-2">
            {allCategories && allCategories.length ? (
              allCategories.map((c: any) => (
                <button
                  key={c.id}
                  className={`px-2 py-1 rounded ${selectedCategories.includes(c.slug) ? "bg-blue-600 text-white" : "bg-slate-200"}`}
                  onClick={() => toggleCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))
            ) : (
              <div>No categories</div>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm text-slate-500">
        {savingRef.current ? "Saving..." : "All changes saved"}
      </div>
      <div className="pt-2">
        <button
          className={`px-4 py-2 rounded ${slugTaken || savingRef.current ? "bg-slate-300 text-slate-600" : "bg-green-600 text-white"}`}
          onClick={() => {
            if (slugTaken || savingRef.current) return;
            savingRef.current = true;
            update.mutate(
              {
                id: post.id,
                title,
                content,
                slug,
                excerpt,
                coverImageUrl: cover,
                categories: selectedCategories,
              },
              {
                onSettled() {
                  savingRef.current = false;
                },
                onError(err: any) {
                  if (
                    err?.data?.code === "CONFLICT" ||
                    err?.code === "CONFLICT"
                  ) {
                    setSlugTaken(true);
                    toast.error("Slug already exists. Please choose another.");
                  } else {
                    toast.error(err?.message || "Save failed");
                  }
                },
              }
            );
          }}
          disabled={slugTaken || savingRef.current}
        >
          Save now
        </button>
      </div>

      {/* toasts handled globally by Sonner Toaster */}
    </div>
  );
}
