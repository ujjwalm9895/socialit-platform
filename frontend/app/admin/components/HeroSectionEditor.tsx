"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { HeroBlock, HeroDesign, HeroSectionData } from "../../../components/HeroSection";
import ColorField from "./ColorField";

const BLOCK_TYPES = [
  { value: "heading", label: "Heading (h1/h2/h3)" },
  { value: "paragraph", label: "Paragraph" },
  { value: "tagline", label: "Tagline" },
  { value: "email_input", label: "Email input" },
  { value: "button", label: "Button" },
  { value: "button_group", label: "Button group" },
  { value: "image", label: "Image" },
  { value: "logo_row", label: "Logo row (awards)" },
  { value: "spacer", label: "Spacer" },
  { value: "divider", label: "Divider" },
  { value: "custom_html", label: "Custom HTML" },
];

const DEFAULT_CONTENT: Record<string, Record<string, unknown>> = {
  heading: { level: "h2", text: "Your headline" },
  paragraph: { text: "Your text here." },
  tagline: { text: "Tagline" },
  email_input: { placeholder: "Enter your email" },
  button: { text: "Get started", link: "/contact", style: "primary" },
  button_group: { buttons: [{ text: "Get A Demo", link: "/contact", style: "primary" }, { text: "Explore", link: "#", style: "outline" }] },
  image: { url: "", alt: "", link: "" },
  logo_row: { headline: "Trusted by", logos: [{ image_url: "", link_url: "", alt: "" }] },
  spacer: { height: 24 },
  divider: {},
  custom_html: { html: "" },
};

function Field({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {rows ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary" />
      )}
    </div>
  );
}

function BlockEditor({ block, onChange, onClose }: { block: HeroBlock; onChange: (b: HeroBlock) => void; onClose: () => void }) {
  const [type, setType] = useState(block.type);
  const [content, setContent] = useState<Record<string, unknown>>(block.content ?? {});
  const [style, setStyle] = useState<Record<string, unknown>>(block.style ?? {});

  const apply = () => {
    onChange({ ...block, type, content, style });
    onClose();
  };

  const set = (key: string, value: unknown) => setContent((p) => ({ ...p, [key]: value }));
  const setStyleKey = (key: string, value: unknown) => setStyle((p) => ({ ...p, [key]: value }));

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-800">Edit block</span>
        <div className="flex gap-2">
          <button type="button" onClick={apply} className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg">Apply</button>
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg">Cancel</button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Block type</label>
        <select value={type} onChange={(e) => { setType(e.target.value); setContent(DEFAULT_CONTENT[e.target.value] ?? {}); }} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {type === "heading" && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
            <select value={(content.level as string) || "h2"} onChange={(e) => set("level", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
            </select>
          </div>
          <Field label="Text" value={(content.text as string) || ""} onChange={(v) => set("text", v)} placeholder="Headline" />
        </>
      )}
      {type === "paragraph" && <Field label="Text" value={(content.text as string) || ""} onChange={(v) => set("text", v)} rows={3} />}
      {type === "tagline" && <Field label="Text" value={(content.text as string) || ""} onChange={(v) => set("text", v)} />}
      {type === "email_input" && <Field label="Placeholder" value={(content.placeholder as string) || ""} onChange={(v) => set("placeholder", v)} placeholder="Enter your email" />}
      {type === "button" && (
        <>
          <Field label="Text" value={(content.text as string) || ""} onChange={(v) => set("text", v)} placeholder="Button text" />
          <Field label="Link" value={(content.link as string) || ""} onChange={(v) => set("link", v)} placeholder="/contact" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Style</label>
            <select value={(content.style as string) || "primary"} onChange={(e) => set("style", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="primary">Primary</option>
              <option value="secondary">Secondary / Outline</option>
            </select>
          </div>
        </>
      )}
      {type === "button_group" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Buttons</label>
          {((content.buttons as Array<{ text?: string; link?: string; style?: string }>) || []).map((btn, i) => (
            <div key={i} className="flex gap-2 flex-wrap p-2 rounded-lg bg-white border border-slate-100">
              <input value={btn?.text ?? ""} onChange={(e) => { const b = [...((content.buttons as unknown[]) || [])]; if (!b[i]) b[i] = {}; (b[i] as Record<string, string>).text = e.target.value; set("buttons", b); }} placeholder="Text" className="flex-1 min-w-0 border border-slate-200 rounded px-2 py-1.5 text-sm" />
              <input value={btn?.link ?? ""} onChange={(e) => { const b = [...((content.buttons as unknown[]) || [])]; if (!b[i]) b[i] = {}; (b[i] as Record<string, string>).link = e.target.value; set("buttons", b); }} placeholder="Link" className="flex-1 min-w-0 border border-slate-200 rounded px-2 py-1.5 text-sm" />
              <select value={btn?.style ?? "primary"} onChange={(e) => { const b = [...((content.buttons as unknown[]) || [])]; if (!b[i]) b[i] = {}; (b[i] as Record<string, string>).style = e.target.value; set("buttons", b); }} className="border border-slate-200 rounded px-2 py-1.5 text-sm">
                <option value="primary">Primary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={() => set("buttons", [...((content.buttons as unknown[]) || []), { text: "", link: "#", style: "outline" }])} className="text-sm text-primary font-medium">+ Add button</button>
        </div>
      )}
      {type === "image" && (
        <>
          <Field label="Image URL" value={(content.url as string) || ""} onChange={(v) => set("url", v)} placeholder="https://..." />
          <Field label="Alt text" value={(content.alt as string) || ""} onChange={(v) => set("alt", v)} />
          <Field label="Link (optional)" value={(content.link as string) || ""} onChange={(v) => set("link", v)} placeholder="/page" />
        </>
      )}
      {type === "logo_row" && (
        <>
          <Field label="Headline" value={(content.headline as string) || ""} onChange={(v) => set("headline", v)} placeholder="Trusted by" />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Logos (image URL, link, alt)</label>
            {((content.logos as Array<{ image_url?: string; link_url?: string; alt?: string }>) || []).map((logo, i) => (
              <div key={i} className="flex gap-2 flex-wrap">
                <input value={logo?.image_url ?? ""} onChange={(e) => { const L = [...((content.logos as unknown[]) || [])]; if (!L[i]) L[i] = {}; (L[i] as Record<string, string>).image_url = e.target.value; set("logos", L); }} placeholder="Image URL" className="flex-1 min-w-0 border border-slate-200 rounded px-2 py-1.5 text-sm" />
                <input value={logo?.link_url ?? ""} onChange={(e) => { const L = [...((content.logos as unknown[]) || [])]; if (!L[i]) L[i] = {}; (L[i] as Record<string, string>).link_url = e.target.value; set("logos", L); }} placeholder="Link" className="w-24 border border-slate-200 rounded px-2 py-1.5 text-sm" />
                <input value={logo?.alt ?? ""} onChange={(e) => { const L = [...((content.logos as unknown[]) || [])]; if (!L[i]) L[i] = {}; (L[i] as Record<string, string>).alt = e.target.value; set("logos", L); }} placeholder="Alt" className="w-20 border border-slate-200 rounded px-2 py-1.5 text-sm" />
              </div>
            ))}
            <button type="button" onClick={() => set("logos", [...((content.logos as unknown[]) || []), { image_url: "", link_url: "", alt: "" }])} className="text-sm text-primary font-medium">+ Add logo</button>
          </div>
        </>
      )}
      {type === "spacer" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Height (px)</label>
          <input type="number" value={(content.height as number) ?? 24} onChange={(e) => set("height", parseInt(e.target.value, 10) || 24)} min={8} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      )}
      {type === "custom_html" && <Field label="HTML" value={(content.html as string) || ""} onChange={(v) => set("html", v)} rows={4} placeholder="<p>...</p>" />}
      <div className="pt-2 border-t border-slate-200 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-0.5">Font size</label>
          <input type="text" value={(style.fontSize as string) || ""} onChange={(e) => setStyleKey("fontSize", e.target.value)} placeholder="e.g. 2rem, 32px, 1.5em" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Align</label>
            <select value={(style.align as string) || "left"} onChange={(e) => setStyleKey("align", e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Text color</label>
            <input type="text" value={(style.color as string) || ""} onChange={(e) => setStyleKey("color", e.target.value)} placeholder="#fff" className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Margin top (px)</label>
            <input type="number" value={(style.marginTop as number) ?? 0} onChange={(e) => setStyleKey("marginTop", parseInt(e.target.value, 10) || 0)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-0.5">Margin bottom (px)</label>
            <input type="number" value={(style.marginBottom as number) ?? 0} onChange={(e) => setStyleKey("marginBottom", parseInt(e.target.value, 10) || 0)} className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableBlockRow({
  block,
  index,
  total,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  block: HeroBlock;
  index: number;
  total: number;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const id = block.id ?? `block-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg bg-white border-2 transition-shadow ${
        isDragging ? "border-primary shadow-lg z-10" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        className="shrink-0 p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="text-xs font-medium text-slate-500 capitalize flex-1 truncate">{block.type}</span>
      <button type="button" onClick={onEdit} className="px-2 py-1 text-xs font-medium text-primary border border-primary rounded">Edit</button>
      <button type="button" onClick={onMoveUp} disabled={total <= 1 || index === 0} className="px-2 py-1 text-xs text-slate-500 rounded border border-slate-200 disabled:opacity-40" title="Move up">↑</button>
      <button type="button" onClick={onMoveDown} disabled={index >= total - 1} className="px-2 py-1 text-xs text-slate-500 rounded border border-slate-200 disabled:opacity-40" title="Move down">↓</button>
      <button type="button" onClick={onRemove} className="px-2 py-1 text-xs text-red-600 rounded border border-red-200">Remove</button>
    </div>
  );
}

function BlockList({ blocks, onBlocksChange, editIndex, setEditIndex }: { blocks: HeroBlock[]; onBlocksChange: (b: HeroBlock[]) => void; editIndex: number | null; setEditIndex: (i: number | null) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const updateBlock = (i: number, block: HeroBlock) => {
    const next = [...blocks];
    next[i] = { ...block, id: block.id ?? next[i]?.id ?? `block-${i}` };
    onBlocksChange(next);
  };
  const remove = (i: number) => onBlocksChange(blocks.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    onBlocksChange(arrayMove(blocks, i, j));
    setEditIndex(j);
  };
  const addBlock = (type: string) => {
    const newBlock: HeroBlock = { id: `block-${Date.now()}`, type, content: { ...(DEFAULT_CONTENT[type] ?? {}) } };
    onBlocksChange([...blocks, newBlock]);
    setEditIndex(blocks.length);
  };

  const ids = blocks.map((b, i) => b.id ?? `block-${i}`);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    setEditIndex(editIndex === oldIndex ? newIndex : editIndex === newIndex ? oldIndex : editIndex);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {BLOCK_TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => addBlock(t.value)} className="px-2 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:text-primary">
            + {t.label}
          </button>
        ))}
      </div>
      {blocks.length === 0 ? (
        <p className="text-sm text-slate-500 py-3">No blocks. Add one above.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {blocks.map((block, i) => (
                <li key={block.id ?? `block-${i}`}>
                  <SortableBlockRow
                    block={block}
                    index={i}
                    total={blocks.length}
                    onEdit={() => setEditIndex(editIndex === i ? null : i)}
                    onMoveUp={() => move(i, -1)}
                    onMoveDown={() => move(i, 1)}
                    onRemove={() => remove(i)}
                  />
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      {editIndex !== null && blocks[editIndex] && (
        <div className="mt-3">
          <BlockEditor
            block={blocks[editIndex]}
            onChange={(b) => updateBlock(editIndex, b)}
            onClose={() => setEditIndex(null)}
          />
        </div>
      )}
    </div>
  );
}

export default function HeroSectionEditor({ data, setData }: { data: HeroSectionData; setData: (d: HeroSectionData) => void }) {
  const design = data.design ?? {};
  const [leftEditIndex, setLeftEditIndex] = useState<number | null>(null);
  const [rightEditIndex, setRightEditIndex] = useState<number | null>(null);

  const setDesign = (updates: Partial<HeroDesign>) => setData({ ...data, design: { ...design, ...updates } });
  const setLeftBlocks = (blocks: HeroBlock[]) => setData({ ...data, left_blocks: blocks });
  const setRightBlocks = (blocks: HeroBlock[]) => setData({ ...data, right_blocks: blocks });
  const leftBlocks = data.left_blocks ?? [];
  const rightBlocks = data.right_blocks ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 p-4 space-y-4">
        <h3 className="font-semibold text-slate-800">Design & layout</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Font family</label>
          <input type="text" value={design.font_family ?? ""} onChange={(e) => setDesign({ font_family: e.target.value })} placeholder="Inter, system-ui, sans-serif" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-slate-500 mt-1">e.g. Inter, DM Sans, &quot;Work Sans&quot;, system-ui, sans-serif. Leave empty for default.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Layout</label>
            <select value={design.layout ?? "two_column"} onChange={(e) => setDesign({ layout: e.target.value as "two_column" | "single_column" })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="two_column">Two columns (left + right)</option>
              <option value="single_column">Single column (centered)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Left column width</label>
            <select value={design.left_width ?? "42%"} onChange={(e) => setDesign({ left_width: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="1/3">1/3</option>
              <option value="42%">42%</option>
              <option value="1/2">1/2</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Background</label>
            <select value={design.background_type ?? "color"} onChange={(e) => setDesign({ background_type: e.target.value as "color" | "gradient" | "image" })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="color">Solid color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>
          {(design.background_type ?? "color") === "color" && (
            <div>
              <ColorField label="Background color" value={design.background_color ?? "#0f172a"} onChange={(v) => setDesign({ background_color: v })} />
            </div>
          )}
          {(design.background_type ?? "color") === "gradient" && (
            <>
              <ColorField label="Gradient from" value={design.gradient_from ?? "#0f172a"} onChange={(v) => setDesign({ gradient_from: v })} />
              <ColorField label="Gradient to" value={design.gradient_to ?? "#1e293b"} onChange={(v) => setDesign({ gradient_to: v })} />
            </>
          )}
          {(design.background_type ?? "color") === "image" && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Background image URL</label>
                <input type="text" value={design.background_image_url ?? ""} onChange={(e) => setDesign({ background_image_url: e.target.value })} placeholder="https://..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Overlay opacity (0–1)</label>
                <input type="number" step={0.1} min={0} max={1} value={design.overlay_opacity ?? 0.3} onChange={(e) => setDesign({ overlay_opacity: parseFloat(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Text color" value={design.text_color ?? "#ffffff"} onChange={(v) => setDesign({ text_color: v })} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Padding top (px)</label>
            <input type="number" value={design.padding_top ?? 80} onChange={(e) => setDesign({ padding_top: parseInt(e.target.value, 10) || 0 })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Padding bottom (px)</label>
            <input type="number" value={design.padding_bottom ?? 80} onChange={(e) => setDesign({ padding_bottom: parseInt(e.target.value, 10) || 0 })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Button & input colors</h4>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Primary button gradient from" value={design.primary_btn_gradient_from ?? "#9333ea"} onChange={(v) => setDesign({ primary_btn_gradient_from: v })} />
            <ColorField label="Primary button gradient to" value={design.primary_btn_gradient_to ?? "#db2777"} onChange={(v) => setDesign({ primary_btn_gradient_to: v })} />
            <ColorField label="Outline button border" value={design.outline_btn_border_color ?? "#7808d0"} onChange={(v) => setDesign({ outline_btn_border_color: v })} />
            <ColorField label="Outline button text" value={design.outline_btn_text_color ?? "#ffffff"} onChange={(v) => setDesign({ outline_btn_text_color: v })} />
            <ColorField label="Email input background" value={design.email_input_bg ?? ""} onChange={(v) => setDesign({ email_input_bg: v || undefined })} description="Leave default to use auto style" />
            <ColorField label="Email input border" value={design.email_input_border_color ?? ""} onChange={(v) => setDesign({ email_input_border_color: v || undefined })} description="Leave default to use auto style" />
            <ColorField label="Email placeholder color" value={design.email_placeholder_color ?? ""} onChange={(v) => setDesign({ email_placeholder_color: v || undefined })} description="Leave default for default placeholder" />
            <ColorField label="Logo row headline color" value={design.logo_row_headline_color ?? ""} onChange={(v) => setDesign({ logo_row_headline_color: v || undefined })} description="Leave default to use section text color" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Floating chat button colors</h4>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Chat button gradient from" value={design.chat_btn_bg_from ?? "#9333ea"} onChange={(v) => setDesign({ chat_btn_bg_from: v })} />
            <ColorField label="Chat button gradient to" value={design.chat_btn_bg_to ?? "#db2777"} onChange={(v) => setDesign({ chat_btn_bg_to: v })} />
            <ColorField label="Chat button text" value={design.chat_btn_text_color ?? "#ffffff"} onChange={(v) => setDesign({ chat_btn_text_color: v })} />
          </div>
        </div>
      </div>

      {design.layout !== "single_column" && (
        <>
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800">Left column blocks</h3>
            <p className="text-xs text-slate-500">Add, edit, reorder blocks. These appear on the left side.</p>
            <BlockList blocks={leftBlocks} onBlocksChange={setLeftBlocks} editIndex={leftEditIndex} setEditIndex={setLeftEditIndex} />
          </div>
          <div className="rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800">Right column blocks</h3>
            <p className="text-xs text-slate-500">Add, edit, reorder blocks. These appear on the right (e.g. image).</p>
            <BlockList blocks={rightBlocks} onBlocksChange={setRightBlocks} editIndex={rightEditIndex} setEditIndex={setRightEditIndex} />
          </div>
        </>
      )}

      {design.layout === "single_column" && (
        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-semibold text-slate-800">Blocks (single column)</h3>
          <p className="text-xs text-slate-500">Add, edit, reorder. Shown in one centered column.</p>
          <BlockList blocks={data.blocks ?? []} onBlocksChange={(b) => setData({ ...data, blocks: b })} editIndex={leftEditIndex} setEditIndex={setLeftEditIndex} />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 p-4 space-y-2">
        <h3 className="font-semibold text-slate-800">Floating chat button (optional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <input value={data.chat_button_text ?? ""} onChange={(e) => setData({ ...data, chat_button_text: e.target.value })} placeholder="Let's Chat" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <input value={data.chat_button_link ?? ""} onChange={(e) => setData({ ...data, chat_button_link: e.target.value })} placeholder="/contact" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
  );
}
