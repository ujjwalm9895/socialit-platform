"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";

const DEFAULT_HEADER = {
  logo: { type: "text", text: "Social IT", subtext: "", image_url: "", position: "left", link: "/" },
  menu_items: [
    { id: "1", label: "Services", href: "/services", type: "link" },
    { id: "2", label: "Blogs", href: "/blogs", type: "link" },
    { id: "3", label: "Case Studies", href: "/case-studies", type: "link" },
    { id: "4", label: "Admin", href: "/admin/login", type: "link" },
  ],
  cta_button: { enabled: true, text: "Contact Us", href: "/contact", style: "solid", color: "#6366f1" },
  styling: { background_color: "#ffffff", text_color: "#111827", sticky: true, padding_top: 16, padding_bottom: 16 },
};

export default function AdminHeaderPage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/cms/site-settings/header")
      .then((r) => setJson(JSON.stringify(r.data ?? DEFAULT_HEADER, null, 2)))
      .catch(() => setJson(JSON.stringify(DEFAULT_HEADER, null, 2)))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    try {
      const config = JSON.parse(json) as Record<string, unknown>;
      setError("");
      setSaving(true);
      api
        .put("/cms/site-settings/header", config)
        .then(() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        })
        .catch((err) => setError(err.response?.data?.detail ?? "Failed to save"))
        .finally(() => setSaving(false));
    } catch {
      setError("Invalid JSON");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-500">Loading header...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Header</h1>
        <p className="text-slate-500 text-sm mt-1">Edit header config (JSON). Logo, menu_items, cta_button, styling.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-96 font-mono text-sm border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary"
          spellCheck={false}
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved.</span>}
        </div>
      </div>
    </div>
  );
}
