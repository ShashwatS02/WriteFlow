"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePostById,
  useUpdatePost,
  useCategories,
} from "../../../../lib/hooks/usePosts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { uploadFile } from "../../../../lib/upload";
import { mockUpload } from "../../../../lib/uploadMock";
import trpc from "../../../../lib/trpcClient";
import { toast } from "sonner";
import { slugify } from "../../../../lib/utils";
import { Card, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Input } from "../../../../components/ui/Input";
import { Skeleton } from "../../../../components/ui/Skeleton";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [postId, setPostId] = useState<number | undefined>(undefined);

  useEffect(() => {
    params.then((p) => setPostId(parseInt(p.id, 10)));
  }, [params]);
  const { data: post, isLoading } = usePostById(postId);
  const update = useUpdatePost();
  const categories = useCategories();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Initialize form with post data
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCover(post.coverImageUrl || null);
      setIsPublished(post.isPublished || false);

      // Extract category slugs
      const catSlugs =
        (post as any).categories
          ?.map((c: any) => c.categories?.slug || c.slug)
          .filter(Boolean) || [];
      setSelectedCats(catSlugs);
    }
  }, [post]);

  // Auto-generate slug from title when enabled
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  // Slug uniqueness check (exclude current post)
  useEffect(() => {
    if (!slug) {
      setSlugTaken(false);
      setCheckingSlug(false);
      return;
    }
    setCheckingSlug(true);
    const t = setTimeout(async () => {
      try {
        const res = await trpc.posts.checkSlug.query({
          slug,
          excludeId: postId,
        });
        setSlugTaken(res.exists);
      } catch {
        setSlugTaken(false);
      } finally {
        setCheckingSlug(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [slug, postId]);

  const insertInlineImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadFile(file);
      const url = res.url || (await mockUpload(file));
      setContent((c) => c + `\n\n![](${url})\n`);
      toast.success("Image inserted!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (publish?: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (slugTaken) {
      toast.error("Slug already exists. Please choose a different one.");
      return;
    }

    const newPublishStatus =
      typeof publish === "boolean" ? publish : isPublished;
    const toastId = toast.loading("Updating post...");

    update.mutate(
      {
        id: postId,
        title: title.trim(),
        slug: slug.trim() || undefined,
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImageUrl: cover || undefined,
        categories: selectedCats,
        isPublished: newPublishStatus,
      },
      {
        onSuccess: () => {
          toast.success("Post updated successfully!", { id: toastId });
          setIsPublished(newPublishStatus);
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update post", {
            id: toastId,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">
            Post not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The post you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/dashboard/posts")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-60px)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/dashboard/posts")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-xl font-bold dark:text-white mt-1">Edit Post</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Post ID: {postId} • Status: {isPublished ? "Published" : "Draft"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleUpdate()}
            disabled={
              slugTaken || checkingSlug || !title.trim() || !content.trim()
            }
          >
            Save Changes
          </button>
          {isPublished ? (
            <button
              className="px-3 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50 transition-colors"
              onClick={() => handleUpdate(false)}
              disabled={
                slugTaken || checkingSlug || !title.trim() || !content.trim()
              }
            >
              Unpublish
            </button>
          ) : (
            <button
              className={`px-3 py-2 rounded transition-colors ${
                slugTaken || checkingSlug || !title.trim() || !content.trim()
                  ? "bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={() => handleUpdate(true)}
              disabled={
                slugTaken || checkingSlug || !title.trim() || !content.trim()
              }
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-60px)]">
        {/* Editor side */}
        <div className="flex flex-col border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
          <div className="p-3 border-b dark:border-gray-700 grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium dark:text-gray-200">
                  URL Slug
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => {
                    setAutoSlug(!autoSlug);
                    if (!autoSlug && title) {
                      setSlug(slugify(title));
                    }
                  }}
                >
                  {autoSlug ? "Manual" : "Auto"}
                </button>
              </div>
              <input
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="auto-generated-from-title"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoSlug(false);
                }}
                disabled={autoSlug}
              />
              {checkingSlug && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                  <svg
                    className="animate-spin h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking availability...
                </div>
              )}
              {slugTaken && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ✗ Slug already exists. Try a different one.
                </div>
              )}
              {slug && !slugTaken && !checkingSlug && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Slug available
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Excerpt
              </label>
              <textarea
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Brief summary (optional)..."
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.data?.map((c: any) => {
                  const selected = selectedCats.includes(c.slug);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
                      }`}
                      onClick={() =>
                        setSelectedCats((prev) =>
                          selected
                            ? prev.filter((s) => s !== c.slug)
                            : [...prev, c.slug]
                        )
                      }
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                  <span>
                    {uploading
                      ? "Uploading..."
                      : cover
                        ? "Change Image"
                        : "Choose Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading(true);
                      try {
                        const res = await uploadFile(f);
                        const url = res.url || (await mockUpload(f));
                        setCover(url);
                        toast.success("Image uploaded successfully!");
                      } catch (error) {
                        toast.error("Failed to upload image");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </label>
                {cover && (
                  <div className="flex items-center gap-2">
                    <img
                      src={cover}
                      alt="cover"
                      className="h-16 w-16 object-cover rounded border dark:border-gray-600"
                    />
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setCover(null)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="relative flex-1 flex flex-col">
            <textarea
              className="flex-1 p-4 outline-none dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 font-mono text-sm resize-none"
              placeholder="Write your content in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onDrop={async (e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith("image/")) {
                  await insertInlineImage(f);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            />
          </div>
          <div className="p-3 border-t dark:border-gray-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
            <span className="flex items-center gap-2">
              {uploading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading image...
                </>
              ) : (
                "💡 Drag & drop images to insert inline"
              )}
            </span>
            <span>
              {content.split(/\s+/).filter(Boolean).length} words • ~
              {Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min
              read
            </span>
          </div>
        </div>

        {/* Preview side */}
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 flex flex-col">
          <div className="p-3 border-b dark:border-gray-700 font-semibold dark:text-white flex items-center justify-between">
            <span>Live Preview</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              Markdown rendering
            </span>
          </div>
          <div className="prose dark:prose-invert max-w-none p-6 overflow-y-auto flex-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize, rehypeHighlight]}
            >
              {content || "Start writing to see the preview..."}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
