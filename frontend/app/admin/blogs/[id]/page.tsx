"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../api-client";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  status: string;
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<Blog>(`/cms/blogs/${id}`)
      .then((r) => {
        setSlug(r.data.slug);
        setTitle(r.data.title);
        setExcerpt(r.data.excerpt ?? "");
        setStatus((r.data.status as "draft" | "published") ?? "draft");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setError("");
    setSaving(true);
    api
      .put(`/cms/blogs/${id}`, {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        status,
      })
      .then(() => router.push("/admin/blogs"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to save");
        setSaving(false);
      });
  };

  const deleteBlog = () => {
    if (!confirm("Delete this blog?")) return;
    setDeleting(true);
    api
      .delete(`/cms/blogs/${id}`)
      .then(() => router.push("/admin/blogs"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to delete");
        setDeleting(false);
      });
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-gray-600 hover:text-gray-900 text-sm">← Blogs</Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit blog</h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 flex-wrap">
          <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Saving..." : "Save"}
          </button>
          <Link href="/admin/blogs" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="button" onClick={deleteBlog} disabled={deleting} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
