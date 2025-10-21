"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Eye,
  PenSquare,
  Tag,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  BarChart3,
  Layers,
} from "lucide-react";
import { trpc } from "../../lib/trpcClient";
import { formatDate, formatRelativeTime } from "../../lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/CardNew";
import { Button } from "../../components/ui/ButtonNew";
import { Badge } from "../../components/ui/BadgeNew";
import { SkeletonStats, SkeletonCard } from "../../components/ui/SkeletonNew";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.categories.getStats.useQuery();

  const { data: recentPosts, isLoading: postsLoading } =
    trpc.posts.getAll.useQuery({
      page: 1,
      pageSize: 5,
      sortBy: "newest",
    });

  const { data: categories } = trpc.categories.getAll.useQuery();

  const publishedCount = stats?.publishedPosts || 0;
  const draftCount = (stats?.totalPosts || 0) - publishedCount;
  const publishRate = stats?.totalPosts
    ? Math.round((publishedCount / stats.totalPosts) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header with gradient overlay */}
      <div className="relative overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/dashboard/posts/new">
                <Button
                  variant="gradient"
                  size="lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Create Post
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button
                  variant="glass"
                  size="lg"
                  leftIcon={<BarChart3 className="w-5 h-5" />}
                >
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/categories">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<Layers className="w-5 h-5" />}
                >
                  Categories
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Stats Grid */}
        {statsLoading ? (
          <SkeletonStats />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard
              title="Total Posts"
              value={stats?.totalPosts || 0}
              icon={FileText}
              gradient="from-blue-500 to-cyan-500"
              trend={publishRate > 50 ? "up" : "neutral"}
              trendValue={`${publishRate}% published`}
            />
            <StatCard
              title="Published"
              value={publishedCount}
              icon={Eye}
              gradient="from-emerald-500 to-green-500"
              badge="Live"
              badgeVariant="success"
            />
            <StatCard
              title="Drafts"
              value={draftCount}
              icon={PenSquare}
              gradient="from-amber-500 to-orange-500"
              badge={draftCount > 0 ? "In Progress" : "All Done"}
              badgeVariant={draftCount > 0 ? "warning" : "success"}
            />
            <StatCard
              title="Categories"
              value={stats?.totalCategories || 0}
              icon={Tag}
              gradient="from-purple-500 to-pink-500"
              subtitle={`${stats?.totalReadingTime || 0} min read total`}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card variant="glass" hover="lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle>Recent Posts</CardTitle>
                  </div>
                  <Link href="/dashboard/posts">
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : recentPosts?.posts && recentPosts.posts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.posts.map((post: any, index: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-white/50 dark:bg-slate-900/50 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {post.title}
                              </h3>
                              <Badge
                                variant={
                                  post.isPublished ? "success" : "warning"
                                }
                                size="sm"
                              >
                                {post.isPublished ? "Live" : "Draft"}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatRelativeTime(post.updatedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {post.readingTime} min
                              </span>
                            </div>

                            {post.excerpt && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>

                          <Link href={`/dashboard/posts/${post.id}`}>
                            <Button variant="ghost" size="icon-sm">
                              <PenSquare className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No posts yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Start creating your first blog post
                    </p>
                    <Link href="/dashboard/posts/new">
                      <Button
                        variant="gradient"
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Create First Post
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Categories */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <Card variant="gradient" hover="lift">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/posts/new">
                    <button className="w-full p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md group-hover:shadow-lg transition-shadow">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            New Post
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Create a blog post
                          </div>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <Link href="/dashboard/categories/new">
                    <button className="w-full p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md group-hover:shadow-lg transition-shadow">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            New Category
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Organize content
                          </div>
                        </div>
                      </div>
                    </button>
                  </Link>

                  <Link href="/dashboard/analytics">
                    <button className="w-full p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 text-left group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-md group-hover:shadow-lg transition-shadow">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            View Analytics
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Check your stats
                          </div>
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card variant="glass" hover="lift">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categories?.categories && categories.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.categories.slice(0, 6).map((category: any) => (
                      <Badge
                        key={category.id}
                        variant="primary"
                        interactive
                        onClick={() =>
                          (window.location.href = `/dashboard/categories/${category.id}`)
                        }
                      >
                        {category.name}
                      </Badge>
                    ))}
                    {categories.categories.length > 6 && (
                      <Badge variant="outline">
                        +{categories.categories.length - 6} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No categories yet. Create one to organize your posts!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  badge?: string;
  badgeVariant?: "success" | "warning" | "destructive";
  subtitle?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  trendValue,
  badge,
  badgeVariant,
  subtitle,
}: StatCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <Card variant="glass" hover="lift" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-3xl`}
          />
        </div>

        <CardContent className="relative">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            {badge && (
              <Badge variant={badgeVariant || "default"} size="sm">
                {badge}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {value.toLocaleString()}
            </p>
            {(trendValue || subtitle) && (
              <div className="flex items-center gap-1.5 text-xs">
                {trend === "up" && (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {trend === "down" && (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span
                  className={
                    trend === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : trend === "down"
                        ? "text-red-600 dark:text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {trendValue || subtitle}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
