import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import trpc from "../trpcClient";

export function usePosts(params?: any) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: async () => {
      const res = await trpc.posts.getAll.query(params || {});
      return res;
    },
  });
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      if (!slug) return null;
      return trpc.posts.getBySlug.query({ slug });
    },
    enabled: !!slug,
  });
}

export function usePostById(id?: number) {
  return useQuery({
    queryKey: ["postById", id],
    queryFn: async () => {
      if (!id) return null;
      return trpc.posts.getById.query({ id });
    },
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => trpc.posts.create.mutate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trpc.posts.delete.mutate({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; publish?: boolean }) =>
      trpc.posts.togglePublish.mutate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => trpc.posts.update.mutate(data),
    onMutate: async (newData: any) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const previous = qc.getQueryData<any[]>(["posts"]);
      qc.setQueryData(["posts"], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map((p) => (p.id === newData.id ? { ...p, ...newData } : p));
      });
      return { previous };
    },
    onError: (err, newData, context: any) => {
      if (context?.previous) qc.setQueryData(["posts"], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return trpc.categories.getAll.query();
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => trpc.categories.create.mutate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => trpc.categories.update.mutate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => trpc.categories.delete.mutate({ id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
