"use client";
import React, { useEffect, useMemo, useState, Suspense } from "react";
import Pagination from "../../../components/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePosts,
  useDeletePost,
  useTogglePublish,
  useCategories,
} from "../../../lib/hooks/usePosts";
import SearchInput from "../../../components/SearchInput";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { SkeletonTable } from "../../../components/ui/Skeleton";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "../../../components/animations";

function AdminPostsPageContent() {
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

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <Card variant="elevated">
          <CardContent className="p-6">
            <SkeletonTable rows={10} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Manage Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/dashboard/posts/new")}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          New Post
        </Button>
      </div>

      {/* Filters toolbar */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
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
                <Badge
                  key={c.id}
                  variant={selected ? "primary" : "outline"}
                  size="md"
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
                  className="cursor-pointer hover:scale-105 transition-transform"
                  dot={selected}
                >
                  {c.name}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="elevated">
        {selectedIds.length > 0 && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20">
            <Badge variant="primary" size="lg" dot>
              {selectedIds.length} selected
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() =>
                  selectedIds.forEach((id) =>
                    toggle.mutate({ id, publish: true })
                  )
                }
              >
                Publish
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  selectedIds.forEach((id) =>
                    toggle.mutate({ id, publish: false })
                  )
                }
              >
                Unpublish
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} posts?`)) {
                    selectedIds.forEach((id) => deletePost.mutate(id));
                    toast.success(`${selectedIds.length} posts deleted`);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left border-b dark:border-gray-700">
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
                <tr
                  key={p.id}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
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
                    <Badge
                      variant={p.isPublished ? "success" : "warning"}
                      size="sm"
                      dot={p.isPublished}
                    >
                      {p.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(p.categories || []).slice(0, 3).map((c: any) => (
                        <Badge key={c.id} variant="outline" size="sm">
                          {c.name}
                        </Badge>
                      ))}
                      {(p.categories?.length || 0) > 3 && (
                        <Badge variant="default" size="sm">
                          +{(p.categories?.length || 0) - 3}
                        </Badge>
                      )}
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
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/dashboard/posts/${p.id}`)}
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant={p.isPublished ? "ghost" : "success"}
                        size="sm"
                        onClick={() => toggle.mutate({ id: p.id })}
                      >
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${p.title}"?`
                            )
                          ) {
                            deletePost.mutate(p.id);
                            toast.success("Post deleted successfully!");
                          }
                        }}
                        icon={
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <AdminPostsPageContent />
    </Suspense>
  );
}
