"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { HeaderConfig } from "./SiteSettingsProvider";

type MenuItem = {
  id?: string;
  label?: string;
  href?: string;
  type?: string;
  children?: Array<{ id?: string; label?: string; href?: string; type?: string; open_in_new_tab?: boolean }>;
  open_in_new_tab?: boolean;
};

const DEFAULT_SERVICES = [
  { label: "Website Development", href: "/services/website-development" },
  { label: "App Development", href: "/services/app-development" },
  { label: "Social Media Marketing", href: "/services/social-media-marketing" },
  { label: "Digital Marketing", href: "/services/digital-marketing" },
  { label: "Logo Design", href: "/services/logo-design" },
  { label: "Packaging Design", href: "/services/packaging-design" },
  { label: "Branding & Advertising", href: "/services/branding-advertising" },
  { label: "UI/UX Design", href: "/services/ui-ux-design" },
  { label: "Graphic Design", href: "/services/graphic-design" },
];

const DEFAULT_MENU: MenuItem[] = [
  { label: "Services", href: "/services", type: "dropdown", children: DEFAULT_SERVICES },
  { label: "Blogs", href: "/blogs" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Admin", href: "/admin/login" },
];

export default function Header({ config }: { config?: HeaderConfig | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const logo = config?.logo;
  const logoText = logo?.text ?? "Social IT";
  const logoLink = logo?.link ?? "/";
  const menuItems = config?.menu_items?.length ? config.menu_items : DEFAULT_MENU;
  const cta = config?.cta_button;
  const styling = config?.styling ?? {};
  const bg = styling.background_color ?? undefined;
  const textColor = styling.text_color ?? undefined;
  const sticky = styling.sticky !== false;
  const megaMenu = config?.mega_menu === true;
  const megaColumns = config?.mega_menu_columns ?? [];
  const megaFeatured = config?.mega_menu_featured;

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setServicesOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItemsTyped = menuItems as MenuItem[];
  const navContent = (
    <>
      {menuItemsTyped.map((item, i) => {
        const isDropdown = item.type === "dropdown" && Array.isArray(item.children) && item.children.length > 0;
        const openInNewTab = "open_in_new_tab" in item && item.open_in_new_tab;

        if (isDropdown) {
          return (
            <div
              key={item.id ?? i}
              className="relative"
              ref={servicesRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((o) => !o)}
                className="link-underline text-sm font-medium hover:opacity-90 transition py-3 md:py-0 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                style={{ color: textColor ?? undefined }}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                {item.label}
                <svg className={`w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`absolute left-0 top-full pt-1 transition-opacity duration-150 ${servicesOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                aria-hidden={!servicesOpen}
              >
                <div className="min-w-[220px] rounded-lg shadow-xl border border-white/10 bg-[#0f172a] py-2 z-50">
                  {(item.children ?? []).map((child, j) => (
                    <Link
                      key={child.id ?? j}
                      href={child.href ?? "#"}
                      className="block px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 hover:text-white transition"
                      target={(child as { open_in_new_tab?: boolean }).open_in_new_tab ? "_blank" : undefined}
                      rel={(child as { open_in_new_tab?: boolean }).open_in_new_tab ? "noopener noreferrer" : undefined}
                      onClick={() => { setServicesOpen(false); setMobileOpen(false); }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.id ?? i}
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

  const isDarkBg = bg && (bg.toLowerCase() === "#000" || bg.toLowerCase() === "#000000" || bg.startsWith("rgb(0,") || bg.includes("black"));
  const headerBorder = isDarkBg ? "border-white/10" : "border-gray-200";

  return (
    <header
      className={`border-b z-30 shadow-sm ${headerBorder}`}
      style={{
        backgroundColor: bg,
        color: textColor,
        ...(sticky ? { position: "sticky" as const, top: 0 } : {}),
        paddingTop: styling.padding_top ?? 16,
        paddingBottom: styling.padding_bottom ?? 16,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Zensar-style layout: hamburger left | logo center | CTA/utility right */}
        {megaMenu ? (
          <div className="flex items-center justify-between gap-4 relative">
            <div className="flex items-center min-w-[44px]">
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="p-2 -ml-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center hover:opacity-80 transition"
                style={{ color: textColor ?? "#fff" }}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <Link
              href={logoLink}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition hover:opacity-90 min-h-[44px] justify-center"
              style={{ color: textColor ?? undefined }}
            >
              {logo?.image_url ? (
                <img src={logo.image_url} alt={logoText} className="h-8 w-auto max-h-10" />
              ) : (
                <span className="text-xl font-semibold tracking-tight">{logoText}</span>
              )}
              {logo?.subtext && (
                <span className="text-xs font-normal opacity-90 hidden sm:block" style={{ color: textColor ?? undefined }}>{logo.subtext}</span>
              )}
            </Link>
            <div className="flex items-center gap-3 min-w-[44px] justify-end">
              {cta?.enabled !== false && cta?.text && (
                <Link
                  href={cta.href ?? "/contact"}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg transition shrink-0"
                  style={{ backgroundColor: cta.color ?? "var(--color-primary)", color: "#fff" }}
                >
                  {cta.text}
                </Link>
              )}
            </div>
          </div>
        ) : (
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

            <nav className="hidden md:flex items-center gap-6">
              {navContent}
            </nav>

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
        )}
      </div>

      {/* Mega-menu overlay (full-width, Zensar-style) */}
      {megaMenu && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-200 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-hidden={!mobileOpen}
        >
          <div className="absolute inset-0 bg-slate-900 text-white flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Link href={logoLink} className="text-xl font-bold hover:opacity-90" onClick={() => setMobileOpen(false)}>
                {logoText}
              </Link>
              <div className="w-12" aria-hidden />
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {megaColumns.filter((c) => c.title || (c.links?.length ?? 0) > 0).map((col, colIdx) => (
                    <div key={colIdx}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">
                        {col.title || "Links"}
                      </h3>
                      <ul className="space-y-2">
                        {(col.links ?? []).filter((l) => l.label || l.href).map((link, linkIdx) => (
                          <li key={linkIdx}>
                            <Link
                              href={link.href ?? "#"}
                              className="text-white hover:underline font-medium"
                              onClick={() => setMobileOpen(false)}
                            >
                              {link.label || link.href || "Link"}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {megaFeatured && (megaFeatured.title || megaFeatured.description || megaFeatured.image_url) && (
                  <div className="md:col-span-6 lg:col-span-5">
                    <div className="rounded-xl overflow-hidden bg-slate-800/50 border border-white/10 p-4 space-y-3">
                      {megaFeatured.image_url && (
                        <img
                          src={megaFeatured.image_url}
                          alt={megaFeatured.title ?? ""}
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                      )}
                      {megaFeatured.title && (
                        <h4 className="text-lg font-semibold text-white">{megaFeatured.title}</h4>
                      )}
                      {megaFeatured.description && (
                        <p className="text-sm text-white/80">{megaFeatured.description}</p>
                      )}
                      {(megaFeatured.link ?? megaFeatured.link_text) && (
                        <Link
                          href={megaFeatured.link ?? "#"}
                          className="inline-flex items-center gap-1 text-sm font-medium text-white hover:underline"
                          onClick={() => setMobileOpen(false)}
                        >
                          {megaFeatured.link_text ?? "Read more"}
                          <span aria-hidden>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile slide-out menu (only when not using mega-menu) */}
      {!megaMenu && (
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
            {(menuItems as MenuItem[]).map((item, i) => {
              const isDropdown = item.type === "dropdown" && Array.isArray(item.children) && item.children.length > 0;
              const openInNewTab = "open_in_new_tab" in item && item.open_in_new_tab;
              if (isDropdown) {
                return (
                  <div key={item.id ?? i} className="py-2">
                    <p className="px-4 py-2 text-sm font-semibold opacity-80" style={{ color: textColor ?? undefined }}>{item.label}</p>
                    <div className="pl-4 mt-1 space-y-0.5">
                      {(item.children ?? []).map((child, j) => (
                        <Link
                          key={child.id ?? j}
                          href={child.href ?? "#"}
                          className="block py-2.5 px-4 rounded-lg text-base font-medium hover:opacity-90 transition min-h-[44px] flex items-center"
                          style={{ color: textColor ?? undefined }}
                          target={(child as { open_in_new_tab?: boolean }).open_in_new_tab ? "_blank" : undefined}
                          rel={(child as { open_in_new_tab?: boolean }).open_in_new_tab ? "noopener noreferrer" : undefined}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.id ?? i}
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
      )}
    </header>
  );
}
