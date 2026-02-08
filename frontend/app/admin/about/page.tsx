"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../api-client";
import SortableList from "../components/SortableList";

type StatItem = { value?: string; label?: string };
type WhatSetsApartItem = { title?: string; text?: string };
type TeamItem = { name?: string; role?: string; image_url?: string };

type AboutData = {
  heading?: string; intro?: string; stats_heading?: string; stats_subtext?: string; stats?: StatItem[];
  journey_heading?: string; journey_subheading?: string; journey_text?: string;
  vision_heading?: string; vision_subheading?: string; vision_text?: string;
  what_sets_apart_heading?: string; what_sets_apart_subheading?: string; what_sets_apart_items?: WhatSetsApartItem[];
  team_heading?: string; team_subheading?: string; team?: TeamItem[];
  cta_text?: string; cta_link?: string;
};

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<AboutData>("/cms/site-settings/about-page").then((r) => setData(r.data ?? {})).catch(() => setData({})).finally(() => setLoading(false));
  }, []);

  const set = (key: keyof AboutData, value: unknown) => setData((prev) => ({ ...prev, [key]: value }));
  const stats = data.stats ?? [];
  const setStats = (items: StatItem[]) => set("stats", items);
  const items = data.what_sets_apart_items ?? [];
  const setItems = (list: WhatSetsApartItem[]) => set("what_sets_apart_items", list);
  const team = data.team ?? [];
  const setTeam = (list: TeamItem[]) => set("team", list);

  const save = () => {
    setError("");
    setSaving(true);
    api.put("/cms/site-settings/about-page", data).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }).catch((err) => setError(err.response?.data?.detail ?? "Failed to save")).finally(() => setSaving(false));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-slate-500">Loading...</div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">About page</h1>
          <p className="text-slate-500 text-sm mt-1">Content for /about. Edit below and save.</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/about" target="_blank" rel="noopener noreferrer" className="shrink-0 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50">View page →</a>
          <button type="button" onClick={save} disabled={saving} className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">Saved.</div>}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="space-y-6">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Heading</label><input value={data.heading ?? ""} onChange={(e) => set("heading", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="About Us" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Intro</label><textarea value={data.intro ?? ""} onChange={(e) => set("intro", e.target.value)} rows={4} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Short introduction..." /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Stats heading</label><input value={data.stats_heading ?? ""} onChange={(e) => set("stats_heading", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Let's talk numbers" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Stats subtext</label><input value={data.stats_subtext ?? ""} onChange={(e) => set("stats_subtext", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Optional" /></div>
          <SortableList items={stats} setItems={setStats} getItemId={(_, i) => "stat-" + i} renderItem={(item, index) => <div className="flex gap-2 w-full"><input value={item.value ?? ""} onChange={(e) => { const n = [...stats]; n[index] = { ...n[index], value: e.target.value }; setStats(n); }} placeholder="150+" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" /><input value={item.label ?? ""} onChange={(e) => { const n = [...stats]; n[index] = { ...n[index], label: e.target.value }; setStats(n); }} placeholder="Label" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" /></div>} onAdd={() => setStats([...stats, { value: "", label: "" }])} addLabel="Stat" emptyMessage="No stats." title="Stats (drag to reorder)" />
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Journey heading</label><input value={data.journey_heading ?? ""} onChange={(e) => set("journey_heading", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Our Journey" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Journey text</label><textarea value={data.journey_text ?? ""} onChange={(e) => set("journey_text", e.target.value)} rows={3} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Your story..." /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Vision heading</label><input value={data.vision_heading ?? ""} onChange={(e) => set("vision_heading", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Our Vision" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Vision text</label><textarea value={data.vision_text ?? ""} onChange={(e) => set("vision_text", e.target.value)} rows={3} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Your vision..." /></div>
          <SortableList items={items} setItems={setItems} getItemId={(_, i) => "wsa-" + i} renderItem={(item, index) => <div className="space-y-2 w-full"><input value={item.title ?? ""} onChange={(e) => { const n = [...items]; n[index] = { ...n[index], title: e.target.value }; setItems(n); }} placeholder="Title" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /><textarea value={item.text ?? ""} onChange={(e) => { const n = [...items]; n[index] = { ...n[index], text: e.target.value }; setItems(n); }} placeholder="Description" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></div>} onAdd={() => setItems([...items, { title: "", text: "" }])} addLabel="Item" emptyMessage="No items." title="What sets apart (drag to reorder)" />
          <SortableList items={team} setItems={setTeam} getItemId={(_, i) => "team-" + i} renderItem={(item, index) => <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full"><input value={item.name ?? ""} onChange={(e) => { const n = [...team]; n[index] = { ...n[index], name: e.target.value }; setTeam(n); }} placeholder="Name" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" /><input value={item.role ?? ""} onChange={(e) => { const n = [...team]; n[index] = { ...n[index], role: e.target.value }; setTeam(n); }} placeholder="Role" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" /><input value={item.image_url ?? ""} onChange={(e) => { const n = [...team]; n[index] = { ...n[index], image_url: e.target.value }; setTeam(n); }} placeholder="Image URL" type="url" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" /></div>} onAdd={() => setTeam([...team, { name: "", role: "", image_url: "" }])} addLabel="Team member" emptyMessage="No team members." title="Team (drag to reorder)" />
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA button text</label><input value={data.cta_text ?? ""} onChange={(e) => set("cta_text", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="Contact Us" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">CTA button link</label><input value={data.cta_link ?? ""} onChange={(e) => set("cta_link", e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5" placeholder="/contact" /></div>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <button type="button" onClick={save} disabled={saving} className="btn-flashy bg-primary text-white px-5 py-2.5 rounded-xl font-medium disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Saved.</span>}
        </div>
      </div>
      <p className="text-xs text-slate-400">Use drag handles to reorder stats, what sets apart items, and team members. Save to update /about.</p>
    </div>
  );
}
