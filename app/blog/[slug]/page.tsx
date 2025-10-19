"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronUpIcon,
  ShareIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  TwitterIcon,
  FacebookIcon,
  LinkedinIcon,
  LinkIcon,
} from "lucide-react";
import { trpc } from "../../../lib/trpcClient";
import { formatDate, generateTableOfContents, cn } from "../../../lib/utils";
import CategoryBadge from "../../../components/CategoryBadge";
import { toast } from "sonner";
import { TextSkeleton } from "../../../components/SkeletonLoader";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PostDetail() {
  const params = useParams();
  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : (params?.slug as string);

  // State
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Fetch post data
  const {
    data: post,
    isLoading,
    error,
  } = trpc.posts.getBySlug.useQuery({ slug }, { enabled: !!slug });

  // Fetch related posts
  const { data: relatedPosts } = trpc.posts.getRelated.useQuery(
    { postId: post?.id || 0, limit: 3 },
    { enabled: !!post?.id }
  );

  // Generate table of contents
  const tableOfContents = useMemo(() => {
    if (!post?.content) return [];
    return generateTableOfContents(post.content);
  }, [post?.content]);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroHeight = 400; // Height of hero section
      setShowScrollTop(scrolled > heroHeight);

      // Update active section for table of contents
      if (tableOfContents.length > 0) {
        const headings = tableOfContents
          .map((toc) => {
            const element = document.getElementById(toc.id);
            if (element) {
              const rect = element.getBoundingClientRect();
              return {
                id: toc.id,
                offsetTop: rect.top + scrolled - 100,
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{ id: string; offsetTop: number }>;

        const current = headings.find((heading, index) => {
          const next = headings[index + 1];
          return (
            scrolled >= heading.offsetTop &&
            (!next || scrolled < next.offsetTop)
          );
        });

        if (current) {
          setActiveSection(current.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [tableOfContents]);

  // Share functions
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareToTwitter = () => {
    const text = `Check out "${post?.title}" on WriteFlow`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    const title = encodeURIComponent(post?.title || "");
    const summary = encodeURIComponent(post?.excerpt || "");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${title}&summary=${summary}`,
      "_blank"
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      setIsShareOpen(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <TextSkeleton className="mb-4" />
          <TextSkeleton className="mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <TextSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error ? "Error loading post" : "Post not found"}
          </h1>
          <Link
            href="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": shareUrl,
            headline: post.title,
            description: post.excerpt,
            image: post.coverImageUrl,
            datePublished: post.createdAt,
            dateModified: post.updatedAt,
            author: {
              "@type": "Organization",
              name: "WriteFlow",
            },
            publisher: {
              "@type": "Organization",
              name: "WriteFlow",
            },
            wordCount: post.wordCount,
            articleBody: post.content,
            keywords: post.categories?.map((cat: any) => cat.name).join(", "),
          }),
        }}
      />

      {/* Hero Section */}
      <motion.section
        className="relative h-[60vh] min-h-[400px] w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {post.coverImageUrl ? (
          <>
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-4xl px-6 pb-16 w-full">
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {/* Breadcrumbs */}
              <nav
                className="flex items-center space-x-2 text-sm text-white/80 mb-6"
                aria-label="Breadcrumb"
              >
                <Link href="/" className="hover:text-white transition-colors">
                  <HomeIcon className="h-4 w-4" />
                </Link>
                <ChevronRightIcon className="h-4 w-4" />
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </Link>
                <ChevronRightIcon className="h-4 w-4" />
                <span className="text-white font-medium truncate">
                  {post.title}
                </span>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5" />
                  <time dateTime={post.createdAt.toString()}>
                    {formatDate(post.createdAt)}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  <span>{post.readingTime} min read</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="h-5 w-5" />
                  <span>{post.wordCount} words</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <motion.article
            className="lg:col-span-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Category Badges */}
            {post.categories && post.categories.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2 mb-8"
                variants={fadeInUp}
              >
                {post.categories.map((category: any) => (
                  <Link
                    key={category.id}
                    href={`/blog?categories=${category.id}`}
                  >
                    <CategoryBadge
                      category={category}
                      className="hover:opacity-75 transition-opacity cursor-pointer"
                    />
                  </Link>
                ))}
              </motion.div>
            )}

            {/* Markdown Content */}
            <motion.div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-gray-100 dark:prose-pre:bg-slate-800"
              variants={fadeInUp}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                components={{
                  h2: ({ children, ...props }) => {
                    const text = children?.toString() || "";
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9 -]/g, "")
                      .replace(/\s+/g, "-");
                    return (
                      <h2
                        id={id}
                        className="group flex items-center gap-2"
                        {...props}
                      >
                        {children}
                        <a
                          href={`#${id}`}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 transition-opacity"
                          aria-label={`Link to ${text}`}
                        >
                          #
                        </a>
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = children?.toString() || "";
                    const id = text
                      .toLowerCase()
                      .replace(/[^a-z0-9 -]/g, "")
                      .replace(/\s+/g, "-");
                    return (
                      <h3
                        id={id}
                        className="group flex items-center gap-2"
                        {...props}
                      >
                        {children}
                        <a
                          href={`#${id}`}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 transition-opacity"
                          aria-label={`Link to ${text}`}
                        >
                          #
                        </a>
                      </h3>
                    );
                  },
                  img: ({ src, alt }) => {
                    const s = typeof src === "string" ? src : String(src || "");
                    return (
                      <Image
                        src={s}
                        alt={alt || ""}
                        width={800}
                        height={400}
                        className="rounded-lg shadow-lg"
                      />
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </motion.div>

            {/* Social Share */}
            <motion.div
              className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700"
              variants={fadeInUp}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Share this post
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={shareToTwitter}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <TwitterIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shareToFacebook}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <FacebookIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={shareToLinkedIn}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Copy link"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-8">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <motion.div
                  className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Table of Contents
                  </h3>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={cn(
                          "block text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                          item.level === 2 ? "pl-0 font-medium" : "pl-4",
                          activeSection === item.id
                            ? "text-blue-600 dark:text-blue-400 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </motion.div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <motion.section
            className="mt-24 pt-12 border-t border-gray-200 dark:border-slate-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Related Posts
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost: any, index: number) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-slate-600">
                      {relatedPost.coverImageUrl && (
                        <div className="aspect-video overflow-hidden">
                          <Image
                            src={relatedPost.coverImageUrl}
                            alt={relatedPost.title}
                            width={400}
                            height={225}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.excerpt && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                            {relatedPost.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <time dateTime={relatedPost.createdAt.toString()}>
                            {formatDate(relatedPost.createdAt)}
                          </time>
                          <span>{relatedPost.readingTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUpIcon className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  // For production, you'd fetch the post data here for server-side metadata generation
  const title = `${params.slug.replace(/-/g, " ")} | WriteFlow`;
  const description =
    "Read this post on WriteFlow - a production-grade blogging platform.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "WriteFlow",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
