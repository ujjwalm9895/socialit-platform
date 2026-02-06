"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import { fetcher, LAYOUT_SWR_CONFIG } from "../lib/swr";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  type: "link" | "dropdown";
  children?: MenuItem[];
  open_in_new_tab: boolean;
}

interface HeaderConfig {
  logo: {
    type: "text" | "image";
    text: string;
    subtext: string;
    image_url: string;
    position: "left" | "center" | "right";
    link: string;
  };
  menu_items: MenuItem[];
  cta_button: {
    enabled: boolean;
    text: string;
    href: string;
    style: "solid" | "outline" | "gradient";
    color: string;
    gradient_from: string;
    gradient_to: string;
  };
  styling: {
    background_color: string;
    text_color: string;
    sticky: boolean;
    padding_top: number;
    padding_bottom: number;
  };
}

const DEFAULT_HEADER: HeaderConfig = {
  logo: {
    type: "text",
    text: "Social IT",
    subtext: "Digital Transformation Partner",
    image_url: "",
    position: "left",
    link: "/",
  },
  menu_items: [
    { id: "1", label: "Home", href: "/", type: "link", open_in_new_tab: false },
    { id: "2", label: "Services", href: "/services", type: "link", open_in_new_tab: false },
    { id: "3", label: "Blogs", href: "/blogs", type: "link", open_in_new_tab: false },
    { id: "4", label: "Case Studies", href: "/case-studies", type: "link", open_in_new_tab: false },
  ],
  cta_button: {
    enabled: true,
    text: "Get A Demo",
    href: "/contact",
    style: "gradient",
    color: "#58a6ff",
    gradient_from: "#1f6feb",
    gradient_to: "#388bfd",
  },
  styling: {
    background_color: "#0d1117",
    text_color: "#e6edf3",
    sticky: true,
    padding_top: 16,
    padding_bottom: 16,
  },
};

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const { data: config = DEFAULT_HEADER } = useSWR<HeaderConfig>(
    "/cms/site-settings/header",
    fetcher,
    { ...LAYOUT_SWR_CONFIG, fallbackData: DEFAULT_HEADER }
  );

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: config.styling.background_color,
        color: config.styling.text_color,
        paddingTop: `${config.styling.padding_top}px`,
        paddingBottom: `${config.styling.padding_bottom}px`,
        position: config.styling.sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 50,
      }}
      className="backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={
              config.logo.position === "center"
                ? "flex-1 flex justify-center"
                : config.logo.position === "right"
                ? "flex-1 flex justify-end"
                : "flex-1"
            }
          >
            <Link href={config.logo.link} className="flex items-center">
              {config.logo.type === "text" ? (
                <div>
                  <h1 className="text-2xl font-bold">{config.logo.text}</h1>
                  {config.logo.subtext && (
                    <p className="text-xs opacity-80">{config.logo.subtext}</p>
                  )}
                </div>
              ) : (
                config.logo.image_url && (
                  <img src={config.logo.image_url} alt={config.logo.text} className="h-10" />
                )
              )}
            </Link>
          </motion.div>

          {/* Menu */}
          <nav
            ref={navRef}
            className={`hidden md:flex space-x-6 ${
              config.logo.position === "center" ? "flex-1 justify-center" : "flex-1 justify-center"
            }`}
          >
            {config.menu_items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {item.type === "dropdown" && item.children && item.children.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                      className="relative text-sm font-medium transition-colors hover:opacity-80 flex items-center"
                    >
                      <span className={pathname === item.href ? "opacity-100 font-semibold" : "opacity-90"}>
                        {item.label}
                      </span>
                      <span className="ml-1 inline-block align-middle text-xs opacity-80">&#9660;</span>
                      {pathname === item.href && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current rounded-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                    <AnimatePresence>
                      {openDropdownId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 py-2 min-w-[200px] rounded-lg shadow-xl z-50 border border-current border-opacity-20"
                          style={{
                            backgroundColor: config.styling.background_color,
                            color: config.styling.text_color,
                          }}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.href}
                              target={child.open_in_new_tab ? "_blank" : undefined}
                              rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                              className="block px-4 py-2 text-sm hover:opacity-80"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    target={item.open_in_new_tab ? "_blank" : undefined}
                    rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                    className="relative text-sm font-medium transition-colors hover:opacity-80"
                  >
                    <span className={pathname === item.href ? "opacity-100 font-semibold" : "opacity-90"}>
                      {item.label}
                    </span>
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-current rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex-1 flex justify-end items-center">
            {config.cta_button.enabled && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: config.menu_items.length * 0.1 }}
                className="hidden md:block"
              >
                <Link
                  href={config.cta_button.href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={
                    config.cta_button.style === "gradient"
                      ? {
                          background: `linear-gradient(to right, ${config.cta_button.gradient_from}, ${config.cta_button.gradient_to})`,
                        }
                      : config.cta_button.style === "solid"
                      ? { backgroundColor: config.cta_button.color }
                      : {
                          border: `2px solid ${config.cta_button.color}`,
                          color: config.cta_button.color,
                          background: "transparent",
                        }
                  }
                >
                  {config.cta_button.text}
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden ml-4">
              <motion.button
                type="button"
                aria-label="Open menu"
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen((o) => !o)}
                className="p-2 rounded-lg border-2 border-current border-opacity-40 hover:border-opacity-80 transition-colors"
              >
                <span className="text-lg font-bold">{mobileOpen ? "\u00D7" : "\u2630"}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-current border-opacity-10"
            >
              <nav className="py-4 px-4 flex flex-col gap-1">
                {config.menu_items.map((item) =>
                  item.type === "dropdown" && item.children && item.children.length > 0 ? (
                    <div key={item.id} className="flex flex-col gap-1">
                      <span className="text-sm font-semibold opacity-90 px-2 py-1">{item.label}</span>
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          target={child.open_in_new_tab ? "_blank" : undefined}
                          rel={child.open_in_new_tab ? "noopener noreferrer" : undefined}
                          className="py-2 px-4 text-sm opacity-90 hover:opacity-100 pl-6"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.id}
                      href={item.href}
                      target={item.open_in_new_tab ? "_blank" : undefined}
                      rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="py-2 px-4 text-sm font-medium hover:opacity-80"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )
                )}
                {config.cta_button.enabled && (
                  <Link
                    href={config.cta_button.href}
                    className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold text-white text-center"
                    style={{
                      background: `linear-gradient(to right, ${config.cta_button.gradient_from}, ${config.cta_button.gradient_to})`,
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {config.cta_button.text}
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
