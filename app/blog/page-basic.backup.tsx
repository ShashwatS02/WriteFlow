"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Clock,
  FileText,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { trpc } from "../../lib/trpcClient";
import { formatDate, truncateText } from "../../lib/utils";
import CategoryBadge from "../../components/CategoryBadge";
import { Button as ButtonNew } from "../../components/ui/ButtonNew";
import { Card as CardNew } from "../../components/ui/CardNew";
import { Badge as BadgeNew } from "../../components/ui/BadgeNew";
import { Input as InputNew } from "../../components/ui/InputNew";
import { Skeleton as SkeletonNew } from "../../components/ui/SkeletonNew";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
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

function BlogPageContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <motion.div
            className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-4"
            >
              <BadgeNew variant="gradient" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Featured Articles
              </BadgeNew>
            </motion.div>

            <motion.h1
              className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl mb-6"
              variants={fadeInUp}
            >
              <span className="block mb-2">Discover</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Insights & Stories
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-xl leading-8 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Explore our curated collection of articles on technology, design,
              and productivity
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Premium Filters and Search */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            {/* Enhanced Search */}
            <div className="w-full sm:w-96">
              <InputNew
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                leftIcon={<Search className="h-4 w-4" />}
                variant="filled"
                className="w-full"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center gap-3">
              {/* View Toggle - Premium Glass Style */}
              <div className="hidden sm:flex glass rounded-xl p-1.5 gap-1">
                <ButtonNew
                  variant={viewType === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("grid")}
                  className="!h-9 !w-9 !p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ButtonNew>
                <ButtonNew
                  variant={viewType === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("list")}
                  className="!h-9 !w-9 !p-0"
                >
                  <List className="h-4 w-4" />
                </ButtonNew>
              </div>

              {/* Filter Toggle - Premium Button */}
              <ButtonNew
                variant="glass"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <BadgeNew variant="destructive" className="ml-2">
                    {activeFiltersCount}
                  </BadgeNew>
                )}
              </ButtonNew>
            </div>
          </div>

          {/* Premium Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <CardNew variant="glass" className="p-6 mb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Categories
                      </h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {categories?.map((category: any) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(
                                category.id
                              )}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <CategoryBadge category={category} size="sm" />
                            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {category.publishedPostCount}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        Sort By
                      </h3>
                      <div className="space-y-2">
                        {SORT_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name="sort"
                              checked={sortBy === option.value}
                              onChange={() => setSortBy(option.value)}
                              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Page Size */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                          <LayoutGrid className="h-4 w-4 text-white" />
                        </div>
                        Display
                      </h3>
                      <div className="space-y-2">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <label
                            key={size}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                          >
                            <input
                              type="radio"
                              name="pageSize"
                              checked={pageSize === size}
                              onChange={() => setPageSize(size)}
                              className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-600"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {size} posts per page
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <ButtonNew
                        variant="outline"
                        onClick={clearFilters}
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Clear all filters
                      </ButtonNew>
                    </div>
                  )}
                </CardNew>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display - Premium Pills */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active:
              </span>
              {debouncedSearch && (
                <BadgeNew
                  variant="primary"
                  onRemove={() => setSearch("")}
                  interactive
                >
                  <Search className="w-3 h-3 mr-1" />"
                  {truncateText(debouncedSearch, 30)}"
                </BadgeNew>
              )}
              {selectedCategoryIds.map((id) => {
                const category = categories?.find((c: any) => c.id === id);
                if (!category) return null;
                return (
                  <BadgeNew
                    key={id}
                    variant="secondary"
                    onRemove={() => handleCategoryToggle(id)}
                    interactive
                  >
                    {category.name}
                  </BadgeNew>
                );
              })}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {/* Results header - Premium Stats */}
          {postsData && (
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {postsData.pagination.total} Articles Found
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Showing {postsData.posts.length} on page {page}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State - Premium Skeletons */}
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
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={fadeInUp}>
                  <SkeletonCard />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Posts Grid/List - Premium Cards */}
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
                {postsData.posts.map((post: any, index: number) => (
                  <motion.article key={post.id} variants={fadeInUp} layout>
                    <Link href={`/blog/${post.slug}`}>
                      <CardNew
                        variant="glass"
                        hover="lift"
                        className={`
                          group cursor-pointer h-full overflow-hidden
                          ${viewType === "list" ? "flex gap-6" : "block"}
                        `}
                      >
                        {/* Cover Image */}
                        {post.coverImageUrl && (
                          <div
                            className={
                              viewType === "list"
                                ? "flex-shrink-0 w-48"
                                : "aspect-[16/9] overflow-hidden"
                            }
                          >
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className={`
                                object-cover transition-transform duration-500 group-hover:scale-110
                                ${viewType === "list" ? "w-full h-full rounded-lg" : "h-full w-full"}
                              `}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div
                          className={
                            viewType === "list" ? "flex-1 min-w-0 p-6" : "p-6"
                          }
                        >
                          {/* Categories */}
                          <div className="flex items-center gap-2 mb-4">
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
                            font-bold text-slate-900 dark:text-white 
                            group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 
                            group-hover:bg-clip-text group-hover:text-transparent 
                            transition-all duration-300
                            ${viewType === "list" ? "text-2xl mb-3" : "text-xl mb-3"}
                          `}
                          >
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p
                            className={`
                            text-slate-600 dark:text-slate-300 leading-relaxed mb-4
                            ${viewType === "list" ? "text-base" : "text-sm"}
                          `}
                          >
                            {truncateText(
                              post.excerpt || "",
                              viewType === "list" ? 200 : 120
                            )}
                          </p>

                          {/* Meta - Premium Design */}
                          <div
                            className={`
                            flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700
                            text-slate-500 dark:text-slate-400
                            ${viewType === "list" ? "text-sm" : "text-xs"}
                          `}
                          >
                            <time
                              dateTime={post.createdAt.toString()}
                              className="flex items-center gap-1.5"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(post.createdAt)}
                            </time>
                            <span className="flex items-center gap-1.5 font-medium">
                              {post.readingTime} min read
                            </span>
                          </div>
                        </div>
                      </CardNew>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State - Premium Design */}
          {postsData && postsData.posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardNew variant="glass" className="text-center py-16 px-6">
                <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                  <Search className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  No articles found
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                  {activeFiltersCount > 0
                    ? "We couldn't find any articles matching your filters. Try adjusting your search criteria."
                    : "No published articles are available yet. Check back soon for new content!"}
                </p>
                {activeFiltersCount > 0 && (
                  <ButtonNew variant="gradient" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear all filters
                  </ButtonNew>
                )}
              </CardNew>
            </motion.div>
          )}

          {/* Pagination - Premium Design */}
          {postsData && postsData.pagination.totalPages > 1 && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardNew variant="glass" className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {postsData.pagination.totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ButtonNew
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </ButtonNew>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(5, postsData.pagination.totalPages),
                        },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <ButtonNew
                              key={pageNum}
                              variant={page === pageNum ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className="!w-9 !h-9 !p-0"
                            >
                              {pageNum}
                            </ButtonNew>
                          );
                        }
                      )}
                      {postsData.pagination.totalPages > 5 && (
                        <>
                          <span className="px-2 text-slate-400">...</span>
                          <ButtonNew
                            variant={
                              page === postsData.pagination.totalPages
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() =>
                              setPage(postsData.pagination.totalPages)
                            }
                            className="!w-9 !h-9 !p-0"
                          >
                            {postsData.pagination.totalPages}
                          </ButtonNew>
                        </>
                      )}
                    </div>

                    <ButtonNew
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage(
                          Math.min(postsData.pagination.totalPages, page + 1)
                        )
                      }
                      disabled={page === postsData.pagination.totalPages}
                    >
                      Next
                    </ButtonNew>
                  </div>
                </div>
              </CardNew>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <CardNew variant="glass" className="p-6">
      <SkeletonNew className="h-48 w-full mb-4 rounded-lg" />
      <div className="flex gap-2 mb-4">
        <SkeletonNew className="h-6 w-20 rounded-full" />
        <SkeletonNew className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonNew className="h-6 w-3/4 mb-3" />
      <SkeletonNew className="h-4 w-full mb-2" />
      <SkeletonNew className="h-4 w-5/6 mb-4" />
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <SkeletonNew className="h-4 w-24" />
        <SkeletonNew className="h-4 w-20" />
      </div>
    </CardNew>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-600 dark:text-slate-400">
              Loading articles...
            </p>
          </div>
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
