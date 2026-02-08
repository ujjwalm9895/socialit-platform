"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * AI/ML is now a normal service (same as others). This route redirects to Services.
 * Edit the "Artificial Intelligence & Machine Learning Solutions" service from the list.
 */
export default function AdminServicesAIMLSectionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/services");
  }, [router]);
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-slate-500">Redirecting to Services…</p>
    </div>
  );
}
