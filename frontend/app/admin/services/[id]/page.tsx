"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../api-client";

type Service = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
};

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<Service>(`/cms/services/${id}`)
      .then((r) => {
        setSlug(r.data.slug);
        setTitle(r.data.title);
        setSubtitle(r.data.subtitle ?? "");
        setDescription(r.data.description ?? "");
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
      .put(`/cms/services/${id}`, {
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        status,
      })
      .then(() => router.push("/admin/services"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to save");
        setSaving(false);
      });
  };

  const deleteService = () => {
    if (!confirm("Delete this service?")) return;
    setDeleting(true);
    api
      .delete(`/cms/services/${id}`)
      .then(() => router.push("/admin/services"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to delete");
        setDeleting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/services" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Services</Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit service</h1>
      </div>
      <form onSubmit={save} className="max-w-xl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 flex-wrap pt-2">
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
            <Link href="/admin/services" className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancel</Link>
            <button type="button" onClick={deleteService} disabled={deleting} className="px-5 py-2.5 border border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-50 disabled:opacity-50">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
