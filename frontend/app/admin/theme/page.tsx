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

  if (loading) return <p className="text-gray-500">Loading theme...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Theme</h1>
      <p className="text-sm text-gray-500">Edit theme colors (JSON). Keys: primary, secondary, accent, background, surface, text, textSecondary, border, success, warning, error, info.</p>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full h-64 font-mono text-sm border border-gray-300 rounded-lg p-3"
        spellCheck={false}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved.</span>}
      </div>
    </div>
  );
}
