"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicLayout from "../../components/PublicLayout";
import api from "../api-client";

type Job = {
  id: string;
  slug: string;
  title: string;
  job_type: string;
  location?: string;
  employment_type?: string;
  description?: string;
  status: string;
  created_at: string;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "internship" | "permanent">("all");

  useEffect(() => {
    const params: { job_type?: string } = {};
    if (filter !== "all") params.job_type = filter;
    api
      .get<Job[]>("/cms/jobs", { params: { limit: 100, ...params } })
      .then((r) => setJobs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <PublicLayout>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zensar-dark mb-2">Careers</h1>
        <p className="text-zensar-muted mb-6 sm:mb-8">Join our team. Open roles are listed below.</p>

        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {(["all", "internship", "permanent"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={filter === f ? "px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-sm bg-primary text-white" : "px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-sm bg-zensar-surface text-gray-600 hover:bg-gray-200"}
            >
              {f === "all" ? "All" : f === "internship" ? "Internship" : "Permanent"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-zensar-surface border border-gray-200">
            <p className="text-zensar-muted">No open positions at the moment. Check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={"/careers/" + job.slug} className="group hover-lift block border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-zensar-dark">{job.title}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{job.job_type}</span>
                    {job.location && <span className="text-sm text-gray-500">{job.location}</span>}
                    {job.employment_type && <span className="text-sm text-gray-500">{job.employment_type}</span>}
                  </div>
                  {job.description && <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>}
                  <span className="inline-block mt-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">View details →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </PublicLayout>
  );
}
