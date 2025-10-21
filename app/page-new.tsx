"use client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  Tag,
  Moon,
  ArrowRight,
  PenSquare,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { trpc } from "../lib/trpcClient";
import { formatDate, truncateText } from "../lib/utils";
import CategoryBadge from "../components/CategoryBadge";
import { useEffect, useState } from "react";
import { Button as ButtonNew } from "../components/ui/ButtonNew";
import { Card as CardNew } from "../components/ui/CardNew";
import { Badge as BadgeNew } from "../components/ui/BadgeNew";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Animated counter component
function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    setHasAnimated(true);
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasAnimated]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  // Fetch featured posts and stats
  const { data: featuredPosts } = trpc.posts.getAll.useQuery({
    page: 1,
    pageSize: 3,
    isPublished: true,
    sortBy: "newest",
  });

  const { data: stats } = trpc.categories.getStats.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section - Premium Design */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:px-6 sm:pt-32 sm:pb-32 lg:px-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
          <motion.div
            className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
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
          <motion.div
            className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1,
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Premium badge */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-6"
            >
              <BadgeNew variant="gradient" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Blogging Platform
              </BadgeNew>
            </motion.div>

            <motion.h1
              className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl"
              variants={fadeInUp}
            >
              <span className="block text-slate-900 dark:text-white mb-2">
                Effortless Content
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                For Creators
              </span>
            </motion.h1>

            <motion.p
              className="mt-8 max-w-3xl mx-auto text-xl leading-8 text-slate-600 dark:text-slate-300"
              variants={fadeInUp}
            >
              WriteFlow is a production-grade blogging platform designed for
              creators who value{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                simplicity
              </span>
              ,{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                performance
              </span>
              , and{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                beautiful design
              </span>
              . Write in Markdown, organize with categories, and publish with
              confidence.
            </motion.p>

            <motion.div
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <Link href="/blog">
                <ButtonNew
                  variant="gradient"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Explore Blog
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonNew>
              </Link>

              <Link href="/dashboard">
                <ButtonNew
                  variant="glass"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <PenSquare className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </ButtonNew>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Glass Morphism Cards */}
      <section className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Everything you need to create
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Powerful features designed to make content creation a joy, not a
              chore.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-4">
              {/* Feature 1 */}
              <motion.div variants={scaleIn}>
                <CardNew variant="glass" hover="lift" className="h-full">
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Markdown Support
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Write with the power and simplicity of Markdown.
                      GitHub-flavored syntax, code highlighting, and live
                      preview.
                    </p>
                  </div>
                </CardNew>
              </motion.div>

              {/* Feature 2 */}
              <motion.div variants={scaleIn}>
                <CardNew variant="glass" hover="lift" className="h-full">
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
                      <Tag className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Smart Categorization
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Organize your content with flexible categories.
                      Color-coded badges and intelligent filtering.
                    </p>
                  </div>
                </CardNew>
              </motion.div>

              {/* Feature 3 */}
              <motion.div variants={scaleIn}>
                <CardNew variant="glass" hover="lift" className="h-full">
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/50">
                      <Search className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Powerful Search
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Full-text search across titles, content, and excerpts.
                      Filter by categories and sort by relevance.
                    </p>
                  </div>
                </CardNew>
              </motion.div>

              {/* Feature 4 */}
              <motion.div variants={scaleIn}>
                <CardNew variant="glass" hover="lift" className="h-full">
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/50">
                      <Moon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Dark Mode
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Beautiful light and dark themes with smooth transitions.
                      Respects system preferences automatically.
                    </p>
                  </div>
                </CardNew>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts?.posts && featuredPosts.posts.length > 0 && (
        <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/50 dark:to-transparent">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <BadgeNew variant="primary" size="lg" className="mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Latest Content
              </BadgeNew>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Latest Posts
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Discover the newest content from our platform
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {featuredPosts.posts.map((post: any) => (
                <motion.div key={post.id} variants={scaleIn}>
                  <Link href={`/blog/${post.slug}`}>
                    <CardNew
                      variant="glass"
                      hover="lift"
                      className="h-full group cursor-pointer overflow-hidden"
                    >
                      {post.coverImageUrl && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          {post.categories?.slice(0, 2).map((category: any) => (
                            <CategoryBadge
                              key={category.id}
                              category={category}
                              size="sm"
                            />
                          ))}
                        </div>

                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all mb-3">
                          {post.title}
                        </h3>

                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 mb-4">
                          {truncateText(post.excerpt || "", 120)}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <time
                            dateTime={post.createdAt.toString()}
                            className="flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {formatDate(post.createdAt)}
                          </time>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {post.readingTime} min
                          </span>
                        </div>
                      </div>
                    </CardNew>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-16 text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <Link href="/blog">
                <ButtonNew variant="gradient" size="lg">
                  View All Posts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonNew>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Platform Stats Section - Premium Glass Cards */}
      {stats && (
        <section className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Platform at a Glance
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Growing collection of quality content
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {/* Stat 1 */}
              <motion.div variants={scaleIn}>
                <CardNew
                  variant="glass"
                  hover="glow"
                  className="text-center p-8"
                >
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/50">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    <AnimatedCounter end={stats.publishedPosts} />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Posts Published
                  </div>
                </CardNew>
              </motion.div>

              {/* Stat 2 */}
              <motion.div variants={scaleIn}>
                <CardNew
                  variant="glass"
                  hover="glow"
                  className="text-center p-8"
                >
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50">
                    <Tag className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    <AnimatedCounter end={stats.totalCategories} />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Categories Available
                  </div>
                </CardNew>
              </motion.div>

              {/* Stat 3 */}
              <motion.div variants={scaleIn}>
                <CardNew
                  variant="glass"
                  hover="glow"
                  className="text-center p-8"
                >
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/50">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    <AnimatedCounter end={stats.totalReadingTime} suffix="+" />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Hours of Reading
                  </div>
                </CardNew>
              </motion.div>

              {/* Stat 4 */}
              <motion.div variants={scaleIn}>
                <CardNew
                  variant="glass"
                  hover="glow"
                  className="text-center p-8"
                >
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/50">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    <AnimatedCounter end={100} suffix="%" />
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    TypeScript Coverage
                  </div>
                </CardNew>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Additional Features Grid */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/50 dark:to-transparent">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Built for Performance
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Modern technology stack for blazing fast experiences
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={scaleIn}>
              <CardNew variant="glass" hover="lift" className="p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Lightning Fast
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Built with Next.js 15 for optimal performance and SEO
                </p>
              </CardNew>
            </motion.div>

            <motion.div variants={scaleIn}>
              <CardNew variant="glass" hover="lift" className="p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Type-Safe
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  100% TypeScript with tRPC for end-to-end type safety
                </p>
              </CardNew>
            </motion.div>

            <motion.div variants={scaleIn}>
              <CardNew variant="glass" hover="lift" className="p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Production Ready
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Postgres database with Prisma ORM for reliability
                </p>
              </CardNew>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Premium Gradient */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Start exploring quality content
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Dive into our curated collection of posts covering technology,
              design, and productivity. Join thousands of readers discovering
              new insights every day.
            </p>
            <div className="mt-10">
              <Link href="/blog">
                <ButtonNew
                  variant="default"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20"
                >
                  Explore All Posts
                  <ArrowRight className="ml-2 h-5 w-5" />
                </ButtonNew>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Premium Design */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              href="/blog"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm leading-5 text-slate-600 dark:text-slate-300">
              &copy; {new Date().getFullYear()} WriteFlow. Built with Next.js,
              tRPC, and <span className="text-red-500 animate-pulse">❤️</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
