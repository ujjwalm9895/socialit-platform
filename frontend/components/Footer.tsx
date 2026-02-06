"use client";

import Link from "next/link";

export default function Footer() {
  const year = typeof window !== "undefined" ? new Date().getFullYear() : new Date().getFullYear();
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {year} Social IT. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/services" className="text-sm text-gray-600 hover:text-indigo-600">
              Services
            </Link>
            <Link href="/blogs" className="text-sm text-gray-600 hover:text-indigo-600">
              Blogs
            </Link>
            <Link href="/case-studies" className="text-sm text-gray-600 hover:text-indigo-600">
              Case Studies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
