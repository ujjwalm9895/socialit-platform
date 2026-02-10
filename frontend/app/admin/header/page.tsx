"use client";

import { useEffect, useState } from "react";
import api from "../../api-client";
import ColorField from "../components/ColorField";
import SortableList from "../components/SortableList";
import type { MegaMenuColumn, MegaMenuFeatured } from "../../../components/SiteSettingsProvider";

type MenuItem = { id?: string; label?: string; href?: string; type?: string; open_in_new_tab?: boolean };
type HeaderConfig = {
  logo?: { type?: string; text?: string; subtext?: string; image_url?: string; link?: string };
  menu_items?: MenuItem[];
  cta_button?: { enabled?: boolean; text?: string; href?: string; style?: string; color?: string };
  styling?: { background_color?: string; text_color?: string; sticky?: boolean; padding_top?: number; padding_bottom?: number };
  mega_menu?: boolean;
  mega_menu_columns?: MegaMenuColumn[];
  mega_menu_featured?: MegaMenuFeatured | null;
};

const defaultConfig: HeaderConfig = {
  logo: { type: "text", text: "Social IT", subtext: "", image_url: "", link: "/" },
  menu_items: [
    { id: "1", label: "Services", href: "/services", type: "link" },
    { id: "2", label: "Blogs", href: "/blogs", type: "link" },
    { id: "3", label: "Case Studies", href: "/case-studies", type: "link" },
    { id: "4", label: "Contact", href: "/contact", type: "link" },
  ],
  cta_button: { enabled: true, text: "Contact Us", href: "/contact", style: "solid", color: "#6366f1" },
  styling: { background_color: "#ffffff", text_color: "#111827", sticky: true, padding_top: 16, padding_bottom: 16 },
  mega_menu: false,
  mega_menu_columns: [
    { title: "What We Do", links: [{ label: "Industries", href: "/industries" }, { label: "About Us", href: "/about" }, { label: "Careers", href: "/careers" }, { label: "Contact", href: "/contact" }] },
    { title: "Explore Our Services", links: [{ label: "Services", href: "/services" }, { label: "Case Studies", href: "/case-studies" }, { label: "Blogs", href: "/blogs" }] },
  ],
  mega_menu_featured: null,
};

export default function AdminHeaderPage() {
  const [config, setConfig] = useState<HeaderConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<HeaderConfig>("/cms/site-settings/header")
      .then((r) => setConfig({ ...defaultConfig, ...(r.data ?? {}) }))
      .catch(() => setConfig(defaultConfig))
      .finally(() => setLoading(false));
  }, []);

  const set = (path: string, value: unknown) => {
    const [a, b, c] = path.split(".");
    setConfig((prev) => {
      const next = { ...prev };
      if (b && c) {
        (next as Record<string, unknown>)[a] = { ...((next as Record<string, unknown>)[a] as object), [b]: { ...(((next as Record<string, unknown>)[a] as Record<string, unknown>)[b] as object), [c]: value } };
      } else if (b) {
        (next as Record<string, unknown>)[a] = { ...((next as Record<string, unknown>)[a] as object), [b]: value };
      } else {
        (next as Record<string, unknown>)[a] = value;
      }
      return next;
    });
  };

  const setLogo = (key: string, value: unknown) =>
    setConfig((prev) => ({ ...prev, logo: { ...(prev.logo ?? {}), [key]: value } }));
  const setStyling = (key: string, value: unknown) =>
    setConfig((prev) => ({ ...prev, styling: { ...(prev.styling ?? {}), [key]: value } }));
  const setCta = (key: string, value: unknown) =>
    setConfig((prev) => ({ ...prev, cta_button: { ...(prev.cta_button ?? {}), [key]: value } }));

  const menuItems = config.menu_items ?? [];
  const setMenuItems = (items: MenuItem[]) => setConfig((prev) => ({ ...prev, menu_items: items }));

  const save = () => {
    setError("");
    setSaving(true);
    api
      .put("/cms/site-settings/header", config)
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
        <p className="text-slate-500">Loading header…</p>
      </div>
    );
  }

  const logo = config.logo ?? {};
  const styling = config.styling ?? {};
  const cta = config.cta_button ?? {};
  const megaMenu = config.mega_menu ?? false;
  const megaColumns = config.mega_menu_columns ?? [];
  const megaFeatured = config.mega_menu_featured ?? null;

  const setMegaMenu = (v: boolean) => setConfig((p) => ({ ...p, mega_menu: v }));
  const setMegaColumns = (cols: MegaMenuColumn[]) => setConfig((p) => ({ ...p, mega_menu_columns: cols }));
  const setMegaFeatured = (f: MegaMenuFeatured | null) => setConfig((p) => ({ ...p, mega_menu_featured: f }));

  const updateMegaColumn = (i: number, upd: Partial<MegaMenuColumn>) => {
    const next = [...megaColumns];
    next[i] = { ...(next[i] ?? {}), ...upd };
    setMegaColumns(next);
  };
  const updateMegaColumnLink = (colIdx: number, linkIdx: number, upd: { label?: string; href?: string }) => {
    const next = [...megaColumns];
    const col = { ...(next[colIdx] ?? {}), links: [...(next[colIdx]?.links ?? [])] };
    col.links![linkIdx] = { ...(col.links![linkIdx] ?? {}), ...upd };
    next[colIdx] = col;
    setMegaColumns(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Header</h1>
          <p className="text-slate-500 text-sm mt-1">CMS-driven: logo, nav, mega menu, and CTA. Changes here are saved to the CMS and appear on the live site. Drag menu items to reorder.</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-flashy shrink-0 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save header"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">Saved.</div>}

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Logo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo link (URL)</label>
            <input
              value={logo.link ?? "/"}
              onChange={(e) => setLogo("link", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo type</label>
            <select
              value={logo.type ?? "text"}
              onChange={(e) => setLogo("type", e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
          </div>
          {logo.type === "image" ? (
            <>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={logo.image_url ?? ""}
                  onChange={(e) => setLogo("image_url", e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Alt text</label>
                <input
                  value={logo.text ?? ""}
                  onChange={(e) => setLogo("text", e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Company name"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Logo text</label>
                <input
                  value={logo.text ?? ""}
                  onChange={(e) => setLogo("text", e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Social IT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subtext (optional)</label>
                <input
                  value={logo.subtext ?? ""}
                  onChange={(e) => setLogo("subtext", e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Tagline"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Menu items - drag & drop */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Navigation menu</h2>
        <SortableList
          items={menuItems}
          setItems={setMenuItems}
          getItemId={(item, i) => item.id ?? `menu-${i}`}
          renderItem={(item, index) => (
            <div className="flex flex-wrap items-center gap-3 w-full">
              <input
                value={item.label ?? ""}
                onChange={(e) => {
                  const next = [...menuItems];
                  next[index] = { ...next[index], label: e.target.value };
                  setMenuItems(next);
                }}
                placeholder="Label"
                className="flex-1 min-w-[100px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              />
              <input
                value={item.href ?? ""}
                onChange={(e) => {
                  const next = [...menuItems];
                  next[index] = { ...next[index], href: e.target.value };
                  setMenuItems(next);
                }}
                placeholder="/path"
                className="flex-1 min-w-[100px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={!!item.open_in_new_tab}
                  onChange={(e) => {
                    const next = [...menuItems];
                    next[index] = { ...next[index], open_in_new_tab: e.target.checked };
                    setMenuItems(next);
                  }}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                New tab
              </label>
            </div>
          )}
          onAdd={() => setMenuItems([...menuItems, { id: `m-${Date.now()}`, label: "", href: "#", type: "link" }])}
          addLabel="Menu item"
          emptyMessage="No menu items. Add one above."
        />
      </div>

      {/* Mega menu (Zensar-style) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Mega menu</h2>
        <p className="text-slate-500 text-sm mb-4">Full-width overlay with nav columns and optional featured block. Edit columns and featured content to shape the menu. Saved to CMS and used on the live site.</p>
        <label className="flex items-center gap-2 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={megaMenu}
            onChange={(e) => setMegaMenu(e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-slate-700">Enable mega-menu style</span>
        </label>

        {megaMenu && (
          <div className="space-y-6 border-t border-slate-200 pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Columns (left side of overlay)</h3>
              <div className="space-y-4">
                {(megaColumns.length === 0 ? [{ title: "", links: [] }] : megaColumns).map((col, colIdx) => (
                  <div key={colIdx} className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        value={col.title ?? ""}
                        onChange={(e) => updateMegaColumn(colIdx, { title: e.target.value })}
                        placeholder="Column title (e.g. What We Do)"
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary"
                      />
                      {megaColumns.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setMegaColumns(megaColumns.filter((_, i) => i !== colIdx))}
                          className="text-slate-500 hover:text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 pl-0">
                      {(col.links?.length ? col.links : [{ label: "", href: "" }]).map((link, linkIdx) => (
                        <div key={linkIdx} className="flex gap-2">
                          <input
                            value={link.label ?? ""}
                            onChange={(e) => updateMegaColumnLink(colIdx, linkIdx, { label: e.target.value })}
                            placeholder="Label"
                            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                          <input
                            value={link.href ?? ""}
                            onChange={(e) => updateMegaColumnLink(colIdx, linkIdx, { href: e.target.value })}
                            placeholder="/path"
                            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...megaColumns];
                          const col = { ...(next[colIdx] ?? {}), links: [...(next[colIdx]?.links ?? []), { label: "", href: "" }] };
                          next[colIdx] = col;
                          setMegaColumns(next);
                        }}
                        className="text-sm text-primary font-medium"
                      >
                        + Add link
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMegaColumns([...megaColumns, { title: "", links: [] }])}
                  className="text-sm text-primary font-medium"
                >
                  + Add column
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Featured block (right side, optional)</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={megaFeatured != null}
                  onChange={(e) => setMegaFeatured(e.target.checked ? { title: "", description: "", link: "", link_text: "Read more" } : null)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600">Show featured block</span>
              </label>
              {megaFeatured != null && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Image URL</label>
                    <input
                      value={megaFeatured.image_url ?? ""}
                      onChange={(e) => setMegaFeatured({ ...megaFeatured, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                    <input
                      value={megaFeatured.title ?? ""}
                      onChange={(e) => setMegaFeatured({ ...megaFeatured, title: e.target.value })}
                      placeholder="Headline"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Link</label>
                    <input
                      value={megaFeatured.link ?? ""}
                      onChange={(e) => setMegaFeatured({ ...megaFeatured, link: e.target.value })}
                      placeholder="/page"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <textarea
                      value={megaFeatured.description ?? ""}
                      onChange={(e) => setMegaFeatured({ ...megaFeatured, description: e.target.value })}
                      placeholder="Short description..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Link text</label>
                    <input
                      value={megaFeatured.link_text ?? "Read more"}
                      onChange={(e) => setMegaFeatured({ ...megaFeatured, link_text: e.target.value })}
                      placeholder="Read more"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">CTA button</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cta.enabled !== false}
              onChange={(e) => setCta("enabled", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-700">Show CTA button</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Button text</label>
              <input
                value={cta.text ?? ""}
                onChange={(e) => setCta("text", e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Contact Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Button link</label>
              <input
                value={cta.href ?? ""}
                onChange={(e) => setCta("href", e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="/contact"
              />
            </div>
            <div>
              <ColorField
                label="Button color"
                value={cta.color ?? "#6366f1"}
                onChange={(v) => setCta("color", v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Styling */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Header styling</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={styling.sticky !== false}
              onChange={(e) => setStyling("sticky", e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-700">Sticky header</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ColorField
              label="Background"
              value={styling.background_color ?? "#ffffff"}
              onChange={(v) => setStyling("background_color", v)}
            />
            <ColorField
              label="Text color"
              value={styling.text_color ?? "#111827"}
              onChange={(v) => setStyling("text_color", v)}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Padding top (px)</label>
              <input
                type="number"
                min={0}
                value={styling.padding_top ?? 16}
                onChange={(e) => setStyling("padding_top", Number(e.target.value) || 0)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Padding bottom (px)</label>
              <input
                type="number"
                min={0}
                value={styling.padding_bottom ?? 16}
                onChange={(e) => setStyling("padding_bottom", Number(e.target.value) || 0)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
