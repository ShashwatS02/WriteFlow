"use client";
import React, { useState, useEffect } from "react";
import { useCreateCategory } from "../../../../lib/hooks/usePosts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

export default function NewCategoryPage() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState("");
  const [colorVariant, setColorVariant] = useState(COLORS[6].value); // Default to Blue
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Auto-generate slug from name
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
        // Check if slug exists in categories
        const categories = await trpc.categories.getAll.query();
        const exists = categories.some((c: any) => c.slug === slug);
        setSlugTaken(exists);
      } catch {
        setSlugTaken(false);
      } finally {
        setCheckingSlug(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [slug]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (slugTaken) {
      toast.error("Slug already exists. Please choose a different one.");
      return;
    }

    const toastId = toast.loading("Creating category...");

    createCategory.mutate(
      {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        colorVariant,
      },
      {
        onSuccess: () => {
          toast.success("Category created successfully!", { id: toastId });
          router.push("/dashboard/categories");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to create category", {
            id: toastId,
          });
        },
      }
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="glass" className="backdrop-blur-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              New Category
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new category to organize your posts
            </p>
          </div>
          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push("/dashboard/categories")}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            }
          >
            Back
          </Button>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Name */}
            <Input
              label="Category Name"
              placeholder="e.g., Technology, Tutorials, News..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
                  {autoSlug ? "Manual" : "Auto"}
                </button>
              </div>
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="auto-generated-from-name"
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
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium mb-3 dark:text-gray-200">
                Preview
              </label>
              <Card variant="glass" hover>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg shadow-md ring-2 ring-white dark:ring-gray-800"
                      style={{ backgroundColor: colorVariant }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg dark:text-white">
                        {name || "Category Name"}
                      </div>
                      <Badge variant="outline" size="sm">
                        /{slug || "category-slug"}
                      </Badge>
                    </div>
                  </div>
                  {description && (
                    <CardDescription className="mt-3">
                      {description}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push("/dashboard/categories")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={slugTaken || checkingSlug || !name.trim()}
              loading={createCategory.isPending}
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            >
              Create Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
