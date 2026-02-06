"use client";

import Header from "./Header";
import Footer from "./Footer";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { header, footer } = useSiteSettings();
  return (
    <div className="min-h-screen flex flex-col">
      <Header config={header} />
      <div className="flex-1">{children}</div>
      <Footer config={footer} />
    </div>
  );
}
