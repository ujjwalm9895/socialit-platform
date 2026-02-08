"use client";

import { useState, useEffect } from "react";

function normalizeHex(s: string): string {
  if (!s) return "#ffffff";
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return "#" + s;
  return "#ffffff";
}

export default function ColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description?: string;
}) {
  const hex = normalizeHex(value || "#ffffff");
  const [text, setText] = useState(hex);
  useEffect(() => {
    setText(hex);
  }, [hex]);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            onChange(v);
          }}
          className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer bg-white shadow-inner"
          title={label}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const v = normalizeHex(text);
            setText(v);
            onChange(v);
          }}
          className="flex-1 font-mono text-sm border-2 border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="#ffffff"
        />
      </div>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  );
}
