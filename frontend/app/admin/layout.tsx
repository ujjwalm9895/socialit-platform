"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLogin) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) router.replace("/admin/login");
  }, [mounted, isLogin, router]);

  if (!mounted) return null;
  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-4 flex-wrap">
          <a href="/admin/homepage" className="font-semibold text-gray-900 hover:text-indigo-600">Homepage</a>
          <a href="/admin/services" className="text-sm text-gray-600 hover:text-indigo-600">Services</a>
          <a href="/admin/blogs" className="text-sm text-gray-600 hover:text-indigo-600">Blogs</a>
          <a href="/admin/case-studies" className="text-sm text-gray-600 hover:text-indigo-600">Case studies</a>
          <a href="/admin/header" className="text-sm text-gray-600 hover:text-indigo-600">Header</a>
          <a href="/admin/footer" className="text-sm text-gray-600 hover:text-indigo-600">Footer</a>
          <a href="/admin/theme" className="text-sm text-gray-600 hover:text-indigo-600">Theme</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
            View site
          </a>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              router.push("/admin/login");
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
