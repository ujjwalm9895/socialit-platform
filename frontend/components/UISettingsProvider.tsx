"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { fetcher, LAYOUT_SWR_CONFIG } from "@/lib/swr";

interface UISettings {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number;
  heading1Size: number;
  heading2Size: number;
  heading3Size: number;
  lineHeight: number;
  letterSpacing: number;
  sectionPaddingTop: number;
  sectionPaddingBottom: number;
  containerPadding: number;
  cardPadding: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  borderRadiusSmall: number;
  borderRadiusMedium: number;
  borderRadiusLarge: number;
  buttonBorderRadius: number;
  cardBorderRadius: number;
  shadowSmall: string;
  shadowMedium: string;
  shadowLarge: string;
  cardShadow: string;
  buttonShadow: string;
  transitionDuration: number;
  hoverScale: number;
  hoverLift: number;
  containerMaxWidth: number;
  gridGap: number;
  sectionGap: number;
}

const defaultUISettings: UISettings = {
  fontFamily: "Inter, system-ui, sans-serif",
  headingFontFamily: "Inter, system-ui, sans-serif",
  baseFontSize: 16,
  heading1Size: 48,
  heading2Size: 36,
  heading3Size: 24,
  lineHeight: 1.6,
  letterSpacing: 0,
  sectionPaddingTop: 80,
  sectionPaddingBottom: 80,
  containerPadding: 24,
  cardPadding: 24,
  buttonPaddingX: 24,
  buttonPaddingY: 12,
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  buttonBorderRadius: 8,
  cardBorderRadius: 12,
  shadowSmall: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMedium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  shadowLarge: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  buttonShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  transitionDuration: 300,
  hoverScale: 1.05,
  hoverLift: 4,
  containerMaxWidth: 1280,
  gridGap: 24,
  sectionGap: 80,
};

export default function UISettingsProvider({ children }: { children: React.ReactNode }) {
  const applyUISettings = (settings: UISettings) => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    
    // Typography
    root.style.setProperty("--ui-font-family", settings.fontFamily);
    root.style.setProperty("--ui-heading-font-family", settings.headingFontFamily);
    root.style.setProperty("--ui-base-font-size", `${settings.baseFontSize}px`);
    root.style.setProperty("--ui-heading1-size", `${settings.heading1Size}px`);
    root.style.setProperty("--ui-heading2-size", `${settings.heading2Size}px`);
    root.style.setProperty("--ui-heading3-size", `${settings.heading3Size}px`);
    root.style.setProperty("--ui-line-height", settings.lineHeight.toString());
    root.style.setProperty("--ui-letter-spacing", `${settings.letterSpacing}em`);
    
    // Spacing
    root.style.setProperty("--ui-section-padding-top", `${settings.sectionPaddingTop}px`);
    root.style.setProperty("--ui-section-padding-bottom", `${settings.sectionPaddingBottom}px`);
    root.style.setProperty("--ui-container-padding", `${settings.containerPadding}px`);
    root.style.setProperty("--ui-card-padding", `${settings.cardPadding}px`);
    root.style.setProperty("--ui-button-padding-x", `${settings.buttonPaddingX}px`);
    root.style.setProperty("--ui-button-padding-y", `${settings.buttonPaddingY}px`);
    
    // Border Radius
    root.style.setProperty("--ui-border-radius-small", `${settings.borderRadiusSmall}px`);
    root.style.setProperty("--ui-border-radius-medium", `${settings.borderRadiusMedium}px`);
    root.style.setProperty("--ui-border-radius-large", `${settings.borderRadiusLarge}px`);
    root.style.setProperty("--ui-button-border-radius", `${settings.buttonBorderRadius}px`);
    root.style.setProperty("--ui-card-border-radius", `${settings.cardBorderRadius}px`);
    
    // Shadows
    root.style.setProperty("--ui-shadow-small", settings.shadowSmall);
    root.style.setProperty("--ui-shadow-medium", settings.shadowMedium);
    root.style.setProperty("--ui-shadow-large", settings.shadowLarge);
    root.style.setProperty("--ui-card-shadow", settings.cardShadow);
    root.style.setProperty("--ui-button-shadow", settings.buttonShadow);
    
    // Animations
    root.style.setProperty("--ui-transition-duration", `${settings.transitionDuration}ms`);
    root.style.setProperty("--ui-hover-scale", settings.hoverScale.toString());
    root.style.setProperty("--ui-hover-lift", `${settings.hoverLift}px`);
    
    // Layout
    root.style.setProperty("--ui-container-max-width", `${settings.containerMaxWidth}px`);
    root.style.setProperty("--ui-grid-gap", `${settings.gridGap}px`);
    root.style.setProperty("--ui-section-gap", `${settings.sectionGap}px`);
  };

  const { data: uiData = defaultUISettings } = useSWR<UISettings>(
    "/cms/site-settings/ui",
    fetcher,
    { ...LAYOUT_SWR_CONFIG, fallbackData: defaultUISettings }
  );

  useEffect(() => {
    applyUISettings(uiData);
  }, [uiData]);

  useEffect(() => {
    const handleUIUpdate = (event: CustomEvent) => {
      applyUISettings(event.detail);
    };
    window.addEventListener("ui-settings-updated", handleUIUpdate as EventListener);
    return () => window.removeEventListener("ui-settings-updated", handleUIUpdate as EventListener);
  }, []);

  return <>{children}</>;
}
