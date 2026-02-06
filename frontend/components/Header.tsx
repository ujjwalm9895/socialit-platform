"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition">
            Social IT
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/services" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">
              Services
            </Link>
            <Link href="/blogs" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">
              Blogs
            </Link>
            <Link href="/case-studies" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">
              Case Studies
            </Link>
            <Link href="/admin/login" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
