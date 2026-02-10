"use client";

import Link from "next/link";
import type { FooterConfig } from "./SiteSettingsProvider";

const DEFAULT_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Blogs", href: "/blogs" },
  { label: "Case Studies", href: "/case-studies" },
];

export default function Footer({ config }: { config?: FooterConfig | null }) {
  const year = typeof window !== "undefined" ? new Date().getFullYear() : new Date().getFullYear();
  const copyrightText = config?.copyright_text?.replace("{year}", String(year)) ?? `© ${year} Social IT. All rights reserved.`;
  const styling = config?.styling ?? {};
  const bg = styling.background_color ?? "#f3f4f6";
  const textColor = styling.text_color ?? "#6b7280";
  const linkColor = styling.link_color ?? "#6366f1";
  const columns = config?.columns?.length ? config.columns : [{ title: "Links", links: DEFAULT_LINKS }];
  const newsletterTitle = config?.newsletter_title;
  const legalLinks = config?.legal_links ?? [];

  return (
    <footer className="border-t border-gray-200 mt-auto" style={{ backgroundColor: bg, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {columns.map((col, i) => (
            <div key={"id" in col && col.id ? col.id : i}>
              {col.title && <p className="text-sm font-semibold mb-2" style={{ color: textColor }}>{col.title}</p>}
              {col.content && <p className="text-sm opacity-90 mb-3 max-w-xs">{col.content}</p>}
              <div className="flex flex-col gap-1">
                {(col.links ?? []).map((link, j) => (
                  <Link
                    key={link.id ?? j}
                    href={link.href}
                    className="link-underline text-sm hover:opacity-90 transition py-1 flex items-center"
                    style={{ color: linkColor }}
                    target={link.open_in_new_tab ? "_blank" : undefined}
                    rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {newsletterTitle && (
          <div className="border-t border-white/10 pt-6 mb-6">
            <p className="text-sm font-semibold mb-2" style={{ color: textColor }}>{newsletterTitle}</p>
            <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={config?.newsletter_placeholder ?? "Your email"}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ color: textColor }}
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition opacity-90 hover:opacity-100"
                style={{ backgroundColor: linkColor, color: bg }}
              >
                {config?.newsletter_button_text ?? "Send"}
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/10">
          <p className="text-sm">{copyrightText}</p>
          {legalLinks.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link, j) => (
                <Link
                  key={link.id ?? j}
                  href={link.href}
                  className="text-sm hover:opacity-90 transition"
                  style={{ color: linkColor }}
                  target={link.open_in_new_tab ? "_blank" : undefined}
                  rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
