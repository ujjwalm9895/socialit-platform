"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getCurrentUserId } from "../../../api-client";

export default function NewBlogPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const authorId = getCurrentUserId();
    if (!authorId) {
      setError("Session expired. Please log in again.");
      return;
    }
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setError("");
    setSaving(true);
    api
      .post("/cms/blogs", {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        status,
        author_id: authorId,
      })
      .then(() => router.push("/admin/blogs"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to create");
        setSaving(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Blogs</Link>
        <h1 className="text-2xl font-bold text-slate-900">New blog</h1>
      </div>
      <form onSubmit={save} className="max-w-xl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. my-first-post" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
            <Link href="/admin/blogs" className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
