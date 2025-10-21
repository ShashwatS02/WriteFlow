"use client";
import React, { useEffect, useMemo, useState, Suspense, useRef } from "react";
import Pagination from "../../../components/Pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";
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
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Filter,
  Grid3x3,
} from "lucide-react";

// Magnetic Button Component
function MagneticButton({ children, className = "", onClick }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
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

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

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

  // Mouse tracking for gradient mesh
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      <div className="min-h-screen relative overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Ultra-Premium Gradient Mesh Background */}
      <div className="fixed inset-0 -z-10">
        {/* Mouse-tracking gradient */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: `
              radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 50%),
              radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
            `,
          }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0],
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

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* World-Class Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Manage Posts</h1>
                <p className="text-slate-400 mt-1">
                  Create, edit, and manage your blog posts
                </p>
              </div>
            </div>
          </div>

          {/* Magnetic New Post Button */}
          <MagneticButton
            onClick={() => router.push("/dashboard/posts/new")}
            className="frosted rounded-xl px-6 py-3 flex items-center gap-2 border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Post</span>
          </MagneticButton>
        </motion.div>

        {/* Premium Filters Toolbar */}
        <motion.div
          className="frosted rounded-3xl p-6 border border-white/10 spotlight elevated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search with frosted glass */}
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
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
            </div>

            {/* Status Filter */}
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
              className="frosted rounded-xl px-4 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="all" className="bg-slate-800">
                All Status
              </option>
              <option value="published" className="bg-slate-800">
                Published
              </option>
              <option value="draft" className="bg-slate-800">
                Draft
              </option>
            </select>

            {/* Sort Filter */}
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
              className="frosted rounded-xl px-4 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <option value="newest" className="bg-slate-800">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-800">
                Oldest First
              </option>
              <option value="reading" className="bg-slate-800">
                Reading Time
              </option>
              <option value="title" className="bg-slate-800">
                Alphabetical
              </option>
            </select>

            {/* Category Badges */}
            <div className="flex gap-2 flex-wrap">
              {cats.data?.map((c: any) => {
                const selected = selectedCats.includes(c.slug);
                return (
                  <motion.button
                    key={c.id}
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
                    className={`frosted rounded-full px-4 py-1.5 text-sm border transition-all duration-300 ${
                      selected
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-500/50"
                        : "border-white/10 text-slate-300 hover:border-white/20"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {c.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Premium Table */}
        <motion.div
          className="frosted rounded-3xl border border-white/10 spotlight elevated overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <motion.div
              className="p-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">
                  {selectedIds.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <MagneticButton
                  onClick={() =>
                    selectedIds.forEach((id) =>
                      toggle.mutate({ id, publish: true })
                    )
                  }
                  className="frosted rounded-lg px-4 py-2 text-sm border border-emerald-500/50 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 transition-all duration-300"
                >
                  Publish
                </MagneticButton>
                <MagneticButton
                  onClick={() =>
                    selectedIds.forEach((id) =>
                      toggle.mutate({ id, publish: false })
                    )
                  }
                  className="frosted rounded-lg px-4 py-2 text-sm border border-slate-500/50 bg-slate-600/20 text-slate-300 hover:bg-slate-600/30 transition-all duration-300"
                >
                  Unpublish
                </MagneticButton>
                <MagneticButton
                  onClick={() => {
                    if (confirm(`Delete ${selectedIds.length} posts?`)) {
                      selectedIds.forEach((id) => deletePost.mutate(id));
                      toast.success(`${selectedIds.length} posts deleted`);
                    }
                  }}
                  className="frosted rounded-lg px-4 py-2 text-sm border border-red-500/50 bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-all duration-300"
                >
                  Delete
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-left border-b border-white/10">
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={!!allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                      className="h-4 w-4 rounded border-white/20 text-blue-600 focus:ring-blue-600 bg-white/10"
                    />
                  </th>
                  <th className="p-4 text-white font-semibold">Title</th>
                  <th className="p-4 text-white font-semibold">Status</th>
                  <th className="p-4 text-white font-semibold">Categories</th>
                  <th className="p-4 text-white font-semibold">Reading</th>
                  <th className="p-4 text-white font-semibold">Date</th>
                  <th className="p-4 text-right text-white font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.map((p: any, index: number) => (
                  <motion.tr
                    key={p.id}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label={`Select ${p.title}`}
                        className="h-4 w-4 rounded border-white/20 text-blue-600 focus:ring-blue-600 bg-white/10"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {p.slug}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          p.isPublished
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.isPublished ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(p.categories || []).slice(0, 2).map((c: any) => (
                          <span
                            key={c.id}
                            className="frosted rounded-full px-2 py-0.5 text-xs text-slate-300 border border-white/10"
                          >
                            {c.name}
                          </span>
                        ))}
                        {(p.categories?.length || 0) > 2 && (
                          <span className="frosted rounded-full px-2 py-0.5 text-xs text-slate-400 border border-white/10">
                            +{(p.categories?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {p.readingTime ? `${p.readingTime} min` : "—"}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        <MagneticButton
                          onClick={() =>
                            router.push(`/dashboard/posts/${p.id}`)
                          }
                          className="frosted rounded-lg p-2 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => toggle.mutate({ id: p.id })}
                          className={`frosted rounded-lg p-2 border transition-all duration-300 ${
                            p.isPublished
                              ? "border-white/10 text-slate-300 hover:text-white hover:border-white/20"
                              : "border-emerald-500/50 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                          }`}
                        >
                          {p.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </MagneticButton>
                        <MagneticButton
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
                          className="frosted rounded-lg p-2 border border-red-500/50 bg-red-600/20 text-red-300 hover:bg-red-600/30 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </MagneticButton>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Premium Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <motion.div
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50"
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
        </div>
      }
    >
      <AdminPostsPageContent />
    </Suspense>
  );
}
