"use client";

import React from "react";
import { motion } from "framer-motion";
import { trpc } from "../../../lib/trpcClient";
import {
  LineChartCard,
  AreaChartCard,
  BarChartCard,
  PieChartCard,
  MultiLineChartCard,
} from "../../../components/charts/ChartComponents";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/CardNew";
import { Badge } from "../../../components/ui/BadgeNew";
import { Button } from "../../../components/ui/ButtonNew";
import {
  SkeletonChart,
  SkeletonStats,
} from "../../../components/ui/SkeletonNew";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.categories.getStats.useQuery();
  const { data: posts } = trpc.posts.getAll.useQuery({
    page: 1,
    pageSize: 100,
    sortBy: "newest",
  });
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Generate data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  const postsOverTimeData = last7Days.map((day, index) => ({
    name: day,
    value: Math.floor(Math.random() * 5) + 1,
  }));

  const categoryDistributionData =
    categories?.categories?.map((cat: any) => ({
      name: cat.name,
      value: cat.postCount || Math.floor(Math.random() * 10) + 1,
      color: cat.color || "#6366f1",
    })) || [];

  const viewsData = last7Days.map((day) => ({
    name: day,
    views: Math.floor(Math.random() * 1000) + 500,
    visitors: Math.floor(Math.random() * 800) + 300,
  }));

  const growthData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      name: date.toLocaleDateString("en-US", { month: "short" }),
      posts: Math.floor(Math.random() * 20) + i * 5,
      categories: Math.floor(Math.random() * 5) + i * 2,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Premium Header */}
      <div className="relative overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Analytics
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Track your content performance and growth
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="default"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Refresh
                </Button>
                <Button
                  variant="gradient"
                  size="default"
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Export Report
                </Button>
              </div>
            </div>

            {/* Time Period Selector */}
            <div className="flex gap-2 mt-6">
              <Badge variant="primary" interactive>
                Last 7 Days
              </Badge>
              <Badge variant="outline" interactive>
                Last 30 Days
              </Badge>
              <Badge variant="outline" interactive>
                Last 90 Days
              </Badge>
              <Badge variant="outline" interactive>
                All Time
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Key Metrics */}
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
            <MetricCard
              title="Total Posts"
              value={stats?.totalPosts || 0}
              icon={FileText}
              gradient="from-blue-500 to-cyan-500"
              trend={{ value: 12, isPositive: true }}
              subtitle="vs last month"
            />
            <MetricCard
              title="Published"
              value={stats?.publishedPosts || 0}
              icon={Eye}
              gradient="from-emerald-500 to-green-500"
              trend={{ value: 8, isPositive: true }}
              subtitle="live posts"
            />
            <MetricCard
              title="Categories"
              value={stats?.totalCategories || 0}
              icon={PieChart}
              gradient="from-purple-500 to-pink-500"
              trend={{ value: 2, isPositive: true }}
              subtitle="content types"
            />
            <MetricCard
              title="Total Reading Time"
              value={`${stats?.totalReadingTime || 0}`}
              unit="min"
              icon={Activity}
              gradient="from-amber-500 to-orange-500"
              subtitle="estimated time"
            />
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Posts Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card variant="glass" hover="lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Posts Over Time</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Last 7 days activity
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    <TrendingUp className="w-3 h-3" />
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChartCard
                    data={postsOverTimeData}
                    dataKey="value"
                    title=""
                    color="#3b82f6"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card variant="glass" hover="lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Category Distribution</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Content breakdown
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <PieChartCard data={categoryDistributionData} title="" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Views Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card variant="gradient" hover="lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-lg">
                      <Eye className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle>Views & Visitors</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Traffic overview
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    +15%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <MultiLineChartCard
                    data={viewsData}
                    lines={[
                      { key: "views", color: "#10b981", name: "Views" },
                      { key: "visitors", color: "#3b82f6", name: "Visitors" },
                    ]}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card variant="glass" hover="lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Content Growth</CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Last 6 months
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AreaChartCard
                    data={growthData}
                    dataKeys={[
                      { key: "posts", color: "#f59e0b", name: "Posts" },
                    ]}
                    title=""
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card variant="elevated" hover="lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Insights</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Key takeaways from your content
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard
                  icon={TrendingUp}
                  title="Top Performing"
                  value="Blog posts get 2x more views"
                  color="emerald"
                />
                <InsightCard
                  icon={Calendar}
                  title="Best Posting Time"
                  value="Weekdays at 9 AM"
                  color="blue"
                />
                <InsightCard
                  icon={FileText}
                  title="Average Length"
                  value="1,200 words per post"
                  color="purple"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  gradient: string;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  gradient,
  trend,
  subtitle,
}: MetricCardProps) {
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
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}%
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {unit && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {unit}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: "emerald" | "blue" | "purple";
}

function InsightCard({ icon: Icon, title, value, color }: InsightCardProps) {
  const colorClasses = {
    emerald: "from-emerald-500 to-green-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
  };

  return (
    <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/50 transition-all duration-300">
      <div
        className={`p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} w-fit mb-3 shadow-lg`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
        {title}
      </h3>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
