"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCreatePost, useCategories } from "../../../../lib/hooks/usePosts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { uploadFile } from "../../../../lib/upload";
import { mockUpload } from "../../../../lib/uploadMock";
import SearchInput from "../../../../components/SearchInput";
import trpc from "../../../../lib/trpcClient";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const categories = useCategories();
  const create = useCreatePost();
  const [slugTaken, setSlugTaken] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const savingRef = useRef(false);

  const insertInlineImage = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadFile(file);
      const url = res.url || (await mockUpload(file));
      setContent((c) => c + `\n\n![](${url})\n`);
    } finally {
      setUploading(false);
    }
  };

  // Debounced autosave (draft)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!title && !content) return;
      savingRef.current = true;
      create.mutate(
        { title, slug, content, excerpt, coverImageUrl: cover || undefined, categories: selectedCats },
        {
          onSuccess: () => setLastSaved(new Date()),
          onSettled: () => (savingRef.current = false),
        }
      );
    }, 10000);
    return () => clearTimeout(t);
  }, [title, slug, content, excerpt, cover, selectedCats, create]);

  // Slug uniqueness check
  useEffect(() => {
    if (!slug) {
      setSlugTaken(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await trpc.posts.checkSlug.query({ slug });
        setSlugTaken(res.exists);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [slug]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (savingRef.current || content || title) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [content, title]);

  return (
    <div className="h-[calc(100vh-60px)] p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">New Post</h1>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded border"
            onClick={() => create.mutate({ title, slug, content, excerpt, coverImageUrl: cover || undefined, categories: selectedCats })}
            disabled={slugTaken}
            title={slugTaken ? "Slug already exists" : undefined}
          >
            Save Draft
          </button>
          <button
            className={`px-3 py-2 rounded ${slugTaken ? 'bg-slate-300 text-slate-600' : 'bg-slate-900 text-white'}`}
            onClick={() => create.mutate({ title, slug, content, excerpt, coverImageUrl: cover || undefined, categories: selectedCats, isPublished: true })}
            disabled={slugTaken}
          >
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Editor side */}
        <div className="flex flex-col border rounded-lg overflow-hidden">
          <div className="p-3 border-b grid grid-cols-1 gap-2">
            <input className="w-full border rounded px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <input className="w-full border rounded px-3 py-2" placeholder="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
              {slugTaken && <div className="text-xs text-red-600 mt-1">Slug already exists. Try a different one.</div>}
            </div>
            <input className="w-full border rounded px-3 py-2" placeholder="Excerpt (optional)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.data?.map((c: any) => {
                const selected = selectedCats.includes(c.slug);
                return (
                  <button key={c.id} className={`px-2 py-1 rounded text-sm border ${selected ? 'bg-slate-900 text-white' : ''}`} onClick={() => setSelectedCats((prev) => selected ? prev.filter((s) => s !== c.slug) : [...prev, c.slug])}>{c.name}</button>
                );
              })}
            </div>
            {/* Cover */}
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploading(true);
                try {
                  const res = await uploadFile(f);
                  const url = res.url || (await mockUpload(f));
                  setCover(url);
                } finally {
                  setUploading(false);
                }
              }} />
              {cover && <img src={cover} alt="cover" className="h-12 w-12 object-cover rounded" />}
            </div>
          </div>
          <textarea
            className="flex-1 p-3 outline-none"
            placeholder="Write in Markdown..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onDrop={async (e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) await insertInlineImage(f);
            }}
            onDragOver={(e) => e.preventDefault()}
          />
          <div className="p-3 border-t text-xs text-slate-500 flex items-center justify-between">
            <span>{uploading ? "Uploading..." : "Drag & drop images to insert"}</span>
            <span>{lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}</span>
          </div>
        </div>

        {/* Preview side */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 border-b font-semibold">Live Preview</div>
          <div className="prose max-w-none p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
              {content || "Start writing to see the preview..."}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
