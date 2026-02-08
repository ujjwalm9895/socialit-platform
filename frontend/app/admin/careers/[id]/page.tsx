"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "../../../api-client";

type Job = {
  id: string;
  slug: string;
  title: string;
  job_type: string;
  location?: string;
  employment_type?: string;
  description?: string;
  requirements?: string[];
  status: string;
};

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<"internship" | "permanent">("permanent");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [description, setDescription] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get<Job>("/cms/jobs/" + id)
      .then((r) => {
        setSlug(r.data.slug);
        setTitle(r.data.title);
        setJobType((r.data.job_type as "internship" | "permanent") || "permanent");
        setLocation(r.data.location ?? "");
        setEmploymentType(r.data.employment_type ?? "");
        setDescription(r.data.description ?? "");
        setRequirementsText(Array.isArray(r.data.requirements) ? r.data.requirements.join("\n") : "");
        setStatus((r.data.status as "draft" | "published") ?? "draft");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const requirements = requirementsText ? requirementsText.split("\n").map((s) => s.trim()).filter(Boolean) : undefined;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setError("");
    setSaving(true);
    api
      .put("/cms/jobs/" + id, {
        slug: slug.trim(),
        title: title.trim(),
        job_type: jobType,
        location: location.trim() || undefined,
        employment_type: employmentType.trim() || undefined,
        description: description.trim() || undefined,
        requirements: requirements?.length ? requirements : undefined,
        status,
      })
      .then(() => router.push("/admin/careers"))
      .catch((err) => {
        setError(err.response?.data?.detail ?? "Failed to save");
        setSaving(false);
      });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-slate-500">Loading...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/careers" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Careers</Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit job</h1>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Job type</label>
            <select value={jobType} onChange={(e) => setJobType(e.target.value as "internship" | "permanent")} className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary">
              <option value="internship">Internship</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employment type</label>
            <input value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
            <textarea value={requirementsText} onChange={(e) => setRequirementsText(e.target.value)} rows={6} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary" />
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
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <Link href="/admin/careers" className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
