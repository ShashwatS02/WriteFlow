"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import CategoryBadge from "./CategoryBadge";

export default function PostCard({ post }: { post: any }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02] bg-white dark:bg-slate-800 dark:border-slate-700">
        {post.coverImageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Category badges */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.categories.slice(0, 2).map((cat: any) => (
                <CategoryBadge
                  key={cat.id}
                  label={cat.name}
                  color={cat.colorVariant}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              ))}
              {post.categories.length > 2 && (
                <span className="text-xs text-slate-500 px-2 py-1">
                  +{post.categories.length - 2} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formatDate(post.createdAt)}</span>
            {post.readingTime && <span>{post.readingTime} min read</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
