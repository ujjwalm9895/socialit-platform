"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { HeaderConfig } from "./SiteSettingsProvider";

const DEFAULT_MENU = [
  { label: "Services", href: "/services" },
  { label: "Blogs", href: "/blogs" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Admin", href: "/admin/login" },
];

export default function Header({ config }: { config?: HeaderConfig | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const logo = config?.logo;
  const logoText = logo?.text ?? "Social IT";
  const logoLink = logo?.link ?? "/";
  const menuItems = config?.menu_items?.length ? config.menu_items : DEFAULT_MENU;
  const cta = config?.cta_button;
  const styling = config?.styling ?? {};
  const bg = styling.background_color ?? undefined;
  const textColor = styling.text_color ?? undefined;
  const sticky = styling.sticky !== false;

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const navContent = (
    <>
      {menuItems.map((item, i) => {
        const openInNewTab = "open_in_new_tab" in item && item.open_in_new_tab;
        return (
          <Link
            key={i}
            href={item.href ?? "#"}
            className="link-underline text-sm font-medium hover:opacity-90 transition py-3 md:py-0"
            style={{ color: textColor ?? undefined }}
            target={openInNewTab ? "_blank" : undefined}
            rel={openInNewTab ? "noopener noreferrer" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
      {cta?.enabled !== false && cta?.text && (
        <Link
          href={cta.href ?? "/contact"}
          className="btn-flashy text-sm font-medium px-5 py-3 md:py-2.5 rounded-xl transition inline-block text-center min-h-[44px] flex items-center justify-center"
          style={{ backgroundColor: cta.color ?? "var(--color-primary)", color: "#fff" }}
          onClick={() => setMobileOpen(false)}
        >
          {cta.text}
        </Link>
      )}
    </>
  );

  return (
    <header
      className="border-b border-gray-200 z-30 shadow-sm"
      style={{
        backgroundColor: bg,
        color: textColor,
        ...(sticky ? { position: "sticky" as const, top: 0 } : {}),
        paddingTop: styling.padding_top ?? 16,
        paddingBottom: styling.padding_bottom ?? 16,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">
          <Link
            href={logoLink}
            className="flex flex-col transition hover:opacity-90 shrink-0 min-h-[44px] justify-center"
            style={{ color: textColor ?? undefined }}
          >
            {logo?.image_url ? (
              <img src={logo.image_url} alt={logoText} className="h-8 w-auto max-h-10" />
            ) : (
              <span className="text-lg sm:text-xl font-bold">{logoText}</span>
            )}
            {logo?.subtext && (
              <span className="text-xs font-normal opacity-90" style={{ color: textColor ?? undefined }}>{logo.subtext}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navContent}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
            style={{ color: textColor ?? undefined }}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <div
        className={`fixed inset-0 z-20 md:hidden transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ backgroundColor: bg || "#fff", color: textColor ?? "#111" }}
        >
          <div className="p-4 border-b border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
            {menuItems.map((item, i) => {
              const openInNewTab = "open_in_new_tab" in item && item.open_in_new_tab;
              return (
                <Link
                  key={i}
                  href={item.href ?? "#"}
                  className="py-3 px-4 rounded-xl text-base font-medium hover:opacity-90 transition min-h-[48px] flex items-center"
                  style={{ color: textColor ?? undefined }}
                  target={openInNewTab ? "_blank" : undefined}
                  rel={openInNewTab ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {cta?.enabled !== false && cta?.text && (
              <Link
                href={cta.href ?? "/contact"}
                className="mt-2 btn-flashy text-center font-medium px-5 py-4 rounded-xl transition min-h-[48px] flex items-center justify-center"
                style={{ backgroundColor: cta.color ?? "var(--color-primary)", color: "#fff" }}
                onClick={() => setMobileOpen(false)}
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
