"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeroRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/homepage");
  }, [router]);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-slate-500">Redirecting to Homepage…</p>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
