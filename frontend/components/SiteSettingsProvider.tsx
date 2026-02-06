"use client";

import { useEffect, useState } from "react";
import api from "../app/api-client";

export type ThemeConfig = Record<string, string>;
export type HeaderConfig = {
  logo?: { type?: string; text?: string; subtext?: string; image_url?: string; link?: string };
  menu_items?: Array<{ id?: string; label?: string; href?: string; type?: string; children?: unknown[]; open_in_new_tab?: boolean }>;
  cta_button?: { enabled?: boolean; text?: string; href?: string; style?: string; color?: string };
  styling?: { background_color?: string; text_color?: string; sticky?: boolean; padding_top?: number; padding_bottom?: number };
};
export type FooterConfig = {
  columns?: Array<{ title?: string; links?: Array<{ label: string; href: string }> }>;
  copyright_text?: string;
  styling?: { background_color?: string; text_color?: string; link_color?: string };
};

const DEFAULT_THEME: ThemeConfig = {
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

const THEME_KEYS = ["primary", "secondary", "accent", "background", "surface", "text", "textSecondary", "border", "success", "warning", "error", "info"];

function applyTheme(theme: ThemeConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  THEME_KEYS.forEach((key) => {
    const value = theme[key];
    if (value) root.style.setProperty(`--color-${key}`, value);
  });
}

export function useSiteSettings() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [header, setHeader] = useState<HeaderConfig | null>(null);
  const [footer, setFooter] = useState<FooterConfig | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      api.get<ThemeConfig>("/cms/site-settings/theme").then((r) => {
        if (r.data && Object.keys(r.data).length > 0) {
          setTheme((prev) => ({ ...DEFAULT_THEME, ...prev, ...r.data }));
        }
      }).catch(() => {}),
      api.get<HeaderConfig>("/cms/site-settings/header").then((r) => setHeader(r.data || null)).catch(() => {}),
      api.get<FooterConfig>("/cms/site-settings/footer").then((r) => setFooter(r.data || null)).catch(() => {}),
    ]);
  }, []);

  return { theme, header, footer };
}
