"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { getSiteUrl } from "@/lib/env";
import DraggablePageBuilder from "../pages/draggable-page-builder";
import PreviewModal from "../../../components/PreviewModal";

interface HomepageSection {
  type: string;
  data: any;
  id: string;
}

interface HomepagePage {
  id?: string;
  title: string;
  slug: string;
  content: HomepageSection[];
  status: string;
}

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [homepagePage, setHomepagePage] = useState<HomepagePage | null>(null);


  useEffect(() => {
    loadHomepage();
  }, []);

  const loadHomepage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      // Try to get homepage by slug "home"
      try {
        const response = await apiClient.get(`/cms/pages/slug/home`);
        const page = response.data;
        setHomepagePage(page);
        if (page.content && Array.isArray(page.content) && page.content.length > 0) {
          // Ensure all sections have IDs
          const sectionsWithIds = page.content.map((s: any, idx: number) => ({
            ...s,
            id: s.id || `section-${idx}-${Date.now()}`,
          }));
          setSections(sectionsWithIds);
          console.log("✅ Loaded homepage with", sectionsWithIds.length, "sections");
        } else {
          setSections([]);
          console.log("⚠️ Homepage exists but has no sections");
        }
      } catch (err: any) {
        // If homepage doesn't exist, create a new one
        if (err.response?.status === 404) {
          console.log("Homepage not found, will create on first save");
          setHomepagePage({
            title: "Homepage",
            slug: "home",
            content: [],
            status: "published",
          });
          setSections([]);
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error("Failed to load homepage:", err);
      setError(err.response?.data?.detail || "Failed to load homepage");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const content = sections.map((s: any) => ({
        type: s.type,
        data: s.data ?? {},
        ...(s.id ? { id: s.id } : {}),
      }));
      const pageData = {
        title: "Homepage",
        slug: "home",
        content,
        status: homepagePage?.status || "published",
      };

      if (homepagePage?.id) {
        await apiClient.put(`/cms/pages/${homepagePage.id}`, pageData);
      } else {
        const response = await apiClient.post(`/cms/pages`, pageData);
        setHomepagePage(response.data);
      }

      setError("");
      alert("Homepage saved successfully!");
      await loadHomepage();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(", ")
        : typeof detail === "string"
        ? detail
        : err.response?.status === 401
        ? "Please log in again."
        : err.response?.status === 403
        ? "You don't have permission to edit the homepage."
        : "Failed to save homepage.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    // Use current sections from state (what user sees in builder)
    let previewSections = sections;
    
    // If sections state is empty, try to use saved homepage content
    if (previewSections.length === 0) {
      if (homepagePage?.content && Array.isArray(homepagePage.content) && homepagePage.content.length > 0) {
        previewSections = homepagePage.content;
      } else if (homepagePage?.id) {
        // Try to reload from API as last resort
        try {
          const response = await apiClient.get(`/cms/pages/${homepagePage.id}`);
          if (response.data.content && Array.isArray(response.data.content) && response.data.content.length > 0) {
            previewSections = response.data.content;
            // Update state with loaded sections
            setSections(response.data.content);
          }
        } catch (err) {
          console.error("Failed to load homepage for preview:", err);
        }
      }
    }
    
    if (previewSections.length === 0) {
      alert("No sections to preview. Please add sections to your homepage first using the page builder below.");
      return;
    }
    
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading homepage builder...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize your website homepage with drag-and-drop sections
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>📍 Published at:</span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline font-mono"
            >
              {getSiteUrl()}/
            </a>
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
          >
            <span>🌐</span>
            <span>View on Site</span>
          </a>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            👁️ Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Homepage"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-xl">ℹ️</span>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-900">Homepage Information</h3>
              {homepagePage?.status && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    homepagePage.status === "published"
                      ? "bg-green-100 text-green-800"
                      : homepagePage.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {homepagePage.status.toUpperCase()}
                </span>
              )}
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This homepage is published at the root URL of your website:{" "}
                <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">
                  {getSiteUrl()}/
                </code>
              </p>
              <p className="mt-2">
                Changes you make here will be visible on the public homepage. Use the{" "}
                <strong>"View on Site"</strong> button to see your changes live.
              </p>
              {homepagePage?.status === "draft" && (
                <p className="mt-2 text-yellow-700 font-medium">
                  ⚠️ This homepage is currently in draft mode. Change status to "published" to make it visible on the site.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status and Settings */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Homepage Status
            </label>
            <select
              value={homepagePage?.status || "published"}
              onChange={(e) => {
                if (homepagePage) {
                  setHomepagePage({
                    ...homepagePage,
                    status: e.target.value,
                  });
                }
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>URL:</strong>{" "}
              <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                {getSiteUrl()}/
              </code>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {sections.length === 0 && !loading && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>No sections yet.</strong> Click "Add Section" below to start building your homepage.
            </p>
          </div>
        )}
        {sections.length > 0 && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{sections.length} section{sections.length !== 1 ? 's' : ''}</strong> in your homepage. 
              Click "Preview" to see how it looks.
            </p>
          </div>
        )}
        <DraggablePageBuilder
          sections={sections}
          onSectionsChange={(newSections) => {
            setSections(newSections);
            console.log("Sections updated:", newSections.length);
          }}
        />
      </div>

      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          content={{
            type: "page",
            data: {
              title: "Homepage Preview",
              content: (() => {
                // Always use current sections from builder state
                const previewSections = sections.length > 0 
                  ? sections 
                  : (homepagePage?.content || []);
                console.log("Preview sections:", previewSections.length, previewSections);
                return previewSections;
              })(),
            },
          }}
          url={`${getSiteUrl()}/`}
          isHomepage={true}
        />
      )}
    </div>
  );
}
