"use client";
import React, { useMemo, useState } from "react";
import { useCategories, useDeleteCategory } from "../../../lib/hooks/usePosts";
import SearchInput from "../../../components/SearchInput";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import trpc from "../../../lib/trpcClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { SkeletonCard } from "../../../components/ui/Skeleton";

const COLORS = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "indigo",
  "purple",
  "pink",
];

export default function CategoriesPage() {
  const router = useRouter();
  const { data, isLoading } = useCategories();
  const deleteCat = useDeleteCategory();
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<any>(null);

  // Fetch category stats
  React.useEffect(() => {
    trpc.categories.getStats
      .query()
      .then(setStats)
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(
      (c: any) =>
        c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s)
    );
  }, [data, search]);

  const handleDelete = (category: any) => {
    if (
      confirm(
        `Are you sure you want to delete "${category.name}"? This will remove it from all posts.`
      )
    ) {
      const toastId = toast.loading("Deleting category...");
      deleteCat.mutate(category.id, {
        onSuccess: () => {
          toast.success("Category deleted successfully!", { id: toastId });
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete category", {
            id: toastId,
          });
        },
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and manage your content categories
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/dashboard/categories/new")}
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
          New Category
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="gradient" hover>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Categories
              </div>
              <div className="text-3xl font-bold dark:text-white">
                {stats.totalCategories || 0}
              </div>
              <div className="mt-2">
                <Badge variant="primary" size="sm">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card variant="gradient" hover>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Posts
              </div>
              <div className="text-3xl font-bold dark:text-white">
                {stats.totalPosts || 0}
              </div>
              <div className="mt-2">
                <Badge variant="info" size="sm">
                  All Time
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card variant="gradient" hover>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Published
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.publishedPosts || 0}
              </div>
              <div className="mt-2">
                <Badge variant="success" size="sm" dot>
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card variant="gradient" hover>
            <CardContent className="p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Reading Time
              </div>
              <div className="text-3xl font-bold dark:text-white">
                {stats.totalReadingTime || 0}
                <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                  min
                </span>
              </div>
              <div className="mt-2">
                <Badge variant="outline" size="sm">
                  Total
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card variant="glass">
        <CardContent className="p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search categories..."
          />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {search
                ? "No categories found matching your search."
                : "No categories yet. Create your first category to get started!"}
            </p>
            {!search && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/dashboard/categories/new")}
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
                Create First Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <Card key={c.id} variant="elevated" hover shimmer>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{c.name}</CardTitle>
                    <Badge variant="outline" size="sm">
                      /{c.slug}
                    </Badge>
                  </div>
                  {c.colorVariant && (
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-md ring-2 ring-gray-100 dark:ring-gray-800"
                      style={{ backgroundColor: c.colorVariant }}
                      title={c.colorVariant}
                    />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {c.description && (
                  <CardDescription className="line-clamp-2">
                    {c.description}
                  </CardDescription>
                )}

                {/* Post count badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md" dot>
                    {c.postCount || 0} {c.postCount === 1 ? "post" : "posts"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => router.push(`/dashboard/categories/${c.id}`)}
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
                    variant="danger"
                    size="sm"
                    fullWidth
                    onClick={() => handleDelete(c)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
