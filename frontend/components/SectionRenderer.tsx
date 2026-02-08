"use client";

import React from "react";

export type Section = { type: string; data: Record<string, unknown>; id?: string };

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "Welcome";
  const subheading = (data.subheading as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "#";
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark text-white py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" aria-hidden />
      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-5 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {heading}
        </h1>
        {subheading && (
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {subheading}
          </p>
        )}
        {buttonText && (
          <a
            href={buttonLink}
            className="btn-flashy inline-block bg-white text-primary-dark font-semibold px-8 py-4 rounded-xl shadow-glow hover:bg-white/95 transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const content = (data.content as string) || "";
  return (
    <section className="py-14 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg text-gray-700 animate-fade-in-up">
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) || "";
  const alt = (data.alt as string) || "Image";
  if (!url) return null;
  return (
    <section className="py-10 px-4">
      <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 transition duration-300 hover:shadow-2xl hover:ring-primary/20">
        <img src={url} alt={alt} className="w-full object-cover max-h-96 transition duration-500 hover:scale-105" />
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "Features";
  const items = (data.items as string[]) || [];
  return (
    <section className="py-20 px-4 bg-zensar-surface">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-zensar-dark mb-10 text-center">{title}</h2>
        <ul className="grid gap-5 md:grid-cols-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="hover-lift bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="text-gray-700">{item}</span>
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
  return (
    <section className="relative py-20 px-4 bg-primary text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_50%,rgba(255,255,255,0.08),transparent)]" aria-hidden />
      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{heading}</h2>
        {subtext && <p className="text-white/90 mb-8 text-lg">{subtext}</p>}
        <a
          href={buttonLink}
          className="btn-flashy inline-block bg-white text-primary-dark font-semibold px-8 py-4 rounded-xl shadow-glow hover:bg-white/95 transition-colors"
        >
          {buttonText}
        </a>
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
};

export default function SectionRenderer({ section }: { section: Section }) {
  const { type, data = {} } = section;
  const Block = BLOCKS[type] || TextBlock;
  return <Block data={data} />;
}
