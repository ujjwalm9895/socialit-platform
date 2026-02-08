"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";
import ColorField from "../components/ColorField";

const THEME_KEYS = [
  { key: "primary", label: "Primary", description: "Main brand, buttons, links" },
  { key: "secondary", label: "Secondary", description: "Accents, secondary buttons" },
  { key: "accent", label: "Accent", description: "Highlights, hover states" },
  { key: "background", label: "Background", description: "Page background" },
  { key: "surface", label: "Surface", description: "Cards, panels" },
  { key: "text", label: "Text", description: "Primary text" },
  { key: "textSecondary", label: "Text secondary", description: "Muted text" },
  { key: "border", label: "Border", description: "Borders, dividers" },
  { key: "success", label: "Success", description: "Success states" },
  { key: "warning", label: "Warning", description: "Warnings" },
  { key: "error", label: "Error", description: "Errors" },
  { key: "info", label: "Info", description: "Info messages" },
] as const;

const DEFAULT_THEME: Record<string, string> = {
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
  const [theme, setTheme] = useState<Record<string, string>>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, string>>("/cms/site-settings/theme")
      .then((r) => setTheme({ ...DEFAULT_THEME, ...(r.data ?? {}) }))
      .catch(() => setTheme(DEFAULT_THEME))
      .finally(() => setLoading(false));
  }, []);

  const setColor = (key: string, value: string) => setTheme((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    setError("");
    setSaving(true);
    api
      .put("/cms/site-settings/theme", theme)
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch((err) => setError(err.response?.data?.detail ?? "Failed to save"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500">Loading theme…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theme</h1>
          <p className="text-slate-500 text-sm mt-1">Set colors for the whole site. Changes apply globally.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save theme"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          Theme saved.
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {THEME_KEYS.map(({ key, label, description }) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <ColorField
              label={label}
              value={theme[key] ?? DEFAULT_THEME[key] ?? "#ffffff"}
              onChange={(v) => setColor(key, v)}
              description={description}
            />
          </div>
        ))}
      </div>

      <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
        <p className="text-sm font-medium text-slate-700 mb-3">Preview</p>
        <div className="flex flex-wrap gap-4">
          <div
            className="rounded-xl px-4 py-2 text-white font-medium text-sm shadow-sm"
            style={{ backgroundColor: theme.primary }}
          >
            Primary
          </div>
          <div
            className="rounded-xl px-4 py-2 text-white font-medium text-sm shadow-sm"
            style={{ backgroundColor: theme.secondary }}
          >
            Secondary
          </div>
          <div
            className="rounded-xl px-4 py-2 font-medium text-sm border-2"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }}
          >
            Surface
          </div>
          <div
            className="rounded-xl px-4 py-2 font-medium text-sm"
            style={{ color: theme.success }}
          >
            Success
          </div>
        </div>
      </div>
    </div>
  );
}
