"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import PreviewModal from "../../../components/PreviewModal";
import { AnimatedTable } from "../../../components/AnimatedTable";
import AnimatedButton from "../../../components/AnimatedButton";
import AnimatedModal from "../../../components/AnimatedModal";
import AnimatedCard from "../../../components/AnimatedCard";
import JSONImportModal from "../../../components/JSONImportModal";
import { apiUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/env";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author_id: string;
  category?: string;
  tags?: string[];
  status: "draft" | "published" | "archived";
  featured_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  category: string;
  tags: string;
  status: "draft" | "published" | "archived";
  featured_image_url: string;
  content: any;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    author_id: "",
    category: "",
    tags: "",
    status: "draft",
    featured_image_url: "",
    content: null,
  });


  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/cms/blogs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBlogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/cms/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      // Set default author to first user if available
      if (response.data.length > 0 && !formData.author_id) {
        setFormData((prev) => ({
          ...prev,
          author_id: response.data[0].id,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        excerpt: formData.excerpt || null,
        category: formData.category || null,
        featured_image_url: formData.featured_image_url || null,
        content: formData.content || null,
      };

      if (editingBlog) {
        await axios.put(
          `${apiUrl}/cms/blogs/${editingBlog.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccess("Blog updated successfully!");
      } else {
        await axios.post(`${apiUrl}/cms/blogs`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Blog created successfully!");
      }
      setShowModal(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        author_id: users[0]?.id || "",
        category: "",
        tags: "",
        status: "draft",
        featured_image_url: "",
        content: null,
      });
      fetchBlogs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      author_id: blog.author_id,
      category: blog.category || "",
      tags: blog.tags?.join(", ") || "",
      status: blog.status,
      featured_image_url: blog.featured_image_url || "",
      content: null,
    });
    setShowModal(true);
  };

  const handleJsonImport = async (items: any[]) => {
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          const payload = {
            title: item.title,
            slug: item.slug || item.title.toLowerCase().replace(/\s+/g, "-"),
            excerpt: item.excerpt || null,
            author_id: item.author_id || users[0]?.id || "",
            category: item.category || null,
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(",").map((t: string) => t.trim())) : [],
            status: item.status || "draft",
            featured_image_url: item.featured_image_url || null,
            content: item.content || null,
          };

          await axios.post(`${apiUrl}/cms/blogs`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to import blog "${item.title}":`, err);
          errorCount++;
        }
      }

      setSuccess(`Imported ${successCount} blog post(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
      fetchBlogs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import blogs");
    } finally {
      setSubmitting(false);
    }
  };

  const validateBlog = (item: any): { valid: boolean; error?: string } => {
    if (!item.title || typeof item.title !== "string") {
      return { valid: false, error: "Title is required and must be a string" };
    }
    if (!item.author_id && (!users || users.length === 0)) {
      return { valid: false, error: "Author ID is required or users must be loaded" };
    }
    return { valid: true };
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${apiUrl}/cms/blogs/${deletingBlog.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletingBlog(null);
      setSuccess("Blog deleted successfully!");
      fetchBlogs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete blog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      author_id: users[0]?.id || "",
      category: "",
      tags: "",
      status: "draft",
      featured_image_url: "",
      content: null,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage your blog posts. Published posts will appear on your website.
          </p>
        </div>
        <div className="flex gap-3">
          <AnimatedButton
            onClick={() => setShowJsonImport(true)}
            variant="secondary"
          >
            📥 Import JSON
          </AnimatedButton>
          <AnimatedButton
            onClick={() => {
              setFormData({
                title: "",
                slug: "",
                excerpt: "",
                author_id: users[0]?.id || "",
                category: "",
                tags: "",
                status: "draft",
                featured_image_url: "",
                content: null,
              });
              setShowModal(true);
            }}
            variant="primary"
          >
            + Add Blog Post
          </AnimatedButton>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading blogs...</span>
        </div>
      ) : (
        <AnimatedCard>
          <AnimatedTable>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg mb-2">No blog posts yet</p>
                        <p className="text-sm">Click "Add Blog Post" to create your first blog post</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {blog.title}
                        </div>
                        {blog.excerpt && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {blog.excerpt}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {blog.category || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            blog.status
                          )}`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(blog.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {blog.status === "published" && (
                            <a
                              href={`/blogs/${blog.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-900"
                              title="View on Site"
                            >
                              🔗
                            </a>
                          )}
                          <button
                            onClick={() => setPreviewBlog(blog)}
                            className="text-green-600 hover:text-green-900"
                            title="Preview"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingBlog(blog)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AnimatedTable>
        </AnimatedCard>
      )}

      <AnimatedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog post title"
            />
            <p className="mt-1 text-xs text-gray-500">
              The title will be displayed on your website and in search results
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: generateSlug(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="blog-post-url-slug"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly version of the title (auto-generated from title)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the blog post (appears in listings)"
            />
            <p className="mt-1 text-xs text-gray-500">
              A short description that appears in blog listings and search results
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.author_id}
                onChange={(e) =>
                  setFormData({ ...formData, author_id: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Technology, Business"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL
            </label>
            <input
              type="url"
              value={formData.featured_image_url}
              onChange={(e) =>
                setFormData({ ...formData, featured_image_url: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL of the main image for this blog post
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "draft" | "published" | "archived",
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft (not visible to public)</option>
              <option value="published">Published (visible on website)</option>
              <option value="archived">Archived (hidden from public)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only published posts will appear on your website
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <AnimatedButton
              type="button"
              onClick={handleCloseModal}
              variant="secondary"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              disabled={submitting}
              variant="primary"
            >
              {submitting
                ? "Saving..."
                : editingBlog
                ? "Update Blog Post"
                : "Create Blog Post"}
            </AnimatedButton>
          </div>
        </form>
      </AnimatedModal>

      {deletingBlog && (
        <AnimatedModal
          isOpen={!!deletingBlog}
          onClose={() => setDeletingBlog(null)}
          title="Delete Blog Post"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{deletingBlog.title}"? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <AnimatedButton
              onClick={() => setDeletingBlog(null)}
              variant="secondary"
            >
              Cancel
            </AnimatedButton>
            <AnimatedButton onClick={handleDelete} variant="danger">
              Delete
            </AnimatedButton>
          </div>
        </AnimatedModal>
      )}

      <JSONImportModal
        isOpen={showJsonImport}
        onClose={() => setShowJsonImport(false)}
        onImport={handleJsonImport}
        title="Blog Posts"
        exampleJSON={JSON.stringify([
          {
            title: "Getting Started with Next.js",
            slug: "getting-started-with-nextjs",
            excerpt: "Learn the basics of Next.js framework",
            author_id: users[0]?.id || "",
            category: "Tutorial",
            tags: ["nextjs", "react", "web development"],
            status: "published",
            featured_image_url: "",
            content: null
          },
          {
            title: "Best Practices for React Development",
            slug: "react-best-practices",
            excerpt: "Essential tips for writing better React code",
            author_id: users[0]?.id || "",
            category: "Development",
            tags: ["react", "javascript", "best practices"],
            status: "published",
            featured_image_url: "",
            content: null
          }
        ], null, 2)}
        validateItem={validateBlog}
      />

      {previewBlog && (
        <PreviewModal
          isOpen={!!previewBlog}
          onClose={() => setPreviewBlog(null)}
          content={{
            type: "blog",
            data: previewBlog,
          }}
          url={`${getSiteUrl()}/blogs/${previewBlog.slug}`}
        />
      )}
    </div>
  );
}
