"use client";
import React, { useState, useEffect } from "react";
import {
  useUpdateCategory,
  useDeleteCategory,
} from "../../../../lib/hooks/usePosts";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { slugify } from "../../../../lib/utils";
import Link from "next/link";
import trpc from "../../../../lib/trpcClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { Input } from "../../../../components/ui/Input";
import { Skeleton } from "../../../../components/ui/Skeleton";

const COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(false);
  const [description, setDescription] = useState("");
  const [colorVariant, setColorVariant] = useState(COLORS[6].value);
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Load existing category
  useEffect(() => {
    if (categoryId) {
      trpc.categories.getById
        .query({ id: categoryId })
        .then((data: any) => {
          setCategory(data);
          setName(data.name || "");
          setSlug(data.slug || "");
          setDescription(data.description || "");
          setColorVariant(data.colorVariant || COLORS[6].value);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Category not found");
          router.push("/dashboard/categories");
        });
    }
  }, [categoryId, router]);

  // Auto-generate slug from name (only when manually enabled)
  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  // Check slug uniqueness
  useEffect(() => {
    if (!slug) {
      setSlugTaken(false);
      setCheckingSlug(false);
      return;
    }
    setCheckingSlug(true);
    const t = setTimeout(async () => {
      try {
        const categories = await trpc.categories.getAll.query();
        const exists = categories.some(
          (c: any) => c.slug === slug && c.id !== categoryId
        );
        setSlugTaken(exists);
      } catch {
        setSlugTaken(false);
      } finally {
        setCheckingSlug(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [slug, categoryId]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (slugTaken) {
      toast.error("Slug already exists. Please choose a different one.");
      return;
    }

    const toastId = toast.loading("Updating category...");

    updateCategory.mutate(
      {
        id: categoryId,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        colorVariant,
      },
      {
        onSuccess: () => {
          toast.success("Category updated successfully!", { id: toastId });
          router.push("/dashboard/categories");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to update category", {
            id: toastId,
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete "${category?.name}"? This will remove it from all posts.`
      )
    ) {
      const toastId = toast.loading("Deleting category...");
      deleteCategory.mutate(categoryId, {
        onSuccess: () => {
          toast.success("Category deleted successfully!", { id: toastId });
          router.push("/dashboard/categories");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to delete category", {
            id: toastId,
          });
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            Loading category...
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/dashboard/categories"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold dark:text-white">Edit Category</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update category information
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-lg p-6">
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Technology, Tutorials, News..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium dark:text-gray-200">
                URL Slug
              </label>
              <button
                type="button"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  setAutoSlug(!autoSlug);
                  if (!autoSlug && name) {
                    setSlug(slugify(name));
                  }
                }}
              >
                {autoSlug ? "Manual" : "Auto-Generate"}
              </button>
            </div>
            <input
              type="text"
              className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="category-slug"
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Description
            </label>
            <textarea
              className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Brief description of this category (optional)..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setColorVariant(color.value)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all ${
                    colorVariant === color.value
                      ? "border-blue-500 dark:border-blue-400 scale-110"
                      : "border-gray-300 dark:border-gray-600 hover:scale-105"
                  }`}
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-md"
                    style={{ backgroundColor: color.value }}
                  />
                  {colorVariant === color.value && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Preview
            </label>
            <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ backgroundColor: colorVariant }}
                />
                <div className="flex-1">
                  <div className="font-semibold dark:text-white">
                    {name || "Category Name"}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    /{slug || "category-slug"}
                  </div>
                </div>
              </div>
              {description && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6 pt-6 border-t dark:border-gray-700">
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete Category
          </button>
          <div className="flex gap-3">
            <Link
              href="/dashboard/categories"
              className="px-4 py-2 rounded border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-200"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={slugTaken || checkingSlug || !name.trim()}
              className={`px-4 py-2 rounded transition-colors ${
                slugTaken || checkingSlug || !name.trim()
                  ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
