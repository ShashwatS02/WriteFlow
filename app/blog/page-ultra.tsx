"use client";
import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
  ArrowRight,
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

// Magnetic Button Component (Vercel-style)
function MagneticButton({ children, className = "", href, onClick }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    x.set(distX * 0.15);
    y.set(distY * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const ButtonContent = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{ButtonContent}</Link>;
  }

  return ButtonContent;
}

function BlogPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mouse tracking for gradient mesh
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Ultra-Premium Gradient Mesh Background */}
      <div className="fixed inset-0 -z-10">
        {/* Mouse-tracking gradient */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `
              radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 50%),
              radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
            `,
          }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* World-Class Hero Header */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Floating badge */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-6"
            >
              <motion.div
                className="frosted rounded-full px-6 py-2 flex items-center gap-2 border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">
                  Curated Articles
                </span>
              </motion.div>
            </motion.div>

            {/* Animated gradient title */}
            <motion.h1
              className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-6"
              variants={fadeInUp}
            >
              <span className="block mb-2 text-white">Discover</span>
              <motion.span
                className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  ease: "linear",
                  repeat: Infinity,
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Insights & Stories
              </motion.span>
            </motion.h1>

            <motion.p
              className="mt-6 text-xl leading-8 text-slate-300 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Explore our curated collection of articles on technology, design,
              and productivity
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Ultra-Premium Filters and Search */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            {/* Enhanced Search with frosted glass */}
            <div className="w-full sm:w-96">
              <div className="relative">
                <div className="absolute inset-0 frosted rounded-2xl -z-10" />
                <InputNew
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  leftIcon={<Search className="h-4 w-4 text-indigo-400" />}
                  className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center gap-3">
              {/* View Toggle - Frosted Glass */}
              <div className="hidden sm:flex frosted rounded-xl p-1.5 gap-1 border border-white/10">
                <button
                  onClick={() => setViewType("grid")}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    viewType === "grid"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    viewType === "list"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle - Magnetic Button */}
              <MagneticButton>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="frosted rounded-xl px-6 py-3 flex items-center gap-2 border border-white/10 text-white hover:border-white/20 transition-all duration-300"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-xs font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </MagneticButton>
            </div>
          </div>

          {/* World-Class Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="frosted rounded-3xl p-8 mb-6 border border-white/10 spotlight elevated">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Categories */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          Categories
                        </h3>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {categories?.map((category: any) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategoryIds.includes(
                                category.id
                              )}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="h-4 w-4 rounded border-white/20 text-blue-600 focus:ring-blue-600 bg-white/10"
                            />
                            <CategoryBadge category={category} size="sm" />
                            <span className="ml-auto text-xs text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                              {category.publishedPostCount}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          Sort By
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {SORT_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                          >
                            <input
                              type="radio"
                              name="sort"
                              checked={sortBy === option.value}
                              onChange={() => setSortBy(option.value)}
                              className="h-4 w-4 border-white/20 text-blue-600 focus:ring-blue-600 bg-white/10"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Page Size */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                          <LayoutGrid className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">
                          Display
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <label
                            key={size}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                          >
                            <input
                              type="radio"
                              name="pageSize"
                              checked={pageSize === size}
                              onChange={() => setPageSize(size)}
                              className="h-4 w-4 border-white/20 text-blue-600 focus:ring-blue-600 bg-white/10"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                              {size} posts per page
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <MagneticButton>
                        <button
                          onClick={clearFilters}
                          className="frosted rounded-xl px-6 py-3 flex items-center gap-2 border border-white/10 text-white hover:border-white/20 transition-all duration-300"
                        >
                          <X className="h-4 w-4" />
                          Clear all filters
                        </button>
                      </MagneticButton>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm font-medium text-slate-400">
                Active:
              </span>
              {debouncedSearch && (
                <motion.button
                  onClick={() => setSearch("")}
                  className="frosted rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10 text-sm text-white hover:border-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-3 h-3" />"
                  {truncateText(debouncedSearch, 30)}"
                  <X className="w-3 h-3" />
                </motion.button>
              )}
              {selectedCategoryIds.map((id) => {
                const category = categories?.find((c: any) => c.id === id);
                if (!category) return null;
                return (
                  <motion.button
                    key={id}
                    onClick={() => handleCategoryToggle(id)}
                    className="frosted rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10 text-sm text-white hover:border-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.name}
                    <X className="w-3 h-3" />
                  </motion.button>
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
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {postsData.pagination.total} Articles Found
                  </p>
                  <p className="text-sm text-slate-400">
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

          {/* Posts Grid/List - World-Class Cards */}
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
                    layout
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div
                        className={`
                          frosted rounded-3xl overflow-hidden border border-white/10 
                          spotlight elevated hover-lift group cursor-pointer h-full
                          ${viewType === "list" ? "flex gap-6" : "block"}
                        `}
                      >
                        {/* Cover Image */}
                        {post.coverImageUrl && (
                          <div
                            className={
                              viewType === "list"
                                ? "flex-shrink-0 w-64 overflow-hidden"
                                : "aspect-[16/9] overflow-hidden"
                            }
                          >
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className={`
                                object-cover transition-all duration-700 
                                group-hover:scale-110 group-hover:rotate-1
                                ${viewType === "list" ? "w-full h-full" : "h-full w-full"}
                              `}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div
                          className={
                            viewType === "list" ? "flex-1 min-w-0 p-8" : "p-6"
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

                          {/* Title with gradient hover */}
                          <h3
                            className={`
                            font-bold text-white mb-3
                            group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 
                            group-hover:bg-clip-text group-hover:text-transparent 
                            transition-all duration-300
                            ${viewType === "list" ? "text-2xl" : "text-xl"}
                          `}
                          >
                            {post.title}
                          </h3>

                          {/* Excerpt */}
                          <p
                            className={`
                            text-slate-300 leading-relaxed mb-4
                            ${viewType === "list" ? "text-base" : "text-sm"}
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
                            flex items-center justify-between pt-4 border-t border-white/10
                            text-slate-400
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="frosted rounded-3xl border border-white/10 text-center py-20 px-6">
                <div className="mx-auto mb-6 h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">
                  No articles found
                </h3>
                <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg">
                  {activeFiltersCount > 0
                    ? "We couldn't find any articles matching your filters. Try adjusting your search criteria."
                    : "No published articles are available yet. Check back soon for new content!"}
                </p>
                {activeFiltersCount > 0 && (
                  <MagneticButton>
                    <button
                      onClick={clearFilters}
                      className="frosted rounded-xl px-8 py-4 flex items-center gap-2 border border-white/10 text-white hover:border-white/20 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/50"
                    >
                      <X className="h-5 w-5" />
                      Clear all filters
                    </button>
                  </MagneticButton>
                )}
              </div>
            </motion.div>
          )}

          {/* Pagination - World-Class */}
          {postsData && postsData.pagination.totalPages > 1 && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="frosted rounded-3xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-300">
                    Page <span className="font-bold text-white">{page}</span> of{" "}
                    <span className="font-bold text-white">
                      {postsData.pagination.totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MagneticButton>
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className={`frosted rounded-xl px-4 py-2 text-sm border border-white/10 transition-all duration-300 ${
                          page === 1
                            ? "text-slate-500 cursor-not-allowed"
                            : "text-white hover:border-white/20"
                        }`}
                      >
                        Previous
                      </button>
                    </MagneticButton>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(5, postsData.pagination.totalPages),
                        },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <MagneticButton key={pageNum}>
                              <button
                                onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                  page === pageNum
                                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                                    : "text-slate-300 hover:bg-white/5"
                                }`}
                              >
                                {pageNum}
                              </button>
                            </MagneticButton>
                          );
                        }
                      )}
                      {postsData.pagination.totalPages > 5 && (
                        <>
                          <span className="px-2 text-slate-400">...</span>
                          <MagneticButton>
                            <button
                              onClick={() =>
                                setPage(postsData.pagination.totalPages)
                              }
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                page === postsData.pagination.totalPages
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                                  : "text-slate-300 hover:bg-white/5"
                              }`}
                            >
                              {postsData.pagination.totalPages}
                            </button>
                          </MagneticButton>
                        </>
                      )}
                    </div>

                    <MagneticButton>
                      <button
                        onClick={() =>
                          setPage(
                            Math.min(postsData.pagination.totalPages, page + 1)
                          )
                        }
                        disabled={page === postsData.pagination.totalPages}
                        className={`frosted rounded-xl px-4 py-2 text-sm border border-white/10 transition-all duration-300 ${
                          page === postsData.pagination.totalPages
                            ? "text-slate-500 cursor-not-allowed"
                            : "text-white hover:border-white/20"
                        }`}
                      >
                        Next
                      </button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
}

// Skeleton Card Component
function SkeletonCard() {
  return (
    <div className="frosted rounded-3xl p-6 border border-white/10">
      <div className="animate-pulse">
        <div className="h-48 w-full mb-4 rounded-2xl bg-white/5" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 rounded-full bg-white/5" />
          <div className="h-6 w-20 rounded-full bg-white/5" />
        </div>
        <div className="h-6 w-3/4 mb-3 rounded bg-white/5" />
        <div className="h-4 w-full mb-2 rounded bg-white/5" />
        <div className="h-4 w-5/6 mb-4 rounded bg-white/5" />
        <div className="flex justify-between pt-4 border-t border-white/10">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-4 w-20 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 shadow-lg shadow-blue-500/50"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
            <p className="text-slate-400 text-lg">Loading articles...</p>
          </div>
        </div>
      }
    >
      <BlogPageContent />
    </Suspense>
  );
}
