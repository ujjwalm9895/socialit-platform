"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicLayout from "../../../components/PublicLayout";
import api from "../../api-client";

type Blog = { id: string; title: string; slug: string; excerpt?: string; content?: string | Record<string, unknown>; status?: string };

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api
      .get<Blog>(`/cms/blogs/slug/${slug}`)
      .then((res) => {
        if (res.data?.status === "published") setBlog(res.data);
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

  if (notFound || !blog) {
    return (
      <PublicLayout>
        <main className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
          <Link href="/blogs" className="text-indigo-600 hover:underline">Back to blogs</Link>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blogs" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">← Blogs</Link>
        <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
        {blog.excerpt && <p className="text-gray-600 mt-2">{blog.excerpt}</p>}
        {blog.content != null && blog.content !== "" && (
          <div className="mt-6 prose prose-gray max-w-none">
            {typeof blog.content === "string" ? (
              <p className="whitespace-pre-wrap text-gray-700">{blog.content}</p>
            ) : (
              <p className="text-gray-700">{JSON.stringify(blog.content)}</p>
            )}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
