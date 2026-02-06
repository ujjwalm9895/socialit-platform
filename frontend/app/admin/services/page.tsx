"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import PreviewModal from "../../../components/PreviewModal";
import { AnimatedTable } from "../../../components/AnimatedTable";
import AnimatedButton from "../../../components/AnimatedButton";
import AnimatedModal from "../../../components/AnimatedModal";
import AnimatedCard from "../../../components/AnimatedCard";
import Toast from "../../../components/Toast";
import Tooltip from "../../../components/Tooltip";
import JSONImportModal from "../../../components/JSONImportModal";
import { apiUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/env";

interface Service {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

interface ServiceFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  status: "draft" | "published" | "archived";
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [previewService, setPreviewService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    status: "draft",
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${apiUrl}/cms/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        ...formData,
        subtitle: formData.subtitle || null,
        description: formData.description || null,
      };

      if (editingService) {
        await axios.put(
          `${apiUrl}/cms/services/${editingService.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(`${apiUrl}/cms/services`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({
        title: "",
        slug: "",
        subtitle: "",
        description: "",
        status: "draft",
      });
      setSuccess(editingService ? "Service updated successfully!" : "Service created successfully!");
      setToastType("success");
      setShowToast(true);
      fetchServices();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to save service";
      setError(errorMsg);
      setToastType("error");
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      subtitle: service.subtitle || "",
      description: service.description || "",
      status: service.status,
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingService) return;

    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${apiUrl}/cms/services/${deletingService.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletingService(null);
      setSuccess("Service deleted successfully!");
      setToastType("success");
      setShowToast(true);
      fetchServices();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to delete service";
      setError(errorMsg);
      setToastType("error");
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      title: "",
      slug: "",
      subtitle: "",
      description: "",
      status: "draft",
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

  const validateService = (item: any): { valid: boolean; error?: string } => {
    if (!item.title || typeof item.title !== "string") {
      return { valid: false, error: "Title is required and must be a string" };
    }
    return { valid: true };
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
            subtitle: item.subtitle || null,
            description: item.description || null,
            status: item.status || "draft",
          };

          await axios.post(`${apiUrl}/cms/services`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          successCount++;
        } catch (err: any) {
          console.error(`Failed to import service "${item.title}":`, err);
          errorCount++;
        }
      }

      setError("");
      setShowJsonImport(false);
      await fetchServices();
      if (successCount > 0) {
        setSuccess(`Imported ${successCount} service(s)${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
        setToastType("success");
        setShowToast(true);
      }
      if (errorCount > 0 && successCount === 0) {
        setError(`Import failed for all ${errorCount} item(s). Check console for details.`);
        setToastType("error");
        setShowToast(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import services");
      setToastType("error");
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your services content. Published services will appear on your website.
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
              setEditingService(null);
              setFormData({
                title: "",
                slug: "",
                subtitle: "",
                description: "",
                status: "draft",
              });
              setShowModal(true);
            }}
            variant="primary"
          >
            + Add Service
          </AnimatedButton>
        </div>
      </div>

      <Toast
        message={success || error}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {error && !loading && !showToast && (
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading services...</span>
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
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">No services yet</p>
                      <p className="text-sm">Click "Add Service" to create your first service</p>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{service.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          service.status
                        )}`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(service.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {service.status === "published" && (
                        <a
                          href={`/services/${service.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-900 mr-4"
                          title="View on Site"
                        >
                          🔗 View
                        </a>
                      )}
                      <button
                        onClick={() => setPreviewService(service)}
                        className="text-green-600 hover:text-green-900 mr-4"
                        title="Preview"
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingService(service)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
        title={editingService ? "Edit Service" : "Create New Service"}
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
              placeholder="e.g., Web Development"
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
              disabled={!!editingService}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-sm"
              placeholder="web-development"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly version (auto-generated from title)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief subtitle or tagline"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional short description that appears below the title
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the service..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Full description of what this service includes
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
              Only published services will appear on your website
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
              type="button"
              onClick={() => {
                const previewData: Service = {
                  id: editingService?.id || "",
                  title: formData.title,
                  slug: formData.slug,
                  subtitle: formData.subtitle,
                  description: formData.description,
                  status: formData.status,
                  created_at: editingService?.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setPreviewService(previewData);
              }}
              variant="secondary"
            >
              👁️ Preview
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              disabled={submitting}
              variant="primary"
            >
              {submitting
                ? "Saving..."
                : editingService
                ? "Update Service"
                : "Create Service"}
            </AnimatedButton>
          </div>
        </form>
      </AnimatedModal>

      {deletingService && (
        <AnimatedModal
          isOpen={!!deletingService}
          onClose={() => setDeletingService(null)}
          title="Delete Service"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "{deletingService.title}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <AnimatedButton
              onClick={() => setDeletingService(null)}
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
        title="Services"
        exampleJSON={JSON.stringify([
          {
            title: "Web Development",
            slug: "web-development",
            subtitle: "Custom web solutions",
            description: "We create stunning, responsive websites that drive results.",
            status: "published"
          },
          {
            title: "Mobile App Development",
            slug: "mobile-app-development",
            subtitle: "Native and cross-platform apps",
            description: "Transform your ideas into powerful mobile applications.",
            status: "published"
          }
        ], null, 2)}
        validateItem={validateService}
      />

      {previewService && (
        <PreviewModal
          isOpen={!!previewService}
          onClose={() => setPreviewService(null)}
          content={{
            type: "service",
            data: previewService,
          }}
          url={`${getSiteUrl()}/services/${previewService.slug}`}
        />
      )}
    </div>
  );
}
