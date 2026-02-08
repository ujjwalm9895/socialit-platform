"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const contentNav = [
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/blogs", label: "Blogs" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/careers", label: "Careers" },
];

const pagesNav = [
  { href: "/admin/about", label: "About page" },
  { href: "/admin/contact", label: "Contact info" },
];

const siteNav = [
  { href: "/admin/header", label: "Header" },
  { href: "/admin/footer", label: "Footer" },
  { href: "/admin/theme", label: "Theme" },
];

function NavGroup({ title, items, pathname }: { title: string; items: { href: string; label: string }[]; pathname: string }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <ul className="space-y-0.5">
        {items.map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col bg-slate-800 text-white">
        <div className="p-5 border-b border-slate-700/50">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white font-bold text-sm">S</span>
            <span className="font-semibold text-lg tracking-tight">Social IT CMS</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-2 transition-all ${
              pathname === "/admin" ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
          <NavGroup title="Content" items={contentNav} pathname={pathname} />
          <NavGroup title="Pages" items={pagesNav} pathname={pathname} />
          <NavGroup title="Site" items={siteNav} pathname={pathname} />
        </nav>
        <div className="p-4 border-t border-slate-700/50 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            View site →
          </a>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              router.push("/admin/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-100" data-admin>
        <div className="max-w-4xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
