"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import PreviewModal from "../../../components/PreviewModal";
import { AnimatedTable } from "../../../components/AnimatedTable";
import AnimatedButton from "../../../components/AnimatedButton";
import AnimatedModal from "../../../components/AnimatedModal";
import AnimatedCard from "../../../components/AnimatedCard";
import JSONImportModal from "../../../components/JSONImportModal";
import { apiUrl } from "../../../lib/api";
import { getSiteUrl } from "../../../lib/env";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name?: string;
  excerpt?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  industry?: string;
  tags?: string[];
  status: "draft" | "published" | "archived";
  featured_image_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at: string;
}

interface CaseStudyFormData {
  title: string;
  slug: string;
  client_name: string;
  excerpt: string;
  challenge: string;
  solution: string;
  results: string;
  industry: string;
  tags: string;
  status: "draft" | "published" | "archived";
  featured_image_url: string;
  gallery_images: string;
  content: any;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);
  const [deletingCaseStudy, setDeletingCaseStudy] = useState<CaseStudy | null>(null);
  const [previewCaseStudy, setPreviewCaseStudy] = useState<CaseStudy | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [formData, setFormData] = useState<CaseStudyFormData>({
    title: "",
    slug: "",
    client_name: "",
    excerpt: "",
    challenge: "",
    solution: "",
    results: "",
    industry: "",
    tags: "",
    status: "draft",
    featured_image_url: "",
    gallery_images: "",
    content: null,
  });

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/cms/case-studies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCaseStudies(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch case studies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
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
        gallery_images: formData.gallery_images
          ? formData.gallery_images.split(",").map((img) => img.trim()).filter(Boolean)
          : [],
        excerpt: formData.excerpt || null,
        client_name: formData.client_name || null,
        challenge: formData.challenge || null,
        solution: formData.solution || null,
        results: formData.results || null,
        industry: formData.industry || null,
        featured_image_url: formData.featured_image_url || null,
        content: formData.content || null,
      };

      if (editingCaseStudy) {
        await axios.put(
          `${apiUrl}/cms/case-studies/${editingCaseStudy.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSuccess("Case study updated successfully!");
      } else {
        await axios.post(`${apiUrl}/cms/case-studies`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess("Case study created successfully!");
      }
      setShowModal(false);
      setEditingCaseStudy(null);
      setFormData({
        title: "",
        slug: "",
        client_name: "",
        excerpt: "",
        challenge: "",
        solution: "",
        results: "",
        industry: "",
        tags: "",
        status: "draft",
        featured_image_url: "",
        gallery_images: "",
        content: null,
      });
      fetchCaseStudies();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save case study");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (caseStudy: CaseStudy) => {
    setEditingCaseStudy(caseStudy);
    setFormData({
      title: caseStudy.title,
      slug: caseStudy.slug,
      client_name: caseStudy.client_name || "",
      excerpt: caseStudy.excerpt || "",
      challenge: caseStudy.challenge || "",
      solution: caseStudy.solution || "",
      results: caseStudy.results || "",
      industry: caseStudy.industry || "",
      tags: caseStudy.tags?.join(", ") || "",
      status: caseStudy.status,
      featured_image_url: caseStudy.featured_image_url || "",
      gallery_images: caseStudy.gallery_images?.join(", ") || "",
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
            client_name: item.client_name || null,
            excerpt: item.excerpt || null,
            challenge: item.challenge || null,
            solution: item.solution || null,
            results: item.results || null,
            industry: item.industry || null,
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(",").map((t: string) => t.trim())) : [],
            status: item.status || "draft",
            featured_image_url: item.featured_image_url || null,
            gallery_images: item.gallery_images ? (Array.isArray(item.gallery_images) ? item.gallery_images : item.gallery_images.split(",").map((img: string) => img.trim())) : [],
            content: item.content || null,
          };

          await axios.post(`${apiUrl}/cms/case-studies`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to import case study "${item.title}":`, err);
          errorCount++;
        }
      }

      setSuccess(`Imported ${successCount} case study(ies)${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
      fetchCaseStudies();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import case studies");
    } finally {
      setSubmitting(false);
    }
  };

  const validateCaseStudy = (item: any): { valid: boolean; error?: string } => {
    if (!item.title || typeof item.title !== "string") {
      return { valid: false, error: "Title is required and must be a string" };
    }
    return { valid: true };
  };

  const handleDelete = async () => {
    if (!deletingCaseStudy) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${apiUrl}/cms/case-studies/${deletingCaseStudy.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletingCaseStudy(null);
      setSuccess("Case study deleted successfully!");
      fetchCaseStudies();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete case study");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCaseStudy(null);
    setFormData({
      title: "",
      slug: "",
      client_name: "",
      excerpt: "",
      challenge: "",
      solution: "",
      results: "",
      industry: "",
      tags: "",
      status: "draft",
      featured_image_url: "",
      gallery_images: "",
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
          <h1 className="text-3xl font-bold text-gray-900">Case Studies</h1>
          <p className="mt-2 text-sm text-gray-600">
            Showcase your successful projects and client work. Published case studies will appear on your website.
          </p>
        </div>
        <AnimatedButton
          onClick={() => {
            setFormData({
              title: "",
              slug: "",
              client_name: "",
              excerpt: "",
              challenge: "",
              solution: "",
              results: "",
              industry: "",
              tags: "",
              status: "draft",
              featured_image_url: "",
              gallery_images: "",
              content: null,
            });
            setShowModal(true);
          }}
          variant="primary"
        >
          + Add Case Study
        </AnimatedButton>
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
          <span className="ml-3 text-gray-600">Loading case studies...</span>
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
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
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
                {caseStudies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg mb-2">No case studies yet</p>
                        <p className="text-sm">Click "Add Case Study" to showcase your first project</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  caseStudies.map((caseStudy) => (
                    <tr key={caseStudy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {caseStudy.title}
                        </div>
                        {caseStudy.excerpt && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {caseStudy.excerpt}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {caseStudy.client_name || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {caseStudy.industry || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            caseStudy.status
                          )}`}
                        >
                          {caseStudy.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(caseStudy.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {caseStudy.status === "published" && (
                            <a
                              href={`/case-studies/${caseStudy.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-900"
                              title="View on Site"
                            >
                              🔗
                            </a>
                          )}
                          <button
                            onClick={() => setPreviewCaseStudy(caseStudy)}
                            className="text-green-600 hover:text-green-900"
                            title="Preview"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(caseStudy)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeletingCaseStudy(caseStudy)}
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
        title={editingCaseStudy ? "Edit Case Study" : "Create New Case Study"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
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
              placeholder="e.g., E-commerce Platform Redesign"
            />
            <p className="mt-1 text-xs text-gray-500">
              The main title of your case study
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
              placeholder="case-study-url-slug"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly version (auto-generated from title)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) =>
                  setFormData({ ...formData, client_name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., E-commerce, Healthcare"
              />
            </div>
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
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary (appears in listings)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              The Challenge
            </label>
            <textarea
              value={formData.challenge}
              onChange={(e) =>
                setFormData({ ...formData, challenge: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the problem or challenge the client faced..."
            />
            <p className="mt-1 text-xs text-gray-500">
              What problem were you solving?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Our Solution
            </label>
            <textarea
              value={formData.solution}
              onChange={(e) =>
                setFormData({ ...formData, solution: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explain your approach and solution..."
            />
            <p className="mt-1 text-xs text-gray-500">
              How did you solve the problem?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results
            </label>
            <textarea
              value={formData.results}
              onChange={(e) =>
                setFormData({ ...formData, results: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share the outcomes and achievements..."
            />
            <p className="mt-1 text-xs text-gray-500">
              What were the results? Include metrics if possible.
            </p>
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
              placeholder="web-design, e-commerce, ux"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gallery Images (URLs)
            </label>
            <textarea
              value={formData.gallery_images}
              onChange={(e) =>
                setFormData({ ...formData, gallery_images: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple image URLs with commas
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
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
                : editingCaseStudy
                ? "Update Case Study"
                : "Create Case Study"}
            </AnimatedButton>
          </div>
        </form>
      </AnimatedModal>

      {deletingCaseStudy && (
        <AnimatedModal
          isOpen={!!deletingCaseStudy}
          onClose={() => setDeletingCaseStudy(null)}
          title="Delete Case Study"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{deletingCaseStudy.title}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <AnimatedButton
              onClick={() => setDeletingCaseStudy(null)}
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
        title="Case Studies"
        exampleJSON={JSON.stringify([
          {
            title: "E-commerce Platform Redesign",
            slug: "ecommerce-platform-redesign",
            client_name: "TechCorp Inc",
            excerpt: "Complete redesign of e-commerce platform resulting in 300% increase in conversions",
            challenge: "Low conversion rates and poor user experience",
            solution: "Redesigned UI/UX with modern design patterns and improved checkout flow",
            results: "300% increase in conversions, 50% reduction in bounce rate",
            industry: "E-commerce",
            tags: ["web design", "e-commerce", "ui/ux"],
            status: "published",
            featured_image_url: "",
            gallery_images: [],
            content: null
          }
        ], null, 2)}
        validateItem={validateCaseStudy}
      />

      {previewCaseStudy && (
        <PreviewModal
          isOpen={!!previewCaseStudy}
          onClose={() => setPreviewCaseStudy(null)}
          content={{
            type: "case-study",
            data: previewCaseStudy,
          }}
          url={`${getSiteUrl()}/case-studies/${previewCaseStudy.slug}`}
        />
      )}
    </div>
  );
}
