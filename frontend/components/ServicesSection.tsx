"use client";

import React from "react";
import type { SectionDesign } from "./SectionRenderer";

export type ServiceItem = {
  enabled?: boolean;
  title?: string;
  description?: string;
  link?: string;
  icon?: string;
  icons?: Array<{ url?: string; alt?: string }>;
  button_text?: string;
  button_link?: string;
};

export type ServicesDesign = SectionDesign & {
  card_background_color?: string;
  title_color?: string;
  subtitle_color?: string;
  link_color?: string;
  icon_size?: number;
  columns?: number;
  button_gradient_from?: string;
  button_gradient_to?: string;
  button_text_color?: string;
};

export type ServicesData = {
  layout?: "cards" | "grid";
  title?: string;
  subtitle?: string;
  services?: ServiceItem[];
  design?: ServicesDesign | null;
};

const containerClass = "max-w-6xl mx-auto w-full";

function useVisibleServices(services: ServiceItem[]): ServiceItem[] {
  return React.useMemo(
    () => (services ?? []).filter((s) => s.enabled !== false),
    [services]
  );
}

export default function ServicesSection({
  data,
  design: sectionDesign,
}: {
  data: ServicesData;
  design?: ServicesDesign | null;
}) {
  const layout = data?.layout ?? "cards";
  const title = data?.title ?? "Our Services";
  const subtitle = data?.subtitle ?? "";
  const rawServices = data?.services ?? [];
  const services = useVisibleServices(rawServices);
  const design = sectionDesign ?? data?.design ?? {};
  const pad = {
    paddingTop: design.padding_top ?? 48,
    paddingBottom: design.padding_bottom ?? 48,
  };
  const bgType = design.background_type ?? "color";
  const bgColor = design.background_color ?? "#000000";
  const gradientFrom = design.gradient_from ?? "#0f172a";
  const gradientTo = design.gradient_to ?? "#1e293b";
  const bgImageUrl = design.background_image_url ?? "";
  const overlay = design.overlay_opacity ?? 0.3;
  const textColor = design.text_color ?? "#ffffff";
  const titleColor = design.title_color ?? textColor;
  const subtitleColor = design.subtitle_color ?? "rgba(255,255,255,0.8)";
  const linkColor = design.link_color ?? "#58a6ff";
  const cardBg = design.card_background_color ?? "rgba(255,255,255,0.06)";
  const iconSize = Math.min(48, Math.max(16, design.icon_size ?? 32));
  const columns = Math.min(4, Math.max(1, design.columns ?? 3));
  const btnFrom = design.button_gradient_from ?? "#9333ea";
  const btnTo = design.button_gradient_to ?? "#db2777";
  const btnTextColor = design.button_text_color ?? "#ffffff";

  const bgStyle: React.CSSProperties =
    bgType === "gradient"
      ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
      : bgType === "image" && bgImageUrl
        ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor: bgColor };

  const emptyMessage = (
    <div className="text-center py-12 opacity-70" style={{ color: textColor }}>
      No services to show. Add services in Admin → Homepage and enable at least one.
    </div>
  );

  return (
    <section
      className="relative overflow-hidden px-4 sm:px-6 lg:px-8"
      style={{ ...bgStyle, color: textColor, ...pad }}
    >
      {bgType === "image" && bgImageUrl && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden />
      )}
      <div className="relative">
        <div className={containerClass}>
          {(layout === "grid" || services.length > 0) && (
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: titleColor }}>{title}</h2>
              {subtitle && <p className="max-w-2xl mx-auto text-lg opacity-90" style={{ color: subtitleColor }}>{subtitle}</p>}
            </div>
          )}

          {layout === "cards" && (
            <div
              className="grid gap-4 sm:gap-6"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {services.length === 0
                ? emptyMessage
                : services.map((svc, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-5 sm:p-6 flex flex-col min-h-[140px] border border-white/10"
                      style={{ backgroundColor: cardBg }}
                    >
                      <h3 className="text-lg font-semibold mb-3 sm:mb-4" style={{ color: titleColor }}>
                        {svc.title || "Service"}
                      </h3>
                      {svc.icons && svc.icons.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {svc.icons
                            .filter((icon) => icon?.url)
                            .map((icon, j) => (
                              <img
                                key={j}
                                src={icon.url}
                                alt={icon.alt || ""}
                                className="object-contain opacity-90"
                                style={{ width: iconSize, height: iconSize }}
                              />
                            ))}
                        </div>
                      )}
                      <div className="mt-auto pt-2">
                        {svc.button_text ? (
                          <a
                            href={svc.button_link || "#"}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-95"
                            style={{
                              background: `linear-gradient(90deg, ${btnFrom}, ${btnTo})`,
                              color: btnTextColor,
                            }}
                          >
                            {svc.button_text}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                            </svg>
                          </a>
                        ) : svc.link ? (
                          <a
                            href={svc.link}
                            className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100"
                            style={{ color: linkColor }}
                          >
                            Learn more →
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
            </div>
          )}

          {layout === "grid" && (
            <div
              className="grid gap-6 sm:gap-8"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {services.length === 0 ? (
                emptyMessage
              ) : (
                services.map((svc, i) => (
                  <a
                    key={i}
                    href={svc.link || "#"}
                    className="group block p-6 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                  >
                    {svc.icon && <img src={svc.icon} alt="" className="w-10 h-10 mb-4 opacity-90" />}
                    <h3 className="text-lg font-semibold mb-2 group-hover:underline" style={{ color: linkColor }}>
                      {svc.title ?? "Service"}
                    </h3>
                    <p className="text-sm opacity-90">{svc.description ?? ""}</p>
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
