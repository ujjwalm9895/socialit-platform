"use client";

import Link from "next/link";

/** Block-based hero: design + left_blocks + right_blocks. Legacy: headline, description, etc. */
export type HeroDesign = {
  background_type?: "color" | "gradient" | "image";
  background_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  background_image_url?: string;
  overlay_opacity?: number;
  text_color?: string;
  padding_top?: number;
  padding_bottom?: number;
  layout?: "two_column" | "single_column";
  left_width?: string; // e.g. "5/12" or "42%"
  /** Font family for entire hero (e.g. "Inter", "DM Sans", "system-ui, sans-serif") */
  font_family?: string;
  /** Primary CTA button gradient */
  primary_btn_gradient_from?: string;
  primary_btn_gradient_to?: string;
  /** Outline/secondary button */
  outline_btn_border_color?: string;
  outline_btn_text_color?: string;
  /** Email input */
  email_input_bg?: string;
  email_input_border_color?: string;
  email_placeholder_color?: string;
  /** Logo row heading */
  logo_row_headline_color?: string;
  /** Chat button (floating) */
  chat_btn_bg_from?: string;
  chat_btn_bg_to?: string;
  chat_btn_text_color?: string;
};

export type HeroBlock = {
  id?: string;
  type: string;
  content?: Record<string, unknown>;
  style?: Record<string, unknown>;
};

export type HeroSectionData = {
  enabled?: boolean;
  design?: HeroDesign;
  left_blocks?: HeroBlock[];
  right_blocks?: HeroBlock[];
  blocks?: HeroBlock[];
  // Legacy
  headline?: string;
  description?: string;
  tagline?: string;
  email_placeholder?: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  awards_headline?: string;
  award_logos?: Array<{ image_url?: string; link_url?: string; alt?: string }>;
  banner_image_url?: string;
  background_image_url?: string;
  chat_button_text?: string;
  chat_button_link?: string;
  data_cards?: Array<{ title?: string; value?: string; label?: string }>;
};

function ExploreIcon() {
  return (
    <span className="inline-flex items-center justify-center">
      <svg width="10" className="shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 15" aria-hidden>
        <path fill="currentColor" d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" />
      </svg>
    </span>
  );
}

const DEFAULT_HERO_FONT = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function renderBlock(block: HeroBlock, textColor: string, key: string, design?: HeroDesign) {
  const c = block.content ?? {};
  const style = block.style ?? {};
  const align = (style.align as string) || "left";
  const marginTop = (style.marginTop as number) ?? 0;
  const marginBottom = (style.marginBottom as number) ?? 0;
  const fontSize = (style.fontSize as string) || undefined;
  const color = (style.color as string) || textColor;
  const baseClass = "w-full";
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const primaryFrom = design?.primary_btn_gradient_from ?? "#9333ea";
  const primaryTo = design?.primary_btn_gradient_to ?? "#db2777";
  const outlineBorder = design?.outline_btn_border_color ?? "#7808d0";
  const outlineText = design?.outline_btn_text_color ?? textColor;
  const emailBg = design?.email_input_bg ?? "rgba(255,255,255,0.1)";
  const emailBorder = design?.email_input_border_color ?? "rgba(255,255,255,0.2)";
  const logoHeadlineColor = design?.logo_row_headline_color ?? textColor;

  switch (block.type) {
    case "heading": {
      const level = (c.level as string) || "h2";
      const text = (c.text as string) || "";
      const Tag = level === "h1" ? "h1" : level === "h3" ? "h3" : "h2";
      const defaultSize = level === "h1" ? "2rem" : level === "h3" ? "1.25rem" : "1.875rem";
      return (
        <Tag
          key={key}
          className={`${baseClass} font-bold tracking-tight ${alignClass}`}
          style={{ color, marginTop, marginBottom, fontSize: fontSize || defaultSize }}
        >
          {text}
        </Tag>
      );
    }
    case "paragraph": {
      const text = (c.text as string) || "";
      return (
        <p key={key} className={`${baseClass} leading-relaxed ${alignClass}`} style={{ color, marginTop, marginBottom, fontSize: fontSize || "1rem" }}>
          {text}
        </p>
      );
    }
    case "tagline": {
      const text = (c.text as string) || "";
      return (
        <p key={key} className={`${baseClass} font-medium opacity-90 ${alignClass}`} style={{ color, marginTop, marginBottom, fontSize: fontSize || "1.125rem" }}>
          {text}
        </p>
      );
    }
    case "email_input": {
      const placeholder = (c.placeholder as string) || "Enter your email";
      const placeholderColor = design?.email_placeholder_color ?? "rgba(255,255,255,0.5)";
      return (
        <div key={key} className={baseClass} style={{ marginTop, marginBottom, ["--hero-placeholder" as string]: placeholderColor }}>
          <input
            type="email"
            placeholder={placeholder}
            name="email"
            className="hero-email-input w-full max-w-md rounded-lg px-4 py-3 focus:ring-2 focus:ring-white/30 outline-none"
            style={{
              color: textColor,
              backgroundColor: emailBg,
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: emailBorder,
            }}
          />
        </div>
      );
    }
    case "button": {
      const text = (c.text as string) || "";
      const link = (c.link as string) || "#";
      const btnStyle = (c.style as string) || "primary";
      const isPrimary = btnStyle === "primary";
      return (
        <div key={key} className={baseClass} style={{ marginTop, marginBottom }}>
          <Link
            href={link}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold transition shadow-lg"
            style={
              isPrimary
                ? { background: `linear-gradient(to right, ${primaryFrom}, ${primaryTo})`, color: "#fff" }
                : { border: `2px solid ${outlineBorder}`, color: outlineText }
            }
          >
            {text}
          </Link>
        </div>
      );
    }
    case "button_group": {
      const buttons = (c.buttons as Array<{ text?: string; link?: string; style?: string }>) || [];
      return (
        <div key={key} className={`${baseClass} flex flex-wrap gap-3 ${alignClass}`} style={{ marginTop, marginBottom }}>
          {buttons.map((btn, i) => (
            <Link
              key={i}
              href={btn.link ?? "#"}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition shadow-lg hover:opacity-95"
              style={
                btn.style === "primary"
                  ? { background: `linear-gradient(to right, ${primaryFrom}, ${primaryTo})`, color: "#fff" }
                  : { border: `2px solid ${outlineBorder}`, color: outlineText }
              }
            >
              {btn.style === "outline" && <ExploreIcon />}
              {btn.text ?? "Button"}
            </Link>
          ))}
        </div>
      );
    }
    case "image": {
      const url = (c.url as string) || "";
      const alt = (c.alt as string) || "";
      const link = c.link as string | undefined;
      if (!url) return null;
      const img = <img src={url} alt={alt} className="w-full h-auto rounded-lg object-cover" />;
      return (
        <div key={key} className={baseClass} style={{ marginTop, marginBottom }}>
          {link ? <Link href={link}>{img}</Link> : img}
        </div>
      );
    }
    case "logo_row": {
      const headline = (c.headline as string) || "";
      const logos = (c.logos as Array<{ image_url?: string; link_url?: string; alt?: string }>) || [];
      const headlineColor = (style.color as string) || logoHeadlineColor;
      return (
        <div key={key} className={baseClass} style={{ marginTop, marginBottom }}>
          {headline && <p className="text-sm font-medium opacity-80 mb-2" style={{ color: headlineColor, fontSize: fontSize || undefined }}>{headline}</p>}
          <div className="grid grid-cols-3 gap-4">
            {logos.map((logo, i) => (
              <div key={i} className="flex items-center justify-center">
                {logo.link_url ? (
                  <Link href={logo.link_url} className="block opacity-90 hover:opacity-100">
                    {logo.image_url ? <img src={logo.image_url} alt={logo.alt ?? ""} className="max-h-12 w-auto object-contain" /> : <span className="text-sm opacity-70">{logo.alt}</span>}
                  </Link>
                ) : logo.image_url ? (
                  <img src={logo.image_url} alt={logo.alt ?? ""} className="max-h-12 w-auto object-contain opacity-90" />
                ) : (
                  <span className="text-sm opacity-70">{logo.alt}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "spacer":
      return <div key={key} style={{ height: (c.height as number) || 24, minHeight: 1 }} aria-hidden />;
    case "divider":
      return <hr key={key} className="border-white/20 my-4" style={{ marginTop, marginBottom }} />;
    case "custom_html": {
      const html = (c.html as string) || "";
      if (!html) return null;
      return <div key={key} className={baseClass} style={{ marginTop, marginBottom }} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    default:
      return null;
  }
}

function BlockBasedHero({ data }: { data: HeroSectionData }) {
  const design = data.design ?? {};
  const layout = design.layout ?? "two_column";
  const backgroundType = design.background_type ?? "color";
  const backgroundColor = design.background_color ?? "#0f172a";
  const gradientFrom = design.gradient_from ?? "#0f172a";
  const gradientTo = design.gradient_to ?? "#1e293b";
  const backgroundImageUrl = design.background_image_url ?? "";
  const overlayOpacity = design.overlay_opacity ?? 0.3;
  const textColor = design.text_color ?? "#ffffff";
  const paddingTop = design.padding_top ?? 80;
  const paddingBottom = design.padding_bottom ?? 80;
  const leftBlocks = data.left_blocks ?? [];
  const rightBlocks = data.right_blocks ?? [];
  const singleBlocks = data.blocks ?? [];
  const leftWidth = design.left_width === "1/2" ? "50%" : design.left_width === "1/3" ? "33.333%" : "42%";

  const fontFamily = design.font_family || DEFAULT_HERO_FONT;
  const chatFrom = design.chat_btn_bg_from ?? "#9333ea";
  const chatTo = design.chat_btn_bg_to ?? "#db2777";
  const chatTextColor = design.chat_btn_text_color ?? "#ffffff";

  const bgStyle: React.CSSProperties =
    backgroundType === "gradient"
      ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
      : backgroundType === "image" && backgroundImageUrl
        ? { backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { backgroundColor };

  return (
    <section id="herotop" className="relative overflow-hidden" style={{ ...bgStyle, color: textColor, fontFamily }}>
      {backgroundType === "image" && backgroundImageUrl && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} aria-hidden />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop, paddingBottom }}>
        {layout === "single_column" ? (
          <div className="max-w-3xl mx-auto space-y-2">
            {singleBlocks.map((b, i) => renderBlock(b, textColor, b.id ?? `b-${i}`, design))}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10 md:gap-8 items-stretch">
            <div className="flex flex-col space-y-2" style={{ width: "100%", maxWidth: layout === "two_column" && rightBlocks.length > 0 ? leftWidth : "100%" }}>
              {leftBlocks.map((b, i) => renderBlock(b, textColor, b.id ?? `left-${i}`, design))}
            </div>
            {rightBlocks.length > 0 && (
              <div className="flex flex-col space-y-2 flex-1 min-w-0">
                {rightBlocks.map((b, i) => renderBlock(b, textColor, b.id ?? `right-${i}`, design))}
              </div>
            )}
          </div>
        )}
      </div>
      {(data.chat_button_text && data.chat_button_link) && (
        <div className="absolute bottom-6 right-6 z-10">
          <Link
            href={data.chat_button_link}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition shadow-lg hover:opacity-95"
            style={{ background: `linear-gradient(to right, ${chatFrom}, ${chatTo})`, color: chatTextColor }}
          >
            {data.chat_button_text}
          </Link>
        </div>
      )}
    </section>
  );
}

function LegacyHero({ data }: { data: HeroSectionData }) {
  const headline = data.headline ?? "Weaving Your Brand's Digital Success Story";
  const description = data.description ?? "";
  const tagline = data.tagline ?? "";
  const emailPlaceholder = data.email_placeholder ?? "Enter your email";
  const ctaPrimaryText = data.cta_primary_text ?? "Get A Demo";
  const ctaPrimaryLink = data.cta_primary_link ?? "/contact";
  const ctaSecondaryText = data.cta_secondary_text ?? "Explore Case Study";
  const ctaSecondaryLink = data.cta_secondary_link ?? "/case-studies";
  const awardsHeadline = data.awards_headline ?? "Trusted & Awarded By Global Leaders";
  const awardLogos = data.award_logos ?? [];
  const bannerImageUrl = data.banner_image_url ?? data.background_image_url ?? "";
  const chatButtonText = data.chat_button_text ?? "Let's Chat";
  const chatButtonLink = data.chat_button_link ?? "/contact";
  const dataCards = data.data_cards ?? [];

  return (
    <section id="herotop" className="relative bg-slate-900 text-white overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="row flex flex-col md:flex-row gap-10 md:gap-8 items-center">
          <div className="w-full md:w-5/12 lg:max-w-[42%] flex flex-col">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">{headline}</h3>
            {description && <p className="text-base sm:text-lg text-white/90 mb-3 leading-relaxed">{description}</p>}
            {tagline && <h1 className="text-xl sm:text-2xl font-semibold text-white/90 mb-4">{tagline}</h1>}
            <div className="grmail space-y-3 mb-3">
              <div className="mb-3">
                <input type="email" placeholder={emailPlaceholder} name="email" className="form-control w-full max-w-md bg-slate-800 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="mb-3 flex flex-wrap gap-3">
                <Link href={ctaPrimaryLink} className="btn inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition shadow-lg">{ctaPrimaryText}</Link>
                <Link href={ctaSecondaryLink} className="button inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white border-2 border-[#7808d0] hover:bg-white/5 transition">
                  <ExploreIcon /> {ctaSecondaryText}
                </Link>
              </div>
            </div>
            {awardsHeadline && <p className="mt-3 text-sm font-medium text-white/80">{awardsHeadline}</p>}
            {awardLogos.length > 0 && (
              <div className="row grid grid-cols-3 gap-4 mt-3">
                {awardLogos.slice(0, 3).map((logo, i) => (
                  <div key={i} className="flex items-center justify-center">
                    {logo.link_url ? (
                      <Link href={logo.link_url} className="block opacity-90 hover:opacity-100">
                        {logo.image_url ? <img src={logo.image_url} alt={logo.alt ?? ""} className="max-h-12 w-auto object-contain" /> : <span className="text-white/70 text-sm">{logo.alt}</span>}
                      </Link>
                    ) : logo.image_url ? (
                      <img src={logo.image_url} alt={logo.alt ?? ""} className="max-h-12 w-auto object-contain opacity-90" />
                    ) : (
                      <span className="text-white/70 text-sm">{logo.alt}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-full md:w-7/12 lg:max-w-[58%] flex items-center justify-center">
            {bannerImageUrl ? (
              <img src={bannerImageUrl} alt="" className="img-fluid w-full h-auto rounded-lg object-cover" />
            ) : dataCards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 w-full">
                {dataCards.slice(0, 8).map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-white/10 text-slate-900">
                    <div className="text-xl font-bold">{card.value ?? "—"}</div>
                    <div className="text-sm text-slate-600">{card.label || card.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-white/40 text-sm">Add content in Admin → Homepage</div>
            )}
          </div>
        </div>
      </div>
      {chatButtonText && chatButtonLink && (
        <div className="absolute bottom-6 right-6 z-10">
          <Link href={chatButtonLink} className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition shadow-lg">{chatButtonText}</Link>
        </div>
      )}
    </section>
  );
}

/** Renders hero from section data. Supports block-based (design + left_blocks + right_blocks) or legacy (headline, description, ...). */
export default function HeroSection({ config }: { config: HeroSectionData | null }) {
  if (!config) return null;
  if (config.enabled === false) return null;
  const useBlockBased = Array.isArray(config.left_blocks) && config.left_blocks.length > 0 || Array.isArray(config.right_blocks) && (config.right_blocks?.length ?? 0) > 0 || (config.design?.layout === "single_column" && Array.isArray(config.blocks) && config.blocks.length > 0);
  if (useBlockBased) return <BlockBasedHero data={config} />;
  return <LegacyHero data={config} />;
}
