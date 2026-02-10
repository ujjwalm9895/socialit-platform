"use client";

import React from "react";
import HeroSection, { type HeroSectionData } from "./HeroSection";
import ServicesSection from "./ServicesSection";

export type Section = { type: string; data: Record<string, unknown>; id?: string };

/** Optional design for any section: background, colors, padding. */
export type SectionDesign = {
  background_type?: "color" | "gradient" | "image";
  background_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  background_image_url?: string;
  overlay_opacity?: number;
  text_color?: string;
  padding_top?: number;
  padding_bottom?: number;
};

const containerClass = "max-w-5xl mx-auto w-full";

function sectionPaddingFromDesign(design?: SectionDesign | null) {
  const top = design?.padding_top ?? 48;
  const bottom = design?.padding_bottom ?? 48;
  return { paddingTop: top, paddingBottom: bottom };
}

function SectionWrapper({
  design,
  children,
  className = "",
}: {
  design?: SectionDesign | null;
  children: React.ReactNode;
  className?: string;
}) {
  const d = design ?? {};
  const bgType = d.background_type ?? "color";
  const bgColor = d.background_color ?? "#ffffff";
  const gradientFrom = d.gradient_from ?? "#0f172a";
  const gradientTo = d.gradient_to ?? "#1e293b";
  const bgImageUrl = d.background_image_url ?? "";
  const overlay = d.overlay_opacity ?? 0.3;
  const textColor = d.text_color ?? "#1e293b";
  const pad = sectionPaddingFromDesign(design);

  const bgStyle: React.CSSProperties =
    bgType === "gradient"
      ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
      : bgType === "image" && bgImageUrl
        ? { backgroundImage: `url(${bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor: bgColor };

  return (
    <section
      className={`relative overflow-hidden px-4 sm:px-6 lg:px-8 ${className}`}
      style={{ ...bgStyle, color: textColor, ...pad }}
    >
      {bgType === "image" && bgImageUrl && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  if (data.headline !== undefined || data.left_blocks !== undefined || data.design !== undefined) {
    return <HeroSection config={{ enabled: true, ...data } as HeroSectionData} />;
  }
  const heading = (data.heading as string) || "Welcome";
  const subheading = (data.subheading as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "#";
  const badge = (data.badge as string) || "";
  const textColor = (data.textColor as string) || "#FFFFFF";
  const gradientTo = (data.gradientTo as string) || "";
  const useCustomGradient = !!gradientTo;
  const bgStyle = useCustomGradient
    ? { background: `linear-gradient(to bottom right, var(--color-primary), ${gradientTo})` }
    : undefined;
  return (
    <section
      className={useCustomGradient ? "relative overflow-hidden" : "relative bg-gradient-to-br from-primary via-primary to-primary-dark overflow-hidden"}
      style={bgStyle}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" aria-hidden />
      <div className={`relative ${sectionPadding} min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] flex flex-col justify-center`} style={{ color: textColor }}>
        <div className={containerClass + " text-center"}>
          {badge && (
            <span className="inline-block text-primary-dark bg-white/95 text-xs sm:text-sm font-semibold uppercase tracking-wider px-3 py-1.5 sm:px-4 rounded-full mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: "0s" }}>
              {badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up break-words" style={{ animationDelay: "0.1s" }}>
            {heading}
          </h1>
          {subheading && (
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-90 break-words" style={{ animationDelay: "0.2s" }}>
              {subheading}
            </p>
          )}
          {buttonText && (
            <a
              href={buttonLink}
              className="btn-flashy inline-block bg-white text-primary-dark font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-glow hover:bg-white/95 transition-colors animate-fade-in-up min-h-[48px] flex items-center justify-center"
              style={{ animationDelay: "0.3s" }}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const content = (data.content as string) || "";
  const title = (data.title as string) || "";
  const textColor = design?.text_color;
  return (
    <SectionWrapper design={design}>
      <div className={containerClass}>
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: textColor || undefined }}>{title}</h2>}
        <div className="prose prose-lg max-w-3xl prose-p:leading-relaxed animate-fade-in-up" style={textColor ? { color: textColor } : undefined}>
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </SectionWrapper>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const url = (data.url as string) || "";
  const alt = (data.alt as string) || "Image";
  const caption = (data.caption as string) || "";
  if (!url) return null;
  return (
    <SectionWrapper design={design}>
      <div className={containerClass}>
        <figure className="overflow-hidden rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-black/5 transition duration-300 hover:shadow-xl hover:ring-primary/20">
          <img src={url} alt={alt} className="w-full h-auto object-cover max-h-[18rem] sm:max-h-[24rem] md:max-h-[28rem] transition duration-500 hover:scale-[1.02]" />
          {caption && <figcaption className="text-center text-sm py-3 px-4 opacity-90" style={{ color: design?.text_color ? "inherit" : undefined }}>{caption}</figcaption>}
        </figure>
      </div>
    </SectionWrapper>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const title = (data.title as string) || "Features";
  const subtext = (data.subtext as string) || "";
  const items = (data.items as string[]) || [];
  const textColor = design?.text_color;
  const isDarkBg = design?.background_type === "gradient" || (design?.background_type === "color" && design?.background_color && String(design.background_color).toLowerCase() !== "#ffffff");
  const cardClass = isDarkBg ? "hover-lift bg-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-white/10 backdrop-blur-sm" : "hover-lift bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100/80";
  return (
    <SectionWrapper design={design}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: textColor || undefined }}>{title}</h2>
          {subtext && <p className="max-w-2xl mx-auto opacity-90" style={{ color: textColor || undefined }}>{subtext}</p>}
        </div>
        <ul className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={i} className={cardClass}>
              <span className="leading-relaxed text-sm sm:text-base" style={{ color: textColor || "#1e293b" }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}

function CtaBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const heading = (data.heading as string) || (data.title as string) || "Get in touch";
  const subtext = (data.subtext as string) || (data.subtitle as string) || "";
  const buttonText = (data.buttonText as string) || (data.cta_text as string) || "Contact";
  const buttonLink = (data.buttonLink as string) || (data.cta_link as string) || "#";
  const secondaryText = (data.secondaryText as string) || "";
  const secondaryLink = (data.secondaryLink as string) || "";
  const hasDesign = design?.background_type || design?.gradient_from;
  return (
    <SectionWrapper design={hasDesign ? design : { background_type: "gradient", gradient_from: "var(--color-primary)", gradient_to: "var(--color-primary-dark)", text_color: "#ffffff", padding_top: 48, padding_bottom: 48 }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" aria-hidden />
      <div className="relative">
        <div className={containerClass + " text-center max-w-2xl mx-auto"}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 break-words">{heading}</h2>
          {subtext && <p className="opacity-90 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed break-words">{subtext}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href={buttonLink} className="btn-flashy inline-block bg-white text-primary-dark font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-glow hover:bg-white/95 transition-colors min-h-[48px] flex items-center justify-center">
              {buttonText}
            </a>
            {secondaryText && secondaryLink && (
              <a href={secondaryLink} className="inline-block font-medium opacity-90 hover:opacity-100 border border-current px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors min-h-[44px] flex items-center justify-center">
                {secondaryText}
              </a>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function StatsBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const title = (data.title as string) || "Let's talk numbers";
  const subtext = (data.subtext as string) || "";
  const items = (data.items as Array<{ value?: string; label?: string }>) || (data.stats as Array<{ value?: string; label?: string }>) || [];
  const textColor = design?.text_color;
  return (
    <SectionWrapper design={design}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: textColor || undefined }}>{title}</h2>
          {subtext && <p className="text-lg max-w-xl mx-auto opacity-90" style={{ color: textColor || undefined }}>{subtext}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {items.map((item, i) => (
            <div key={i} className={`hover-lift text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl ${design?.background_type === "gradient" || (design?.background_color && String(design.background_color) !== "#ffffff") ? "bg-white/10 border border-white/10 backdrop-blur-sm" : "bg-zensar-surface border border-gray-100"}`}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words" style={{ color: textColor || "var(--color-primary)" }}>{item.value ?? ""}</div>
              <div className="text-xs sm:text-sm font-medium mt-1 sm:mt-2 break-words opacity-90" style={{ color: textColor || undefined }}>{item.label ?? ""}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function TestimonialsBlock({ data }: { data: Record<string, unknown> }) {
  const design = data.design as SectionDesign | undefined;
  const title = (data.title as string) || "What Our Clients Say";
  const subtext = (data.subtext as string) || (data.subtitle as string) || "";
  const items = (data.items as Array<{ quote?: string; text?: string; author?: string; name?: string; role?: string; company?: string; image_url?: string; avatar?: string }>) || (data.testimonials as Array<{ quote?: string; text?: string; author?: string; name?: string; role?: string; company?: string; image_url?: string }>) || [];
  const textColor = design?.text_color;
  return (
    <SectionWrapper design={design}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: textColor || undefined }}>{title}</h2>
          {subtext && <p className="max-w-xl mx-auto opacity-90" style={{ color: textColor || undefined }}>{subtext}</p>}
        </div>
        <ul className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {items.map((item, i) => {
            const quote = item.quote ?? item.text ?? "";
            const author = item.author ?? item.name ?? "";
            const avatar = item.image_url ?? item.avatar;
            return (
              <li key={i} className="hover-lift bg-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-white/10 backdrop-blur-sm relative">
                <span className="absolute top-4 left-4 sm:top-6 sm:left-6 text-3xl sm:text-4xl opacity-30 font-serif" style={{ color: textColor || undefined }}>&ldquo;</span>
                <p className="leading-relaxed pl-6 sm:pl-8 pr-4 mb-4 sm:mb-6 text-sm sm:text-base opacity-95" style={{ color: textColor || undefined }}>{quote}</p>
                <div className="flex items-center gap-3 sm:gap-4 pl-6 sm:pl-8">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg" style={{ color: textColor || undefined }}>{author?.charAt(0) ?? "?"}</div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: textColor || undefined }}>{author}</p>
                    {(item.role || item.company) && (
                      <p className="text-sm opacity-80" style={{ color: textColor || undefined }}>{[item.role, item.company].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionWrapper>
  );
}

/** Normalize legacy service_list (cards) or services-grid (services) into unified services data. */
function normalizeServicesData(data: Record<string, unknown>): Record<string, unknown> {
  const cards = data.cards as Array<Record<string, unknown>> | undefined;
  const services = data.services as Array<Record<string, unknown>> | undefined;
  if (cards && !services) {
    return {
      layout: "cards",
      title: data.title ?? "Our Services",
      subtitle: data.subtitle ?? "",
      services: cards.map((c) => ({
        enabled: true,
        title: c.title,
        icons: c.icons,
        button_text: c.button_text,
        button_link: c.button_link,
        link: c.link,
      })),
      design: data.design,
    };
  }
  if (services) {
    return {
      layout: data.layout ?? "grid",
      title: data.title ?? "Our Services",
      subtitle: data.subtitle ?? "",
      services: services.map((s) => ({ ...s, enabled: (s.enabled as boolean) !== false })),
      design: data.design,
    };
  }
  return data;
}

function ServicesBlock({ data }: { data: Record<string, unknown> }) {
  const normalized = normalizeServicesData(data);
  return (
    <ServicesSection
      data={{
        layout: normalized.layout as "cards" | "grid",
        title: normalized.title as string,
        subtitle: normalized.subtitle as string,
        services: (normalized.services as Array<Record<string, unknown>>) ?? [],
        design: normalized.design as Record<string, unknown> | undefined,
      }}
      design={normalized.design as Record<string, unknown> | undefined}
    />
  );
}

const BLOCKS: Record<string, React.FC<{ data: Record<string, unknown> }>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  features: FeaturesBlock,
  cta: CtaBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  services: ServicesBlock,
  service_list: ServicesBlock,
  "services-grid": ServicesBlock,
};

export default function SectionRenderer({ section }: { section: Section }) {
  const { type, data = {} } = section;
  const Block = BLOCKS[type] || TextBlock;
  return <Block data={data} />;
}
