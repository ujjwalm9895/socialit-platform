"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../api-client";

const DEFAULT_JSON = {
  enabled: true,
  title: "Artificial Intelligence & Machine Learning Solutions",
  overview: "We help enterprises harness the power of AI and machine learning to automate processes, gain insights from data, and deliver smarter products. Our team designs, builds, and deploys solutions tailored to your industry and goals.",
  services: [
    { title: "Custom Machine Learning Model Development", description: "Bespoke models trained on your data for classification, regression, or clustering." },
    { title: "AI Chatbot & Virtual Assistant Development", description: "Conversational agents for support, sales, and internal workflows." },
    { title: "Computer Vision Solutions", description: "Image and video analysis, object detection, and quality inspection systems." },
    { title: "Predictive Analytics & Forecasting", description: "Demand, risk, and performance forecasting using historical and real-time data." },
    { title: "Recommendation Engine Development", description: "Personalised product, content, and next-best-action recommendations." },
    { title: "MLOps & Model Deployment Services", description: "Pipelines, monitoring, and scalable deployment of models in production." },
  ],
  products: [
    { title: "AI Business Analytics Dashboard", description: "Unified view of KPIs with natural-language queries and automated insights." },
    { title: "No-Code AI Model Builder", description: "Train and deploy simple models without writing code." },
    { title: "AI Image Analyzer Tool", description: "Tagging, moderation, and extraction of metadata from images." },
    { title: "Website Chatbot Plugin", description: "Drop-in chat widget with custom knowledge base and routing." },
    { title: "Resume Screening AI Tool", description: "Shortlist candidates by skills, experience, and fit." },
  ],
  benefits: [
    "Higher efficiency through automation of repetitive and rule-based tasks.",
    "Data-driven decisions with accurate forecasting and real-time analytics.",
    "Improved customer experience via chatbots and personalised recommendations.",
    "Faster time-to-market for AI features with MLOps and reusable components.",
    "Scalable, secure deployment aligned with your infrastructure and compliance needs.",
  ],
  cta_text: "Talk to Our AI Experts",
  cta_link: "/contact",
};

export default function AdminServicesAIMLSectionPage() {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get("/cms/site-settings/services-ai-ml-section")
      .then((r) => setJson(JSON.stringify(r.data ?? DEFAULT_JSON, null, 2)))
      .catch(() => setJson(JSON.stringify(DEFAULT_JSON, null, 2)))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    try {
      const config = JSON.parse(json) as Record<string, unknown>;
      setError("");
      setSaving(true);
      api
        .put("/cms/site-settings/services-ai-ml-section", config)
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
      <div className="flex items-center gap-4">
        <Link href="/admin/services" className="text-slate-600 hover:text-slate-900 text-sm font-medium">← Services</Link>
        <h1 className="text-2xl font-bold text-slate-900">Services: AI & Machine Learning block</h1>
      </div>
      <p className="text-slate-500 text-sm">
        This block is part of the Services page. It appears as a standalone section on the public <a href="/services" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Services</a> page. Set <code className="bg-slate-100 px-1 rounded">enabled</code> to <code className="bg-slate-100 px-1 rounded">false</code> to hide it. Edit the JSON below and click Save.
      </p>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="w-full h-[480px] font-mono text-sm border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-primary"
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
      <div className="text-xs text-slate-400">
        Structure: <code>enabled</code>, <code>title</code>, <code>overview</code>, <code>services</code> (array of {"{ title, description }"}), <code>products</code> (array of {"{ title, description }"}), <code>benefits</code> (array of strings), <code>cta_text</code>, <code>cta_link</code>.
      </div>
    </div>
  );
}
