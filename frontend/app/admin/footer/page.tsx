"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";

const DEFAULT_FOOTER = {
  columns: [
    { title: "Links", links: [{ label: "Services", href: "/services" }, { label: "Blogs", href: "/blogs" }, { label: "Case Studies", href: "/case-studies" }] },
  ],
  copyright_text: "© {year} Social IT. All rights reserved.",
  styling: { background_color: "#f3f4f6", text_color: "#6b7280", link_color: "#6366f1" },
};

export default function AdminFooterPage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/cms/site-settings/footer")
      .then((r) => setJson(JSON.stringify(r.data ?? DEFAULT_FOOTER, null, 2)))
      .catch(() => setJson(JSON.stringify(DEFAULT_FOOTER, null, 2)))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    try {
      const config = JSON.parse(json) as Record<string, unknown>;
      setError("");
      setSaving(true);
      api
        .put("/cms/site-settings/footer", config)
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
        <div className="text-slate-500">Loading footer...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Footer</h1>
        <p className="text-slate-500 text-sm mt-1">Edit footer config (JSON). Columns (title, links), copyright_text (use {"{year}"}), styling.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-64 font-mono text-sm border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          spellCheck={false}
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved.</span>}
        </div>
      </div>
    </div>
  );
}
