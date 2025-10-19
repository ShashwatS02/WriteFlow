"use client";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  TagIcon,
  MoonIcon,
  ArrowRightIcon,
  PencilIcon,
  UsersIcon,
  ClockIcon,
  DocumentTextIcon,
  StarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { trpc } from "../lib/trpcClient";
import { formatDate, truncateText } from "../lib/utils";
import CategoryBadge from "../components/CategoryBadge";
import { useEffect, useState } from "react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
        {/* Animated background gradient */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            style={{ backgroundSize: "200% 200%" }}
          />
        </div>

        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
              variants={fadeInUp}
            >
              Effortless Content
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Management
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600 dark:text-gray-300"
              variants={fadeInUp}
            >
              WriteFlow is a production-grade blogging platform designed for
              creators who value simplicity, performance, and beautiful design.
              Write in Markdown, organize with categories, and publish with
              confidence.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <Link
                href="/blog"
                className="group inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105"
              >
                Explore Blog
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 px-6 py-3 text-base font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to create
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Powerful features designed to make content creation a joy, not a
              chore.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              <motion.div
                className="flex flex-col items-center text-center"
                variants={scaleIn}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Markdown Support
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Write with the power and simplicity of Markdown.
                  GitHub-flavored syntax, code highlighting, and live preview.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center"
                variants={scaleIn}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <TagIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Smart Categorization
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Organize your content with flexible categories. Color-coded
                  badges and intelligent filtering.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center"
                variants={scaleIn}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                  <MagnifyingGlassIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Powerful Search
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Full-text search across titles, content, and excerpts. Filter
                  by categories and sort by relevance.
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center"
                variants={scaleIn}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <MoonIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dark Mode
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Beautiful light and dark themes with smooth transitions.
                  Respects system preferences automatically.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 sm:py-28 bg-gray-50 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Latest Posts
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Discover the newest content from our platform
            </p>
          </motion.div>

          {featuredPosts?.posts && featuredPosts.posts.length > 0 && (
            <motion.div
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {featuredPosts.posts.map((post: any, index: number) => (
                <motion.article
                  key={post.id}
                  className="group cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 transition-all duration-200 group-hover:shadow-lg group-hover:ring-gray-900/10 dark:group-hover:ring-slate-600">
                      {post.coverImageUrl && (
                        <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.categories?.slice(0, 2).map((category: any) => (
                            <CategoryBadge
                              key={category.id}
                              category={category}
                              size="sm"
                            />
                          ))}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                          {truncateText(post.excerpt || "", 120)}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <time dateTime={post.createdAt.toString()}>
                            {formatDate(post.createdAt)}
                          </time>
                          <span>{post.readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          )}

          <motion.div
            className="mt-12 text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105"
            >
              View All Posts
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Platform Stats Section */}
      {stats && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Platform at a Glance
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Growing collection of quality content
              </p>
            </motion.div>

            <motion.div
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div className="text-center" variants={scaleIn}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter end={stats.publishedPosts} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Posts Published
                </div>
              </motion.div>

              <motion.div className="text-center" variants={scaleIn}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-900/20 mb-4">
                  <TagIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter end={stats.totalCategories} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Categories Available
                </div>
              </motion.div>

              <motion.div className="text-center" variants={scaleIn}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                  <ClockIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter end={stats.totalReadingTime} suffix="+" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Hours of Reading
                </div>
              </motion.div>

              <motion.div className="text-center" variants={scaleIn}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 mb-4">
                  <SparklesIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter end={100} suffix="%" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  TypeScript Coverage
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-blue-600 dark:bg-blue-700 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start exploring quality content
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Dive into our curated collection of posts covering technology,
              design, and productivity. Join thousands of readers discovering
              new insights every day.
            </p>
            <div className="mt-10">
              <Link
                href="/blog"
                className="group inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 hover:scale-105"
              >
                Explore All Posts
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-600 dark:text-gray-300">
              &copy; {new Date().getFullYear()} WriteFlow. Built with Next.js,
              tRPC, and ❤️.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
