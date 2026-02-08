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

  return (
    <footer className="border-t border-gray-200 mt-auto" style={{ backgroundColor: bg, color: textColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <p className="text-sm">{copyrightText}</p>
          <div className="flex flex-wrap gap-8">
            {columns.map((col, i) => (
              <div key={i}>
                {col.title && <p className="text-sm font-semibold mb-2" style={{ color: textColor }}>{col.title}</p>}
                <div className="flex flex-col gap-1">
                  {(col.links ?? []).map((link, j) => (
                    <Link
                      key={j}
                      href={link.href}
                      className="link-underline text-sm hover:opacity-90 transition"
                      style={{ color: linkColor }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
