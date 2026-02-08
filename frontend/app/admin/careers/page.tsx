"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type Job = { id: string; slug: string; title: string; job_type: string; location?: string; status: string; created_at: string };

export default function AdminCareersPage() {
  const [list, setList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Job[]>("/cms/jobs", { params: { limit: 500 } }).then((r) => setList(Array.isArray(r.data) ? r.data : [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-slate-500">Loading...</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Careers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage job listings. Publish to show on /careers.</p>
        </div>
        <Link href="/admin/careers/new" className="btn-flashy shrink-0 inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-medium">New job</Link>
      </div>
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <p className="text-slate-500">No jobs yet.</p>
          <Link href="/admin/careers/new" className="inline-block mt-3 text-primary font-medium hover:underline">Create one</Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((j) => (
            <li key={j.id}>
              <Link href={"/admin/careers/" + j.id} className="hover-lift flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="min-w-0">
                  <span className="font-medium text-slate-900">{j.title}</span>
                  <span className="text-slate-400 text-sm ml-2">/{j.slug}</span>
                  <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{j.job_type}</span>
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${j.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{j.status}</span>
                </div>
                <span className="text-primary text-sm font-medium shrink-0">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
