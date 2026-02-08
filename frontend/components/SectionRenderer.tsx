"use client";

import React from "react";

export type Section = { type: string; data: Record<string, unknown>; id?: string };

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "Welcome";
  const subheading = (data.subheading as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "#";
  return (
    <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{heading}</h1>
        {subheading && <p className="text-xl text-white/90 mb-8">{subheading}</p>}
        {buttonText && (
          <a
            href={buttonLink}
            className="inline-block bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary/10 transition"
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
    <section className="py-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg text-gray-700">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </section>
  );
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  const url = (data.url as string) || "";
  const alt = (data.alt as string) || "Image";
  if (!url) return null;
  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <img src={url} alt={alt} className="w-full rounded-lg shadow-lg object-cover max-h-96" />
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "Features";
  const items = (data.items as string[]) || [];
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <li key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              {item}
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
    <section className="py-16 px-4 bg-primary text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">{heading}</h2>
        {subtext && <p className="text-white/90 mb-6">{subtext}</p>}
        <a
          href={buttonLink}
          className="inline-block bg-white text-primary-dark font-semibold px-6 py-3 rounded-lg hover:bg-primary/10 transition"
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
