"use client";
import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../../../components/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePosts,
  useDeletePost,
  useTogglePublish,
  useCategories,
} from "../../../lib/hooks/usePosts";
import SearchInput from "../../../components/SearchInput";

export default function AdminPostsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [status, setStatus] = useState<"all" | "published" | "draft">(
    (params.get("status") as any) || "all"
  );
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [selectedCats, setSelectedCats] = useState<string[]>(() => {
    const raw = params.get("cats");
    return raw ? raw.split(",").filter(Boolean) : [];
  });
  const page = Number(params.get("page") || "1");
  const pageSize = Number(params.get("pageSize") || "20");

  const query = useMemo(
    () => ({
      search: search || undefined,
      published: status === "all" ? undefined : status === "published",
      sort,
      categories: selectedCats.length ? selectedCats : undefined,
      page,
      pageSize,
    }),
    [search, status, sort, selectedCats, page, pageSize]
  );

  const { data, isLoading } = usePosts(query);
  const deletePost = useDeletePost();
  const toggle = useTogglePublish();
  const cats = useCategories();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const allSelected = !!(
    data?.items?.length && selectedIds.length === data.items.length
  );
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds((data?.items || []).map((p: any) => p.id));
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Posts</h1>

      {/* Filters toolbar */}
      <div className="bg-white border rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="min-w-[240px]">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              const q = new URLSearchParams(params.toString());
              if (v) q.set("q", v);
              else q.delete("q");
              q.set("page", "1");
              router.replace(`/dashboard/posts?${q.toString()}`);
            }}
            placeholder="Search by title or content..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            const val = e.target.value as any;
            setStatus(val);
            const q = new URLSearchParams(params.toString());
            if (val === "all") q.delete("status");
            else q.set("status", val);
            q.set("page", "1");
            router.replace(`/dashboard/posts?${q.toString()}`);
          }}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            const val = e.target.value;
            setSort(val);
            const q = new URLSearchParams(params.toString());
            q.set("sort", val);
            q.set("page", "1");
            router.replace(`/dashboard/posts?${q.toString()}`);
          }}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="reading">Reading time</option>
          <option value="title">Title</option>
        </select>
        <div className="flex gap-2 flex-wrap">
          {cats.data?.map((c: any) => {
            const selected = selectedCats.includes(c.slug);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCats((prev) => {
                    const next = selected
                      ? prev.filter((s) => s !== c.slug)
                      : [...prev, c.slug];
                    const q = new URLSearchParams(params.toString());
                    if (next.length) q.set("cats", next.join(","));
                    else q.delete("cats");
                    q.set("page", "1");
                    router.replace(`/dashboard/posts?${q.toString()}`);
                    return next;
                  });
                }}
                className={`px-3 py-1 rounded-full text-xs border ${selected ? "bg-slate-900 text-white" : ""}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded-lg">
        {selectedIds.length > 0 && (
          <div className="p-3 border-b flex items-center gap-2 text-sm bg-slate-50">
            <span>{selectedIds.length} selected</span>
            <button
              className="px-2 py-1 rounded border"
              onClick={() =>
                selectedIds.forEach((id) =>
                  toggle.mutate({ id, publish: true })
                )
              }
            >
              Publish
            </button>
            <button
              className="px-2 py-1 rounded border"
              onClick={() =>
                selectedIds.forEach((id) =>
                  toggle.mutate({ id, publish: false })
                )
              }
            >
              Unpublish
            </button>
            <button
              className="px-2 py-1 rounded border text-red-600"
              onClick={() => selectedIds.forEach((id) => deletePost.mutate(id))}
            >
              Delete
            </button>
          </div>
        )}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={!!allSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Categories</th>
              <th className="p-3">Reading</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    aria-label={`Select ${p.title}`}
                  />
                </td>
                <td className="p-3">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.slug}</div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${p.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(p.categories || []).slice(0, 3).map((c: any) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  {p.readingTime ? `${p.readingTime} min` : "—"}
                </td>
                <td className="p-3">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="px-2 py-1 rounded border"
                      onClick={() => toggle.mutate({ id: p.id })}
                    >
                      {p.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="px-2 py-1 rounded border text-red-600"
                      onClick={() => deletePost.mutate(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={data?.pagination?.totalPages || 1}
        pageSize={pageSize}
        total={data?.pagination?.total}
        onPageChange={(next: number) => {
          const q = new URLSearchParams(params.toString());
          q.set("page", String(next));
          router.replace(`/dashboard/posts?${q.toString()}`);
        }}
      />
    </div>
  );
}
