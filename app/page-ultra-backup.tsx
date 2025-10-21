"use client";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
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
  Star,
  Check,
} from "lucide-react";
import Link from "next/link";
import { trpc } from "../lib/trpcClient";
import { formatDate, truncateText } from "../lib/utils";
import CategoryBadge from "../components/CategoryBadge";
import { useEffect, useState, useRef } from "react";
import { Button as ButtonNew } from "../components/ui/ButtonNew";
import { Card as CardNew } from "../components/ui/CardNew";
import { Badge as BadgeNew } from "../components/ui/BadgeNew";

// Ultra-smooth animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

// Animated counter with smooth easing
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
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

// Magnetic button effect (Vercel-style)
function MagneticButton({ children, className = "", href }: any) {
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

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {href ? <Link href={href}>{children}</Link> : children}
    </motion.div>
  );
}

export default function Home() {
  const { data: featuredPosts } = trpc.posts.getAll.useQuery({
    page: 1,
    pageSize: 3,
    isPublished: true,
    sortBy: "newest",
  });

  const { data: stats } = trpc.categories.getStats.useQuery();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Ultra-Premium Gradient Mesh Background (Vercel-style) */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient mesh base */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 50%),
              radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)
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
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 2,
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      {/* Hero Section - Ultra-Premium */}
      <section className="relative px-6 pt-24 pb-32 sm:px-6 sm:pt-32 sm:pb-40 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Floating badge with shimmer effect */}
            <motion.div
              variants={fadeInUp}
              className="flex justify-center mb-8"
            >
              <div className="frosted rounded-full px-6 py-2.5 inline-flex items-center gap-2.5 glow-purple hover-lift cursor-pointer group">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Welcome to the Future of Content
                </span>
                <motion.div
                  className="ml-1"
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </motion.div>
              </div>
            </motion.div>

            {/* Hero heading with ultra-premium gradient */}
            <motion.h1
              className="text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl xl:text-9xl mb-8"
              variants={fadeInUp}
            >
              <span className="block text-slate-900 dark:text-white mb-3 font-extrabold">
                Effortless
              </span>
              <span className="block gradient-text-animated text-[1.1em] leading-[0.9] font-black">
                Content Creation
              </span>
            </motion.h1>

            {/* Enhanced description with better typography */}
            <motion.p
              className="mt-8 max-w-3xl mx-auto text-xl sm:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium"
              variants={fadeInUp}
            >
              A production-grade blogging platform for creators who demand{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                simplicity
              </span>
              ,{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                performance
              </span>
              , and{" "}
              <span className="text-slate-900 dark:text-white font-semibold">
                beautiful design
              </span>
              .
            </motion.p>

            {/* CTA buttons with magnetic effect */}
            <motion.div
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeInUp}
            >
              <MagneticButton href="/blog">
                <ButtonNew
                  variant="default"
                  size="lg"
                  className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white glow-primary !shadow-xl hover:!shadow-2xl !px-8 !py-6 !text-lg group"
                >
                  <span>Explore Blog</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </ButtonNew>
              </MagneticButton>

              <MagneticButton href="/dashboard">
                <ButtonNew
                  variant="ghost"
                  size="lg"
                  className="frosted !px-8 !py-6 !text-lg hover:!bg-white/80 dark:hover:!bg-slate-900/80 group"
                >
                  <PenSquare className="h-5 w-5" />
                  <span className="font-semibold">Dashboard</span>
                </ButtonNew>
              </MagneticButton>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-600 dark:text-slate-400"
              variants={fadeInUp}
            >
              {[
                { icon: Check, text: "100% TypeScript" },
                { icon: Zap, text: "Lightning Fast" },
                { icon: Shield, text: "Production Ready" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center glow-success">
                    <item.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Frosted Glass Cards */}
      <section className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-20"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Everything you need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Powerful features designed to make content creation a joy
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {[
              {
                icon: FileText,
                title: "Markdown Support",
                desc: "Write with GitHub-flavored syntax, code highlighting, and live preview",
                gradient: "from-blue-500 to-indigo-600",
                shadow: "glow-primary",
              },
              {
                icon: Tag,
                title: "Smart Categorization",
                desc: "Organize content with flexible categories and intelligent filtering",
                gradient: "from-purple-500 to-pink-600",
                shadow: "glow-purple",
              },
              {
                icon: Search,
                title: "Powerful Search",
                desc: "Full-text search across all content with relevance sorting",
                gradient: "from-emerald-500 to-green-600",
                shadow: "glow-success",
              },
              {
                icon: Moon,
                title: "Dark Mode",
                desc: "Beautiful themes with smooth transitions and system preferences",
                gradient: "from-amber-500 to-orange-600",
                shadow: "glow-pink",
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={scaleIn}>
                <div className="frosted rounded-3xl p-8 h-full hover-lift spotlight group cursor-pointer elevated">
                  <div
                    className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} ${feature.shadow}`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:gradient-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Posts - Premium Cards */}
      {featuredPosts?.posts && featuredPosts.posts.length > 0 && (
        <section className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl text-center mb-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-2 frosted rounded-full px-5 py-2 mb-6 glow-primary">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Latest Content
                </span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                Featured Articles
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Discover insights from our platform
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {featuredPosts.posts.map((post: any) => (
                <motion.div key={post.id} variants={scaleIn}>
                  <Link href={`/blog/${post.slug}`}>
                    <div className="frosted rounded-3xl overflow-hidden elevated spotlight group cursor-pointer h-full flex flex-col">
                      {post.coverImageUrl && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                          />
                        </div>
                      )}

                      <div className="p-8 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {post.categories?.slice(0, 2).map((category: any) => (
                            <CategoryBadge
                              key={category.id}
                              category={category}
                              size="sm"
                            />
                          ))}
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:gradient-text transition-all mb-4">
                          {post.title}
                        </h3>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 flex-1">
                          {truncateText(post.excerpt || "", 120)}
                        </p>

                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <time dateTime={post.createdAt.toString()}>
                              {formatDate(post.createdAt)}
                            </time>
                          </div>
                          <div className="flex items-center gap-2 font-semibold">
                            <BookOpen className="w-4 h-4" />
                            <span>{post.readingTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
              <MagneticButton href="/blog">
                <ButtonNew
                  variant="default"
                  size="lg"
                  className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white glow-primary !shadow-xl hover:!shadow-2xl !px-8"
                >
                  View All Posts
                  <ArrowRight className="h-5 w-5" />
                </ButtonNew>
              </MagneticButton>
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section - Animated Cards */}
      {stats && (
        <section className="py-24 sm:py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: FileText,
                  value: stats.publishedPosts,
                  label: "Published Posts",
                  gradient: "from-blue-500 to-indigo-600",
                },
                {
                  icon: Tag,
                  value: stats.totalCategories,
                  label: "Categories",
                  gradient: "from-purple-500 to-pink-600",
                },
                {
                  icon: Clock,
                  value: stats.totalReadingTime,
                  label: "Hours of Reading",
                  suffix: "+",
                  gradient: "from-emerald-500 to-green-600",
                },
                {
                  icon: Sparkles,
                  value: 100,
                  label: "TypeScript Coverage",
                  suffix: "%",
                  gradient: "from-amber-500 to-orange-600",
                },
              ].map((stat, i) => (
                <motion.div key={i} variants={scaleIn}>
                  <div className="frosted rounded-3xl p-8 text-center elevated spotlight group cursor-pointer">
                    <div
                      className={`mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} glow-primary`}
                    >
                      <stat.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-5xl font-black text-slate-900 dark:text-white mb-3 group-hover:gradient-text transition-all">
                      <AnimatedCounter
                        end={stat.value}
                        suffix={stat.suffix || ""}
                      />
                    </div>
                    <div className="text-base font-semibold text-slate-600 dark:text-slate-300">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Tech Stack - Premium */}
      <section className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              Built for Performance
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
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
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Built with Next.js 15 for optimal performance",
                gradient: "from-blue-500 to-indigo-600",
              },
              {
                icon: Shield,
                title: "Type-Safe",
                desc: "100% TypeScript with end-to-end type safety",
                gradient: "from-emerald-500 to-green-600",
              },
              {
                icon: Rocket,
                title: "Production Ready",
                desc: "Battle-tested with Postgres and Prisma",
                gradient: "from-purple-500 to-pink-600",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={scaleIn}>
                <div className="frosted rounded-3xl p-10 text-center elevated spotlight group cursor-pointer h-full">
                  <div
                    className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} glow-primary`}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:gradient-text transition-all">
                    {item.title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Ultra-Premium */}
      <section className="relative py-32 sm:py-40 overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
        <div className="absolute inset-0 -z-10 dot-pattern opacity-20" />

        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-5xl sm:text-6xl font-black text-white mb-8 leading-tight">
                Start creating amazing content today
              </h2>
            </motion.div>

            <motion.p
              className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Join thousands of creators who trust WriteFlow for their content
              management needs
            </motion.p>

            <motion.div variants={fadeInUp}>
              <MagneticButton href="/blog">
                <ButtonNew
                  size="lg"
                  className="!bg-white !text-blue-600 hover:!bg-blue-50 !shadow-2xl !px-10 !py-7 !text-xl font-bold group"
                >
                  <span>Explore Now</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.div>
                </ButtonNew>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Premium */}
      <footer className="frosted border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-8 md:order-2">
            <Link
              href="/blog"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold text-lg"
            >
              Blog
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold text-lg"
            >
              Dashboard
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-slate-600 dark:text-slate-300">
              &copy; {new Date().getFullYear()} WriteFlow. Built with Next.js,
              tRPC, and{" "}
              <motion.span
                className="inline-block text-red-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                ❤️
              </motion.span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
