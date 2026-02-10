"use client";

import { useEffect, useState } from "react";
import api from "../app/api-client";

export type ThemeConfig = Record<string, string>;
export type MegaMenuLink = { label?: string; href?: string };
export type MegaMenuColumn = { title?: string; links?: MegaMenuLink[] };
export type MegaMenuFeatured = { image_url?: string; title?: string; description?: string; link?: string; link_text?: string };
export type HeaderConfig = {
  logo?: { type?: string; text?: string; subtext?: string; image_url?: string; link?: string };
  menu_items?: Array<{ id?: string; label?: string; href?: string; type?: string; children?: unknown[]; open_in_new_tab?: boolean }>;
  cta_button?: { enabled?: boolean; text?: string; href?: string; style?: string; color?: string };
  styling?: { background_color?: string; text_color?: string; sticky?: boolean; padding_top?: number; padding_bottom?: number };
  /** When true, shows a full-width mega-menu overlay (Zensar-style) with columns + optional featured block */
  mega_menu?: boolean;
  /** Nav columns shown in the mega-menu (e.g. "What We Do", "Explore Our Services") */
  mega_menu_columns?: MegaMenuColumn[];
  /** Optional featured block (image + text + CTA) on the right side of the mega-menu */
  mega_menu_featured?: MegaMenuFeatured | null;
};
export type FooterLink = { id?: string; label: string; href: string; open_in_new_tab?: boolean };
export type FooterColumn = { id?: string; title?: string; content?: string; links?: FooterLink[] };
export type FooterConfig = {
  columns?: FooterColumn[];
  copyright_text?: string;
  newsletter_title?: string;
  newsletter_placeholder?: string;
  newsletter_button_text?: string;
  legal_links?: FooterLink[];
  styling?: { background_color?: string; text_color?: string; link_color?: string };
};

export type HeroAwardLogo = { image_url?: string; link_url?: string; alt?: string };
export type HeroDataCard = { title?: string; value?: string; label?: string; icon?: string };
export type HeroConfig = {
  enabled?: boolean;
  headline?: string;
  description?: string;
  tagline?: string;
  email_placeholder?: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  awards_headline?: string;
  award_logos?: HeroAwardLogo[];
  /** Right column banner image (main image in col-md-7) */
  banner_image_url?: string;
  background_image_url?: string;
  chat_button_text?: string;
  chat_button_link?: string;
  data_cards?: HeroDataCard[];
};

const DEFAULT_THEME: ThemeConfig = {
  primary: "#0066B3",
  secondary: "#004C8A",
  accent: "#0066B3",
  background: "#ffffff",
  surface: "#F5F7FA",
  text: "#1A1A2E",
  textSecondary: "#5A6178",
  border: "#E2E8F0",
  success: "#0D9488",
  warning: "#D97706",
  error: "#DC2626",
  info: "#0066B3",
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
  const [hero, setHero] = useState<HeroConfig | null>(null);

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
      api.get<HeroConfig>("/cms/site-settings/hero").then((r) => setHero(r.data || null)).catch(() => {}),
    ]);
  }, []);

  return { theme, header, footer, hero };
}
