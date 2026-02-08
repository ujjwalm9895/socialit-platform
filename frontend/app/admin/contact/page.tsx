"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";

type ContactInfo = {
  heading?: string;
  subtext?: string;
  email?: string;
  addresses?: string[];
  phones?: string[];
  whatsapp_number?: string;
  whatsapp_text?: string;
  show_contact_form?: boolean;
  form_heading?: string;
};

export default function AdminContactPage() {
  const [data, setData] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<ContactInfo>("/cms/site-settings/contact-info")
      .then((r) => setData(r.data ?? {}))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof ContactInfo, value: unknown) => setData((prev) => ({ ...prev, [key]: value }));

  const addresses = data.addresses ?? [];
  const setAddresses = (arr: string[]) => set("addresses", arr);
  const phones = data.phones ?? [];
  const setPhones = (arr: string[]) => set("phones", arr);

  const save = () => {
    setError("");
    setSaving(true);
    api
      .put("/cms/site-settings/contact-info", data)
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
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact info</h1>
          <p className="text-slate-500 text-sm mt-1">Used on the Contact page (/contact).</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
          >
            View page →
          </a>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">Saved.</div>}

      {/* Hero */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Page header</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Heading</label>
            <input
              value={data.heading ?? ""}
              onChange={(e) => set("heading", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Contact us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtext</label>
            <textarea
              value={data.subtext ?? ""}
              onChange={(e) => set("subtext", e.target.value)}
              rows={2}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Get in touch..."
            />
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={data.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Addresses (one per line or add below)</label>
            <div className="space-y-2">
              {addresses.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={a}
                    onChange={(e) => setAddresses(addresses.map((x, j) => (j === i ? e.target.value : x)))}
                    className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Address line"
                  />
                  <button
                    type="button"
                    onClick={() => setAddresses(addresses.filter((_, j) => j !== i))}
                    className="px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAddresses([...addresses, ""])}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add address
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phones</label>
            <div className="space-y-2">
              {phones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={p}
                    onChange={(e) => setPhones(phones.map((x, j) => (j === i ? e.target.value : x)))}
                    className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+1 234 567 8900"
                  />
                  <button
                    type="button"
                    onClick={() => setPhones(phones.filter((_, j) => j !== i))}
                    className="px-3 py-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setPhones([...phones, ""])}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add phone
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">WhatsApp</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp number</label>
            <input
              value={data.whatsapp_number ?? ""}
              onChange={(e) => set("whatsapp_number", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="1234567890 (with country code, no +)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Button text</label>
            <input
              value={data.whatsapp_text ?? ""}
              onChange={(e) => set("whatsapp_text", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Let's Chat"
            />
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact form</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.show_contact_form !== false}
              onChange={(e) => set("show_contact_form", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-700">Show contact form on page</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Form heading</label>
            <input
              value={data.form_heading ?? ""}
              onChange={(e) => set("form_heading", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Send us a message"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
