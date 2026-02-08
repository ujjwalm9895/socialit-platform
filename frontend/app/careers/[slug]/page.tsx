"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

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

export default function JobDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Job>(`/cms/jobs/slug/${encodeURIComponent(slug)}`)
      .then((r) => {
        setJob(r.data ?? null);
        setNotFound(!r.data);
      })
      .catch(() => {
        setJob(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </PublicLayout>
    );
  }

  if (notFound || !job) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Job not found</h1>
          <Link href="/careers" className="text-primary hover:underline">← Back to Careers</Link>
        </main>
      </PublicLayout>
    );
  }

  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/careers" className="text-sm text-primary hover:underline mb-4 inline-block">
          ← Careers
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {job.job_type}
          </span>
          {job.location && <span className="text-sm text-gray-500">{job.location}</span>}
          {job.employment_type && (
            <span className="text-sm text-gray-500">{job.employment_type}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-zensar-dark mb-6">{job.title}</h1>
        {job.description && (
          <div className="prose prose-gray max-w-none mb-8">
            <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
          </div>
        )}
        {requirements.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-zensar-dark mb-3">Requirements</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
              {requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </>
        )}
        <div className="pt-4 border-t border-gray-200">
          <a
            href="/contact"
            className="btn-flashy inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium shadow-glow hover:bg-primary-dark"
          >
            Apply now
          </a>
        </div>
      </main>
    </PublicLayout>
  );
}
