"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import PreviewModal from "../../../components/PreviewModal";
import DraggablePageBuilder from "./draggable-page-builder";
import AnimatedModal from "../../../components/AnimatedModal";
import AnimatedButton from "../../../components/AnimatedButton";
import { AnimatedTable, AnimatedTableRow } from "../../../components/AnimatedTable";
import { motion } from "framer-motion";
import JSONImportModal from "../../../components/JSONImportModal";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: Array<{ type: string; data: any }>;
  template?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

interface PageSection {
  type: string;
  data: any;
  id?: string;
}

interface PageFormData {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  sections: PageSection[];
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [formData, setFormData] = useState<PageFormData>({
    title: "",
    slug: "",
    status: "draft",
    sections: [],
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/cms/pages");
      setPages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const content = formData.sections.map((s: any) => ({
        type: s.type,
        data: s.data ?? {},
        ...(s.id ? { id: s.id } : {}),
      }));
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        status: formData.status,
        content,
      };

      if (editingPageId) {
        await apiClient.put(`/cms/pages/${editingPageId}`, payload);
      } else {
        await apiClient.post("/cms/pages", payload);
      }

      setShowModal(false);
      setEditingPageId(null);
      setFormData({
        title: "",
        slug: "",
        status: "draft",
        sections: [],
      });
      setError("");
      await fetchPages();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(", ")
        : typeof detail === "string"
        ? detail
        : err.response?.status === 401
        ? "Please log in again."
        : err.response?.status === 403
        ? "You don't have permission to edit pages."
        : "Failed to save page.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJsonImport = async (items: any[]) => {
    setSubmitting(true);
    setError("");
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          const payload = {
            title: item.title,
            slug: item.slug || item.title.toLowerCase().replace(/\s+/g, "-"),
            status: item.status || "draft",
            content: item.content || item.sections || [],
          };

          await apiClient.post("/cms/pages", payload);
          successCount++;
        } catch (err: any) {
          console.error(`Failed to import page "${item.title}":`, err);
          errorCount++;
        }
      }

      setError("");
      await fetchPages();
      if (successCount > 0) {
        setError(`Imported ${successCount} page(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import pages");
    } finally {
      setSubmitting(false);
    }
  };

  const validatePage = (item: any): { valid: boolean; error?: string } => {
    if (!item.title || typeof item.title !== "string") {
      return { valid: false, error: "Title is required and must be a string" };
    }
    return { valid: true };
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
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your pages with the page builder
          </p>
        </div>
        <AnimatedButton
          onClick={() => {
            setError("");
            setEditingPageId(null);
            setFormData({
              title: "",
              slug: "",
              status: "draft",
              sections: [],
            });
            setShowModal(true);
          }}
          variant="primary"
        >
          + Add Page
        </AnimatedButton>
      </div>

      {error && !loading && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading pages...</div>
        </div>
      ) : (
        <AnimatedTable>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
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
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No pages found
                  </td>
                </tr>
              ) : (
                pages.map((page, index) => (
                  <AnimatedTableRow key={page.id} index={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {page.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{page.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          page.status
                        )}`}
                      >
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {page.status === "published" && (
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 mr-4"
                          title="View on Site"
                        >
                          🔗 View
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setError("");
                          setEditingPageId(page.id);
                          const rawContent = page.content;
                          const sectionsList = Array.isArray(rawContent)
                            ? rawContent
                            : rawContent && typeof rawContent === "object"
                              ? [rawContent]
                              : [];
                          setFormData({
                            title: page.title,
                            slug: page.slug,
                            status: page.status,
                            sections: sectionsList.map((s: any, idx: number) => ({
                              type: s?.type ?? "raw",
                              data: s?.data ?? s ?? {},
                              id: s?.id || `section-${idx}`,
                            })),
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setPreviewPage(page)}
                        className="text-green-600 hover:text-green-900 mr-4"
                        title="Preview"
                      >
                        👁️ Preview
                      </button>
                    </td>
                  </AnimatedTableRow>
                ))
              )}
            </tbody>
            </table>
          </div>
        </AnimatedTable>
      )}

      <JSONImportModal
        isOpen={showJsonImport}
        onClose={() => setShowJsonImport(false)}
        onImport={handleJsonImport}
        title="Pages"
        exampleJSON={JSON.stringify([
          {
            title: "About Us",
            slug: "about",
            status: "published",
            content: [
              {
                type: "hero",
                data: {
                  heading: "About Our Company",
                  subheading: "We are a team of passionate developers",
                }
              }
            ]
          }
        ], null, 2)}
        validateItem={validatePage}
      />

      {previewPage && (
        <PreviewModal
          isOpen={!!previewPage}
          onClose={() => setPreviewPage(null)}
          content={{
            type: "page",
            data: previewPage,
          }}
        />
      )}

      {showModal && (
        <AnimatedModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPageId(null);
            setFormData({
              title: "",
              slug: "",
              status: "draft",
              sections: [],
            });
          }}
          title={editingPageId ? "Edit Page" : "Add New Page"}
          size="xl"
          closeOnBackdropClick={false}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="page-slug"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier (e.g., "about-us", "contact")
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Page Sections
                </label>
                <DraggablePageBuilder
                  sections={formData.sections.map((s, idx) => ({
                    ...s,
                    id: s.id || `section-${idx}`,
                  }))}
                  onSectionsChange={(newSections) => {
                    // Use functional update to avoid stale closure
                    setFormData((prev) => {
                      const newSectionsStr = JSON.stringify(newSections.map((s) => ({
                        type: s.type,
                        data: s.data,
                        id: s.id,
                      })));
                      const prevSectionsStr = JSON.stringify(prev.sections);
                      
                      // Only update if sections actually changed
                      if (newSectionsStr !== prevSectionsStr) {
                        return {
                          ...prev,
                          sections: newSections.map((s) => ({
                            type: s.type,
                            data: s.data,
                            id: s.id,
                          })),
                        };
                      }
                      return prev;
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <AnimatedButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingPageId(null);
                  setFormData({
                    title: "",
                    slug: "",
                    status: "draft",
                    sections: [],
                  });
                }}
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editingPageId ? "Update Page" : "Create Page"}
              </AnimatedButton>
            </div>
          </form>
        </AnimatedModal>
      )}
    </div>
  );
}
