"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { usePostById, useUpdatePost } from "../../../../../lib/hooks/usePosts";
import PostEditor from "../../../../../components/PostEditor";

export default function EditPostPage() {
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
  const { data, isLoading } = usePostById(id);
  const update = useUpdatePost();

  useEffect(() => {
    if (data) {
    }
  }, [data]);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Post not found</div>;

  const save = () => {
    update.mutate({ id, title: data.title, content: data.content });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <PostEditor post={data} />
      <div>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={save}
        >
          Save
        </button>
      </div>
    </div>
  );
}
