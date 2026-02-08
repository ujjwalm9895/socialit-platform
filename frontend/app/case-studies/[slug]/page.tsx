"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

type CaseStudy = {
  id: string; title: string; slug: string; excerpt?: string; client_name?: string;
  challenge?: string; solution?: string; results?: string; status?: string;
};

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<CaseStudy>(`/cms/case-studies/slug/${slug}`)
      .then((res) => {
        if (res.data?.status === "published") setCaseStudy(res.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </PublicLayout>
    );
  }

  if (notFound || !caseStudy) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Case study not found</h1>
          <Link href="/case-studies" className="text-primary hover:underline">Back to case studies</Link>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/case-studies" className="text-sm text-primary hover:underline mb-4 inline-block">← Case Studies</Link>
        <h1 className="text-3xl font-bold text-gray-900">{caseStudy.title}</h1>
        {caseStudy.client_name && <p className="text-gray-600 mt-2">Client: {caseStudy.client_name}</p>}
        {caseStudy.excerpt && <p className="text-gray-600 mt-2">{caseStudy.excerpt}</p>}
        <div className="mt-8 space-y-6">
          {caseStudy.challenge && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Challenge</h2>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{caseStudy.challenge}</p>
            </div>
          )}
          {caseStudy.solution && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Solution</h2>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{caseStudy.solution}</p>
            </div>
          )}
          {caseStudy.results && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Results</h2>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{caseStudy.results}</p>
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  );
}
