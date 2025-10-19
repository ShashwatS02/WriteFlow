"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  EyeIcon,
  PencilSquareIcon,
  TagIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { trpc } from "../../lib/trpcClient";
import { formatDate, formatRelativeTime, cn } from "../../lib/utils";
import CategoryBadge from "../../components/CategoryBadge";
import { CardSkeleton } from "../../components/SkeletonLoader";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const counterAnimation = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "backOut" },
};

export default function DashboardPage() {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } =
    trpc.categories.getStats.useQuery();

  const { data: recentPosts, isLoading: postsLoading } =
    trpc.posts.getAll.useQuery({
      page: 1,
      pageSize: 5,
      sortBy: "newest",
    });

  const { data: categories } = trpc.categories.getAll.useQuery();

  // Calculate additional metrics
  const publishedCount = stats?.publishedPosts || 0;
  const draftCount = (stats?.totalPosts || 0) - publishedCount;
  const publishRate = stats?.totalPosts
    ? Math.round((publishedCount / stats.totalPosts) * 100)
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Welcome back! Here's what's happening with your blog.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon={DocumentTextIcon}
          color="blue"
          trend={{ value: publishRate, isPositive: publishRate > 50 }}
          loading={statsLoading}
        />
        <StatCard
          title="Published"
          value={publishedCount}
          icon={EyeIcon}
          color="green"
          subtitle={`${publishRate}% of total`}
          loading={statsLoading}
        />
        <StatCard
          title="Draft Posts"
          value={draftCount}
          icon={PencilSquareIcon}
          color="orange"
          subtitle={draftCount > 0 ? "Ready to publish" : "All published!"}
          loading={statsLoading}
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={TagIcon}
          color="purple"
          subtitle={`${stats?.totalReadingTime || 0} min read total`}
          loading={statsLoading}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts Widget */}
        <motion.div
          className="lg:col-span-2"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Posts
                </h2>
                <Link
                  href="/dashboard/posts"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  View all posts
                </Link>
              </div>
            </div>

            <div className="p-0">
              {postsLoading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CardSkeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : recentPosts?.posts && recentPosts.posts.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {recentPosts.posts.map((post: any, index: number) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {post.title}
                            </h3>
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                post.isPublished
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              )}
                            >
                              {post.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {formatRelativeTime(post.updatedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {post.readingTime} min read
                            </div>
                            <div className="flex items-center gap-1">
                              <DocumentTextIcon className="h-4 w-4" />
                              {post.wordCount} words
                            </div>
                          </div>

                          {post.categories && post.categories.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              {post.categories
                                .slice(0, 3)
                                .map((category: any) => (
                                  <CategoryBadge
                                    key={category.id}
                                    category={category}
                                    size="sm"
                                  />
                                ))}
                              {post.categories.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  +{post.categories.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </Link>
                          <Link
                            href={`/dashboard/posts/${post.id}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Get started by creating your first blog post.
                  </p>
                  <Link
                    href="/dashboard/posts/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Create First Post
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & Categories */}
        <motion.div
          className="space-y-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                href="/dashboard/posts/new"
                className="flex items-center gap-3 w-full p-3 text-left rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <PencilSquareIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    New Post
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Create a new blog post
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/categories/new"
                className="flex items-center gap-3 w-full p-3 text-left rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    New Category
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Organize your content
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Categories
                </h2>
                <Link
                  href="/dashboard/categories"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
            <div className="p-6">
              {categories && categories.length > 0 ? (
                <div className="space-y-3">
                  {categories
                    .slice(0, 5)
                    .map((category: any, index: number) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <CategoryBadge category={category} size="sm" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {category.publishedPostCount} posts
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <TagIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    No categories created yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "orange" | "purple";
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  loading,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  if (loading) {
    return <CardSkeleton className="h-32" />;
  }

  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6"
      variants={fadeInUp}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-lg", colorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {title}
            </p>
          </div>

          <motion.div
            className="flex items-end gap-2"
            variants={counterAnimation}
          >
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </span>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {trend.value}%
              </div>
            )}
          </motion.div>

          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
