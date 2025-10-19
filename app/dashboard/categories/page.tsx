"use client";
import React, { useMemo, useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../../../lib/hooks/usePosts";
import SearchInput from "../../../components/SearchInput";

const COLORS = ["gray","red","orange","yellow","green","teal","blue","indigo","purple","pink"];

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter((c: any) => c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s));
  }, [data, search]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setModalOpen(true); };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button className="px-4 py-2 rounded bg-slate-900 text-white" onClick={openNew}>New Category</button>
      </div>
      <div className="mb-4 max-w-md"><SearchInput value={search} onChange={setSearch} placeholder="Search categories..." /></div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => (
            <div key={c.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{c.name}</div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{c.slug}</span>
              </div>
              {c.description && (
                <div className="text-sm text-slate-600 mb-3 line-clamp-2">{c.description}</div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.colorVariant }} />
                  <span className="text-xs text-slate-500">{c.colorVariant}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 rounded border" onClick={() => openEdit(c)}>Edit</button>
                  <button className="px-2 py-1 rounded border text-red-600" onClick={() => deleteCat.mutate(c.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CategoryModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={(payload) => {
            if (editing) updateCat.mutate({ id: editing.id, ...payload }); else createCat.mutate(payload);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({ initial, onClose, onSave }: { initial: any | null; onClose: () => void; onSave: (v: any) => void; }) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [colorVariant, setColorVariant] = useState(initial?.colorVariant || "gray");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{initial ? 'Edit Category' : 'New Category'}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name if empty" className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColorVariant(c)} className={`w-7 h-7 rounded-full border ${colorVariant === c ? 'ring-2 ring-slate-900' : ''}`} style={{ backgroundColor: c }} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-3 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded bg-slate-900 text-white" onClick={() => onSave({ name, slug: slug || undefined, description, colorVariant })}>Save</button>
        </div>
      </div>
    </div>
  );
}


