"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";

const DEFAULT_THEME = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#6366f1",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

export default function AdminThemePage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, string>>("/cms/site-settings/theme")
      .then((r) => setJson(JSON.stringify(r.data ?? DEFAULT_THEME, null, 2)))
      .catch(() => setJson(JSON.stringify(DEFAULT_THEME, null, 2)))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    try {
      const config = JSON.parse(json) as Record<string, string>;
      setError("");
      setSaving(true);
      api
        .put("/cms/site-settings/theme", config)
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
        <div className="text-slate-500">Loading theme...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Theme</h1>
        <p className="text-slate-500 text-sm mt-1">Edit theme colors (JSON). Keys: primary, secondary, accent, background, surface, text, textSecondary, border, success, warning, error, info.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-64 font-mono text-sm border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary"
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
