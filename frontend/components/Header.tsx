"use client";

import Link from "next/link";
import type { HeaderConfig } from "./SiteSettingsProvider";

const DEFAULT_MENU = [
  { label: "Services", href: "/services" },
  { label: "Blogs", href: "/blogs" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Admin", href: "/admin/login" },
];

export default function Header({ config }: { config?: HeaderConfig | null }) {
  const logo = config?.logo;
  const logoText = logo?.text ?? "Social IT";
  const logoLink = logo?.link ?? "/";
  const menuItems = config?.menu_items?.length ? config.menu_items : DEFAULT_MENU;
  const cta = config?.cta_button;
  const styling = config?.styling ?? {};
  const bg = styling.background_color ?? undefined;
  const textColor = styling.text_color ?? undefined;
  const sticky = styling.sticky !== false;

  return (
    <header
      className="border-b border-gray-200 z-10"
      style={{
        backgroundColor: bg,
        color: textColor,
        ...(sticky ? { position: "sticky" as const, top: 0 } : {}),
        paddingTop: styling.padding_top ?? 16,
        paddingBottom: styling.padding_bottom ?? 16,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href={logoLink}
            className="text-xl font-bold transition hover:opacity-90"
            style={{ color: textColor ?? undefined }}
          >
            {logo?.image_url ? (
              <img src={logo.image_url} alt={logoText} className="h-8 w-auto" />
            ) : (
              logoText
            )}
          </Link>
          <nav className="flex items-center gap-6">
            {menuItems.map((item, i) => {
              const openInNewTab = "open_in_new_tab" in item && item.open_in_new_tab;
              return (
                <Link
                  key={i}
                  href={item.href ?? "#"}
                  className="text-sm font-medium hover:opacity-90 transition"
                  style={{ color: textColor ?? undefined }}
                  target={openInNewTab ? "_blank" : undefined}
                  rel={openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {cta?.enabled !== false && cta?.text && (
              <Link
                href={cta.href ?? "/contact"}
                className="text-sm font-medium px-4 py-2 rounded-lg transition"
                style={{
                  backgroundColor: cta.color ?? "var(--color-primary)",
                  color: "#fff",
                }}
              >
                {cta.text}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
