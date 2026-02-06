"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher, LAYOUT_SWR_CONFIG } from "@/lib/swr";

interface FooterColumn {
  id: string;
  title: string;
  links: Array<{
    id: string;
    label: string;
    href: string;
    open_in_new_tab: boolean;
  }>;
  content?: string;
}

interface FooterConfig {
  columns: FooterColumn[];
  copyright_text: string;
  styling: {
    background_color: string;
    text_color: string;
    link_color: string;
    use_gradient?: boolean;
    gradient_from?: string;
    gradient_to?: string;
    gradient_direction?: string;
  };
}

const DEFAULT_FOOTER: FooterConfig = {
  columns: [
    {
      id: "1",
      title: "Social IT",
      content: "Building amazing digital solutions for your business.",
      links: [],
    },
    {
      id: "2",
      title: "Quick Links",
      links: [
        { id: "1", label: "Services", href: "/services", open_in_new_tab: false },
        { id: "2", label: "Blogs", href: "/blogs", open_in_new_tab: false },
        { id: "3", label: "Case Studies", href: "/case-studies", open_in_new_tab: false },
      ],
    },
    {
      id: "3",
      title: "Company",
      links: [
        { id: "1", label: "About Us", href: "/about", open_in_new_tab: false },
        { id: "2", label: "Contact", href: "/contact", open_in_new_tab: false },
      ],
    },
  ],
  copyright_text: "© {year} Social IT. All rights reserved.",
  styling: {
    background_color: "#0d1117",
    text_color: "#e6edf3",
    link_color: "#58a6ff",
  },
};

export default function Footer() {
  const { data: config = DEFAULT_FOOTER } = useSWR<FooterConfig>(
    "/cms/site-settings/footer",
    fetcher,
    { ...LAYOUT_SWR_CONFIG, fallbackData: DEFAULT_FOOTER }
  );

  const copyrightText = config.copyright_text.replace("{year}", new Date().getFullYear().toString());

  // Get background style (gradient or solid)
  const getBackgroundStyle = () => {
    if (config.styling.use_gradient && config.styling.gradient_from && config.styling.gradient_to) {
      return {
        background: `linear-gradient(${config.styling.gradient_direction || "to right"}, ${config.styling.gradient_from}, ${config.styling.gradient_to})`,
        color: config.styling.text_color,
      };
    }
    return {
      backgroundColor: config.styling.background_color,
      color: config.styling.text_color,
    };
  };

  return (
    <footer
      style={getBackgroundStyle()}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.columns.length > 0 && (
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(${Math.min(config.columns.length, 4)}, minmax(0, 1fr))`,
            }}
          >
            {config.columns.map((column) => (
              <div key={column.id}>
                {column.title && (
                  <h4 className="text-sm font-semibold mb-4">{column.title}</h4>
                )}
                {column.content && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: config.styling.link_color }}
                  >
                    {column.content}
                  </p>
                )}
                {column.links && column.links.length > 0 && (
                  <ul className="space-y-2 text-sm">
                    {column.links.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={link.href}
                          target={link.open_in_new_tab ? "_blank" : undefined}
                          rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                          className="hover:opacity-80 transition-opacity"
                          style={{ color: config.styling.link_color }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
        <div
          className="border-t mt-8 pt-8 text-center text-sm"
          style={{
            borderColor: config.styling.link_color,
            color: config.styling.link_color,
          }}
        >
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}
