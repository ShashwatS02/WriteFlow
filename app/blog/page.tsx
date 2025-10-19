"use client";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Bars3BottomLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { trpc } from "../../lib/trpcClient";
import { formatDate, truncateText } from "../../lib/utils";
import CategoryBadge from "../../components/CategoryBadge";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import SkeletonLoader from "../../components/SkeletonLoader";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Alphabetical" },
  { value: "readingTime", label: "Reading Time" },
] as const;

// Page size options
const PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

// Layout view types
type ViewType = "grid" | "list";

export default function BlogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state management
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    searchParams.get("categories")?.split(",").map(Number).filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title" | "readingTime"
  >((searchParams.get("sort") as any) || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 12
  );
  const [viewType, setViewType] = useState<ViewType>(
    (searchParams.get("view") as ViewType) || "grid"
  );

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategoryIds.length > 0)
      params.set("categories", selectedCategoryIds.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (page !== 1) params.set("page", page.toString());
    if (pageSize !== 12) params.set("pageSize", pageSize.toString());
    if (viewType !== "grid") params.set("view", viewType);

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    selectedCategoryIds,
    sortBy,
    page,
    pageSize,
    viewType,
    pathname,
    router,
  ]);

  // Reset page when filters change
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [debouncedSearch, selectedCategoryIds, sortBy]);

  // Fetch data
  const { data: postsData, isLoading: postsLoading } =
    trpc.posts.getAll.useQuery({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      categoryIds:
        selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      isPublished: true,
      sortBy,
    });

  const { data: categories } = trpc.categories.getAll.useQuery();

  // Computed values
  const activeFiltersCount = useMemo(() => {
    return (debouncedSearch ? 1 : 0) + selectedCategoryIds.length;
  }, [debouncedSearch, selectedCategoryIds]);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategoryIds([]);
    setSortBy("newest");
    setPageSize(12);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Blog
            </motion.h1>
            <motion.p
              className="mt-4 text-lg text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Discover insights on technology, design, and productivity
            </motion.p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            {/* Search */}
            <div className="w-full sm:w-96">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search posts..."
                className="w-full"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="hidden sm:flex rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-1">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewType === "grid"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-label="Grid view"
                >
                  <ViewColumnsIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 rounded transition-colors ${
                    viewType === "list"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-label="List view"
                >
                  <Bars3BottomLeftIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Categories
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories?.map((category: any) => (
                          <label
                            key={category.id}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(
                                category.id
                              )}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <CategoryBadge category={category} size="sm" />
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              ({category.publishedPostCount})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Sort By
                      </h3>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Page Size */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Posts per page
                      </h3>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                      >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size} posts
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Active filters:
              </span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">
                  "{debouncedSearch}"
                  <button
                    onClick={() => setSearch("")}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategoryIds.map((id) => {
                const category = categories?.find((c: any) => c.id === id);
                if (!category) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs"
                  >
                    {category.name}
                    <button
                      onClick={() => handleCategoryToggle(id)}
                      className="hover:bg-gray-200 dark:hover:bg-slate-600 rounded p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {/* Results header */}
          {postsData && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Showing {postsData.posts.length} of {postsData.pagination.total}{" "}
                posts
                {debouncedSearch && ` for "${debouncedSearch}"`}
              </p>
            </div>
          )}

          {/* Loading State */}
          {postsLoading && (
            <motion.div
              className={
                viewType === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {Array.from({ length: pageSize }).map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <SkeletonLoader
                    type={viewType === "grid" ? "card" : "list"}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Posts Grid/List */}
          {postsData && postsData.posts.length > 0 && (
            <motion.div
              className={
                viewType === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="wait">
                {postsData.posts.map((post: any) => (
                  <motion.article
                    key={post.id}
                    variants={fadeInUp}
                    whileHover={{ y: -4 }}
                    className="group"
                    layout
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div
                        className={`
                        relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 
                        transition-all duration-200 group-hover:shadow-lg group-hover:ring-gray-900/10 dark:group-hover:ring-slate-600
                        ${viewType === "list" ? "flex gap-6 p-6" : "block"}
                      `}
                      >
                        {/* Cover Image */}
                        {post.coverImageUrl && (
                          <div
                            className={
                              viewType === "list"
                                ? "flex-shrink-0 w-48"
                                : "aspect-[16/9] overflow-hidden rounded-t-lg"
                            }
                          >
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className={`
                                object-cover transition-transform duration-200 group-hover:scale-105
                                ${viewType === "list" ? "w-full h-32 rounded-lg" : "h-full w-full"}
                              `}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div
                          className={
                            viewType === "list" ? "flex-1 min-w-0" : "p-6"
                          }
                        >
                          {/* Categories */}
                          <div className="flex items-center gap-2 mb-3">
                            {post.categories
                              ?.slice(0, 2)
                              .map((category: any) => (
                                <CategoryBadge
                                  key={category.id}
                                  category={category}
                                  size="sm"
                                />
                              ))}
                          </div>

                          {/* Title */}
                          <h3
                            className={`
                            font-semibold text-gray-900 dark:text-white 
                            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                            ${viewType === "list" ? "text-xl mb-2" : "text-lg mb-3"}
                          `}
                          >
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p
                            className={`
                            text-gray-600 dark:text-gray-300 leading-relaxed
                            ${viewType === "list" ? "text-base mb-4" : "text-sm mb-4"}
                          `}
                          >
                            {truncateText(
                              post.excerpt || "",
                              viewType === "list" ? 200 : 120
                            )}
                          </p>

                          {/* Meta */}
                          <div
                            className={`
                            flex items-center justify-between text-gray-500 dark:text-gray-400
                            ${viewType === "list" ? "text-sm" : "text-xs"}
                          `}
                          >
                            <time dateTime={post.createdAt.toString()}>
                              {formatDate(post.createdAt)}
                            </time>
                            <span>
                              {post.readingTime} min read • {post.wordCount}{" "}
                              words
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {postsData && postsData.posts.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {activeFiltersCount > 0
                  ? "Try adjusting your filters or search terms"
                  : "No published posts available yet"}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}

          {/* Pagination */}
          {postsData && postsData.pagination.totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={page}
                totalPages={postsData.pagination.totalPages}
                pageSize={pageSize}
                total={postsData.pagination.total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Note: metadata must not be exported from a client component ("use client").
// If you want page metadata, move this export to a server component or layout.
