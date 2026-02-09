"use client";

import React from "react";

export type Section = { type: string; data: Record<string, unknown>; id?: string };

const sectionPadding = "py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8";
const containerClass = "max-w-5xl mx-auto w-full";

function HeroBlock({ data }: { data: Record<string, unknown> }) {
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
  const content = (data.content as string) || "";
  const title = (data.title as string) || "";
  return (
    <section className={`${sectionPadding} bg-white`}>
      <div className={containerClass}>
        {title && <h2 className="text-2xl md:text-3xl font-bold text-zensar-dark mb-6">{title}</h2>}
        <div className="prose prose-lg text-gray-600 max-w-3xl prose-p:leading-relaxed animate-fade-in-up">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) || "";
  const alt = (data.alt as string) || "Image";
  const caption = (data.caption as string) || "";
  if (!url) return null;
  return (
    <section className={`${sectionPadding} bg-zensar-surface`}>
      <div className={containerClass}>
        <figure className="overflow-hidden rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-black/5 transition duration-300 hover:shadow-xl hover:ring-primary/20">
          <img src={url} alt={alt} className="w-full h-auto object-cover max-h-[18rem] sm:max-h-[24rem] md:max-h-[28rem] transition duration-500 hover:scale-[1.02]" />
          {caption && <figcaption className="text-center text-sm text-gray-500 py-3 px-4 bg-white">{caption}</figcaption>}
        </figure>
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "Features";
  const subtext = (data.subtext as string) || "";
  const items = (data.items as string[]) || [];
  return (
    <section className={`${sectionPadding} bg-zensar-surface`}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zensar-dark mb-3">{title}</h2>
          {subtext && <p className="text-gray-600 max-w-2xl mx-auto">{subtext}</p>}
        </div>
        <ul className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li key={i} className="hover-lift bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100/80">
              <span className="text-gray-700 leading-relaxed text-sm sm:text-base">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CtaBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "Get in touch";
  const subtext = (data.subtext as string) || "";
  const buttonText = (data.buttonText as string) || "Contact";
  const buttonLink = (data.buttonLink as string) || "#";
  const secondaryText = (data.secondaryText as string) || "";
  const secondaryLink = (data.secondaryLink as string) || "";
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(255,255,255,0.1),transparent)]" aria-hidden />
      <div className={`relative ${sectionPadding}`}>
        <div className={containerClass + " text-center max-w-2xl mx-auto"}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 break-words">{heading}</h2>
          {subtext && <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed break-words">{subtext}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href={buttonLink} className="btn-flashy inline-block bg-white text-primary-dark font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-glow hover:bg-white/95 transition-colors min-h-[48px] flex items-center justify-center">
              {buttonText}
            </a>
            {secondaryText && secondaryLink && (
              <a href={secondaryLink} className="inline-block font-medium text-white/90 hover:text-white border border-white/50 hover:border-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors min-h-[44px] flex items-center justify-center">
                {secondaryText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "Let's talk numbers";
  const subtext = (data.subtext as string) || "";
  const items = (data.items as Array<{ value?: string; label?: string }>) || [];
  return (
    <section className={`${sectionPadding} bg-white border-y border-gray-100`}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zensar-dark mb-3">{title}</h2>
          {subtext && <p className="text-zensar-muted text-lg max-w-xl mx-auto">{subtext}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {items.map((item, i) => (
            <div key={i} className="hover-lift text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-zensar-surface border border-gray-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary tracking-tight break-words">{item.value ?? ""}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 mt-1 sm:mt-2 break-words">{item.label ?? ""}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "What Our Clients Say";
  const subtext = (data.subtext as string) || "";
  const items = (data.items as Array<{ quote?: string; author?: string; role?: string; company?: string; image_url?: string }>) || [];
  return (
    <section className={`${sectionPadding} bg-zensar-surface`}>
      <div className={containerClass}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zensar-dark mb-3">{title}</h2>
          {subtext && <p className="text-gray-600 max-w-xl mx-auto">{subtext}</p>}
        </div>
        <ul className="grid gap-6 sm:gap-8 md:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="hover-lift bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 relative">
              <span className="absolute top-4 left-4 sm:top-6 sm:left-6 text-3xl sm:text-4xl text-primary/20 font-serif">&ldquo;</span>
              <p className="text-gray-700 leading-relaxed pl-6 sm:pl-8 pr-4 mb-4 sm:mb-6 text-sm sm:text-base">{item.quote ?? ""}</p>
              <div className="flex items-center gap-3 sm:gap-4 pl-6 sm:pl-8">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{item.author?.charAt(0) ?? "?"}</div>
                )}
                <div>
                  <p className="font-semibold text-zensar-dark">{item.author ?? ""}</p>
                  {(item.role || item.company) && (
                    <p className="text-sm text-gray-500">{[item.role, item.company].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
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
};

export default function SectionRenderer({ section }: { section: Section }) {
  const { type, data = {} } = section;
  const Block = BLOCKS[type] || TextBlock;
  return <Block data={data} />;
}
