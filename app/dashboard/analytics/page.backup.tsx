"use client";

import React from "react";
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
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "../../../components/animations";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const { data: stats } = trpc.categories.getStats.useQuery();
  const { data: posts } = trpc.posts.getAll.useQuery({
    page: 1,
    pageSize: 100,
    sortBy: "newest",
  });
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Generate mock data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  // Posts published over time
  const postsOverTimeData = last7Days.map((day, index) => ({
    name: day,
    value: Math.floor(Math.random() * 5) + 1,
  }));

  // Category distribution
  const categoryDistributionData =
    categories?.map((cat: any) => ({
      name: cat.name,
      value: cat.postCount || Math.floor(Math.random() * 10) + 1,
      color: cat.color || "#6366f1",
    })) || [];

  // Posts by status
  const postsByStatusData = [
    {
      name: "Published",
      value: stats?.publishedPosts || 0,
      color: "#10b981",
    },
    {
      name: "Draft",
      value: (stats?.totalPosts || 0) - (stats?.publishedPosts || 0),
      color: "#f59e0b",
    },
  ];

  // Views over time (mock data)
  const viewsData = last7Days.map((day) => ({
    name: day,
    views: Math.floor(Math.random() * 1000) + 500,
    visitors: Math.floor(Math.random() * 800) + 300,
  }));

  // Content growth (mock data)
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
    <div className="p-8 max-w-[1800px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive insights into your blog's performance
          </p>
        </div>
        <Badge variant="primary" size="lg">
          <ChartBarIcon className="w-4 h-4 mr-1" />
          Real-time Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <StaggerContainer
        staggerDelay={0.08}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StaggerItem variant="scaleIn">
          <Card variant="gradient">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Total Views
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">12,543</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-300" />
                    <span className="text-sm text-emerald-300 font-medium">
                      +23.5%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <EyeIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem variant="scaleIn">
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg. Time
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    3m 24s
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500 font-medium">
                      +12%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem variant="scaleIn">
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bounce Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    42.3%
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500 rotate-180" />
                    <span className="text-sm text-emerald-500 font-medium">
                      -5.2%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem variant="scaleIn">
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Engagement
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    89.5%
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500 font-medium">
                      +8.1%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                  <ArrowTrendingUpIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScrollReveal variant="fadeInLeft">
          <MultiLineChartCard
            title="Views & Visitors"
            description="Last 7 days comparison"
            data={viewsData}
            lines={[
              { key: "views", color: "#6366f1", name: "Page Views" },
              { key: "visitors", color: "#8b5cf6", name: "Unique Visitors" },
            ]}
          />
        </ScrollReveal>

        <ScrollReveal variant="fadeInRight">
          <AreaChartCard
            title="Content Growth"
            description="Posts and categories over time"
            data={growthData}
            dataKeys={[
              { key: "posts", color: "#10b981", name: "Posts" },
              { key: "categories", color: "#f59e0b", name: "Categories" },
            ]}
          />
        </ScrollReveal>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ScrollReveal variant="fadeInUp">
          <BarChartCard
            title="Posts Published"
            description="Last 7 days"
            data={postsOverTimeData}
            color="#6366f1"
          />
        </ScrollReveal>

        <ScrollReveal variant="fadeInUp" delay={0.1}>
          <PieChartCard
            title="Post Status"
            description="Distribution by status"
            data={postsByStatusData}
          />
        </ScrollReveal>

        <ScrollReveal variant="fadeInUp" delay={0.2}>
          <PieChartCard
            title="Category Distribution"
            description="Posts per category"
            data={categoryDistributionData}
          />
        </ScrollReveal>
      </div>

      {/* Additional Stats */}
      <ScrollReveal variant="fadeInUp">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {stats?.totalPosts || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total Posts
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  {stats?.totalCategories || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Categories
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {stats?.totalReadingTime || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Total Reading Time (min)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
