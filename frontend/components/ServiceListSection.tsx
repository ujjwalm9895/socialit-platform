"use client";

import React from "react";
import type { SectionDesign } from "./SectionRenderer";

export type ServiceListCard = {
  title?: string;
  icons?: Array<{ url?: string; alt?: string }>;
  button_text?: string;
  button_link?: string;
};

export type ServiceListDesign = SectionDesign & {
  card_background_color?: string;
  title_color?: string;
  icon_size?: number;
  columns?: number;
  button_gradient_from?: string;
  button_gradient_to?: string;
  button_text_color?: string;
};

export type ServiceListData = {
  cards?: ServiceListCard[];
  design?: ServiceListDesign | null;
};

const containerClass = "max-w-6xl mx-auto w-full";

export default function ServiceListSection({
  data,
  design: sectionDesign,
}: {
  data: ServiceListData;
  design?: ServiceListDesign | null;
}) {
  const cards = data?.cards ?? [];
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

  const cardBg = design.card_background_color ?? "rgba(255,255,255,0.06)";
  const titleColor = design.title_color ?? textColor;
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
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 sm:p-6 flex flex-col min-h-[140px] border border-white/10"
                style={{ backgroundColor: cardBg }}
              >
                <h3
                  className="text-lg font-semibold mb-3 sm:mb-4"
                  style={{ color: titleColor }}
                >
                  {card.title || "Service"}
                </h3>
                {card.icons && card.icons.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {card.icons
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
                  {card.button_text && (
                    <a
                      href={card.button_link || "#"}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-95"
                      style={{
                        background: `linear-gradient(90deg, ${btnFrom}, ${btnTo})`,
                        color: btnTextColor,
                      }}
                    >
                      {card.button_text}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {cards.length === 0 && (
            <div className="text-center py-12 opacity-70" style={{ color: textColor }}>
              Add service cards in Admin → Homepage. Click “+ service list” then edit the section.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
