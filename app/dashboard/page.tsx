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
  FireIcon,
  ChartBarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { trpc } from "../../lib/trpcClient";
import { formatDate, formatRelativeTime, cn } from "../../lib/utils";
import CategoryBadge from "../../components/CategoryBadge";
import { CardSkeleton } from "../../components/SkeletonLoader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
} from "../../components/animations";

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
    <div className="p-8 max-w-[1800px] mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              Welcome back! Here's what's happening with your blog.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => (window.location.href = "/dashboard/posts")}
              icon={<DocumentTextIcon className="w-5 h-5" />}
            >
              Posts
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => (window.location.href = "/dashboard/posts/new")}
              icon={<PencilSquareIcon className="w-5 h-5" />}
            >
              New Post
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <StaggerContainer
        staggerDelay={0.08}
        delayChildren={0.2}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StaggerItem variant="scaleIn">
          <EnhancedStatCard
            title="Total Posts"
            value={stats?.totalPosts || 0}
            icon={DocumentTextIcon}
            color="blue"
            trend={{ value: publishRate, isPositive: publishRate > 50 }}
            loading={statsLoading}
            description="All time posts"
          />
        </StaggerItem>
        <StaggerItem variant="scaleIn">
          <EnhancedStatCard
            title="Published"
            value={publishedCount}
            icon={EyeIcon}
            color="green"
            subtitle={`${publishRate}% of total`}
            loading={statsLoading}
            description="Live on your blog"
            badge={{ text: "Live", variant: "success" }}
          />
        </StaggerItem>
        <StaggerItem variant="scaleIn">
          <EnhancedStatCard
            title="Draft Posts"
            value={draftCount}
            icon={PencilSquareIcon}
            color="orange"
            subtitle={draftCount > 0 ? "Ready to publish" : "All published!"}
            loading={statsLoading}
            description="Work in progress"
            badge={
              draftCount > 0
                ? { text: `${draftCount} pending`, variant: "warning" }
                : undefined
            }
          />
        </StaggerItem>
        <StaggerItem variant="scaleIn">
          <EnhancedStatCard
            title="Categories"
            value={stats?.totalCategories || 0}
            icon={TagIcon}
            color="purple"
            subtitle={`${stats?.totalReadingTime || 0} min read total`}
            loading={statsLoading}
            description="Content organization"
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts Widget */}
        <ScrollReveal
          variant="fadeInLeft"
          delay={0.3}
          className="lg:col-span-2"
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                    <FireIcon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>Recent Posts</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/dashboard/posts")}
                >
                  View all
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
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
                            <Badge
                              variant={post.isPublished ? "success" : "warning"}
                              size="sm"
                              dot={post.isPublished}
                            >
                              {post.isPublished ? "Published" : "Draft"}
                            </Badge>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(`/blog/${post.slug}`, "_blank")
                            }
                            icon={<EyeIcon className="h-4 w-4" />}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/dashboard/posts/${post.id}`)
                            }
                            icon={<PencilSquareIcon className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
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
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() =>
                      (window.location.href = "/dashboard/posts/new")
                    }
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                  >
                    Create First Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Quick Actions & Categories */}
        <ScrollReveal variant="fadeInRight" delay={0.4} className="space-y-8">
          {/* Quick Actions */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Categories Overview */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                    <TagIcon className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>Categories</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    (window.location.href = "/dashboard/categories")
                  }
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

interface EnhancedStatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "orange" | "purple";
  subtitle?: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant: "primary" | "success" | "warning" | "danger";
  };
  loading?: boolean;
}

function EnhancedStatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  description,
  trend,
  badge,
  loading,
}: EnhancedStatCardProps) {
  const colorClasses = {
    blue: "from-blue-600 to-indigo-600",
    green: "from-green-600 to-emerald-600",
    orange: "from-orange-600 to-amber-600",
    purple: "from-purple-600 to-pink-600",
  };

  const iconBgClasses = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-500",
    green: "bg-gradient-to-br from-green-500 to-emerald-500",
    orange: "bg-gradient-to-br from-orange-500 to-amber-500",
    purple: "bg-gradient-to-br from-purple-500 to-pink-500",
  };

  if (loading) {
    return <CardSkeleton className="h-40" />;
  }

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card variant="elevated" hover className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn("p-3 rounded-xl shadow-lg", iconBgClasses[color])}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            {badge && (
              <Badge variant={badge.variant} size="sm" dot>
                {badge.text}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>

            <motion.div
              className="flex items-end gap-3"
              variants={counterAnimation}
            >
              <span
                className={cn(
                  "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  colorClasses[color]
                )}
              >
                {value.toLocaleString()}
              </span>
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold pb-1",
                    trend.isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  {trend.value}%
                </div>
              )}
            </motion.div>

            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
