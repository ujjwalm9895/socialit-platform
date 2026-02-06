"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/AnimatedHeader";
import Footer from "../../../components/Footer";
import { apiUrl } from "../../../lib/api";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  featured_image_url?: string;
  author_id?: string;
  category?: string;
  tags?: string[];
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  status: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/cms/blogs`);
        const found = response.data.find((b: Blog) => b.slug === slug && b.status === "published");
        if (found) {
          setBlog(found);
        } else {
          setError("Blog post not found");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Blog post not found");
        } else {
          setError(err.response?.data?.detail || "Failed to load blog post");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug, apiUrl]);

  useEffect(() => {
    if (blog) {
      document.title = blog.meta_title || blog.title;
      const metaDescription = blog.meta_description || blog.excerpt;
      if (metaDescription) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", metaDescription);
      }
    }
  }, [blog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Loading blog post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Blog Post Not Found"}
            </h1>
            <Link href="/blogs" className="text-blue-600 hover:text-blue-700">
              ← Back to Blogs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {blog.featured_image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={blog.featured_image_url}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            {blog.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded mb-4">
                {blog.category}
              </span>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            {blog.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{blog.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              {blog.published_at && (
                <span>
                  {new Date(blog.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="prose prose-lg max-w-none">
            {blog.content ? (
              <div className="text-gray-700 whitespace-pre-wrap">
                {typeof blog.content === "string"
                  ? blog.content
                  : JSON.stringify(blog.content, null, 2)}
              </div>
            ) : (
              <p className="text-gray-700">{blog.excerpt}</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blogs"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to All Blogs
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
