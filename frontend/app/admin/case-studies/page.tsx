"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  client_name?: string;
  excerpt?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminCaseStudiesPage() {
  const [list, setList] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CaseStudy[]>("/cms/case-studies", { params: { limit: 500 } })
      .then((r) => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading case studies...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Case studies</h1>
        <Link href="/admin/case-studies/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          New case study
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="text-gray-500">No case studies. <Link href="/admin/case-studies/new" className="text-indigo-600 hover:underline">Create one</Link>.</p>
      ) : (
        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
          {list.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium text-gray-900">{c.title}</span>
                {c.client_name && <span className="text-gray-500 text-sm ml-2">({c.client_name})</span>}
                <span className="text-gray-500 text-sm ml-2">/{c.slug}</span>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${c.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {c.status}
                </span>
              </div>
              <Link href={`/admin/case-studies/${c.id}`} className="text-sm text-indigo-600 hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
