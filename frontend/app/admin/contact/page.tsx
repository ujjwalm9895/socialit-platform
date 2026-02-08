"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

export default function AdminContactPage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/cms/site-settings/contact-info")
      .then((r) => setJson(JSON.stringify(r.data ?? {}, null, 2)))
      .catch(() => setJson("{}"))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    try {
      const config = JSON.parse(json) as Record<string, unknown>;
      setError("");
      setSaving(true);
      api
        .put("/cms/site-settings/contact-info", config)
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
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact info</h1>
          <p className="text-slate-500 text-sm mt-1">Email, addresses, phones, WhatsApp. Used on the Contact page (/contact).</p>
        </div>
        <a href="/contact" target="_blank" rel="noopener noreferrer" className="btn-flashy shrink-0 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark">
          View page →
        </a>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-80 font-mono text-sm border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary"
          spellCheck={false}
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        <div className="flex items-center gap-3 mt-4">
          <button type="button" onClick={save} disabled={saving} className="btn-flashy bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved.</span>}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        Keys: heading, subtext, email, addresses (array of strings), phones (array), whatsapp_number, whatsapp_text, show_contact_form (boolean), form_heading.
      </p>
    </div>
  );
}
