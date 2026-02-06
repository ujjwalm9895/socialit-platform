"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type Service = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function AdminServicesPage() {
  const [list, setList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Service[]>("/cms/services", { params: { limit: 500 } })
      .then((r) => setList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading services...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <Link
          href="/admin/services/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          New service
        </Link>
      </div>
      {list.length === 0 ? (
        <p className="text-gray-500">No services. <Link href="/admin/services/new" className="text-indigo-600 hover:underline">Create one</Link>.</p>
      ) : (
        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white">
          {list.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="font-medium text-gray-900">{s.title}</span>
                <span className="text-gray-500 text-sm ml-2">/{s.slug}</span>
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${s.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                  {s.status}
                </span>
              </div>
              <Link href={`/admin/services/${s.id}`} className="text-sm text-indigo-600 hover:underline">
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
