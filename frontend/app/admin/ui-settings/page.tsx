"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { motion } from "framer-motion";

interface UISettings {
  // Typography
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: number; // in px
  heading1Size: number;
  heading2Size: number;
  heading3Size: number;
  lineHeight: number;
  letterSpacing: number; // in em
  
  // Spacing
  sectionPaddingTop: number; // in px
  sectionPaddingBottom: number;
  containerPadding: number;
  cardPadding: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  
  // Border Radius
  borderRadiusSmall: number; // in px
  borderRadiusMedium: number;
  borderRadiusLarge: number;
  buttonBorderRadius: number;
  cardBorderRadius: number;
  
  // Shadows
  shadowSmall: string;
  shadowMedium: string;
  shadowLarge: string;
  cardShadow: string;
  buttonShadow: string;
  
  // Animations
  transitionDuration: number; // in ms
  hoverScale: number;
  hoverLift: number; // in px
  
  // Layout
  containerMaxWidth: number; // in px
  gridGap: number; // in px
  sectionGap: number; // in px
}

const defaultUISettings: UISettings = {
  // Typography
  fontFamily: "Inter, system-ui, sans-serif",
  headingFontFamily: "Inter, system-ui, sans-serif",
  baseFontSize: 16,
  heading1Size: 48,
  heading2Size: 36,
  heading3Size: 24,
  lineHeight: 1.6,
  letterSpacing: 0,
  
  // Spacing
  sectionPaddingTop: 80,
  sectionPaddingBottom: 80,
  containerPadding: 24,
  cardPadding: 24,
  buttonPaddingX: 24,
  buttonPaddingY: 12,
  
  // Border Radius
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  buttonBorderRadius: 8,
  cardBorderRadius: 12,
  
  // Shadows
  shadowSmall: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMedium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  shadowLarge: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  buttonShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  
  // Animations
  transitionDuration: 300,
  hoverScale: 1.05,
  hoverLift: 4,
  
  // Layout
  containerMaxWidth: 1280,
  gridGap: 24,
  sectionGap: 80,
};

export default function UISettingsPage() {
  const [settings, setSettings] = useState<UISettings>(defaultUISettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"typography" | "spacing" | "shadows" | "animations" | "layout">("typography");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiClient.get("/cms/site-settings/ui");
        if (response.data) {
          setSettings({ ...defaultUISettings, ...response.data });
          applyUISettings({ ...defaultUISettings, ...response.data });
        } else {
          applyUISettings(defaultUISettings);
        }
      } catch (error) {
        console.error("Failed to load UI settings, using defaults:", error);
        applyUISettings(defaultUISettings);
      }
    };
    loadSettings();
  }, []);

  const applyUISettings = (uiSettings: UISettings) => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    
    // Typography
    root.style.setProperty("--ui-font-family", uiSettings.fontFamily);
    root.style.setProperty("--ui-heading-font-family", uiSettings.headingFontFamily);
    root.style.setProperty("--ui-base-font-size", `${uiSettings.baseFontSize}px`);
    root.style.setProperty("--ui-heading1-size", `${uiSettings.heading1Size}px`);
    root.style.setProperty("--ui-heading2-size", `${uiSettings.heading2Size}px`);
    root.style.setProperty("--ui-heading3-size", `${uiSettings.heading3Size}px`);
    root.style.setProperty("--ui-line-height", uiSettings.lineHeight.toString());
    root.style.setProperty("--ui-letter-spacing", `${uiSettings.letterSpacing}em`);
    
    // Spacing
    root.style.setProperty("--ui-section-padding-top", `${uiSettings.sectionPaddingTop}px`);
    root.style.setProperty("--ui-section-padding-bottom", `${uiSettings.sectionPaddingBottom}px`);
    root.style.setProperty("--ui-container-padding", `${uiSettings.containerPadding}px`);
    root.style.setProperty("--ui-card-padding", `${uiSettings.cardPadding}px`);
    root.style.setProperty("--ui-button-padding-x", `${uiSettings.buttonPaddingX}px`);
    root.style.setProperty("--ui-button-padding-y", `${uiSettings.buttonPaddingY}px`);
    
    // Border Radius
    root.style.setProperty("--ui-border-radius-small", `${uiSettings.borderRadiusSmall}px`);
    root.style.setProperty("--ui-border-radius-medium", `${uiSettings.borderRadiusMedium}px`);
    root.style.setProperty("--ui-border-radius-large", `${uiSettings.borderRadiusLarge}px`);
    root.style.setProperty("--ui-button-border-radius", `${uiSettings.buttonBorderRadius}px`);
    root.style.setProperty("--ui-card-border-radius", `${uiSettings.cardBorderRadius}px`);
    
    // Shadows
    root.style.setProperty("--ui-shadow-small", uiSettings.shadowSmall);
    root.style.setProperty("--ui-shadow-medium", uiSettings.shadowMedium);
    root.style.setProperty("--ui-shadow-large", uiSettings.shadowLarge);
    root.style.setProperty("--ui-card-shadow", uiSettings.cardShadow);
    root.style.setProperty("--ui-button-shadow", uiSettings.buttonShadow);
    
    // Animations
    root.style.setProperty("--ui-transition-duration", `${uiSettings.transitionDuration}ms`);
    root.style.setProperty("--ui-hover-scale", uiSettings.hoverScale.toString());
    root.style.setProperty("--ui-hover-lift", `${uiSettings.hoverLift}px`);
    
    // Layout
    root.style.setProperty("--ui-container-max-width", `${uiSettings.containerMaxWidth}px`);
    root.style.setProperty("--ui-grid-gap", `${uiSettings.gridGap}px`);
    root.style.setProperty("--ui-section-gap", `${uiSettings.sectionGap}px`);
  };

  const handleChange = (key: keyof UISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applyUISettings(newSettings);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put("/cms/site-settings/ui", settings);
      
      // Trigger UI update event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ui-settings-updated", { detail: settings }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Failed to save UI settings:", error);
      alert(error.response?.data?.detail || "Failed to save UI settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      setSettings(defaultUISettings);
      applyUISettings(defaultUISettings);
      await apiClient.put("/cms/site-settings/ui", defaultUISettings);
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ui-settings-updated", { detail: defaultUISettings }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Failed to reset UI settings:", error);
      alert(error.response?.data?.detail || "Failed to reset UI settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "typography" as const, label: "📝 Typography", icon: "Aa" },
    { id: "spacing" as const, label: "📏 Spacing", icon: "↔" },
    { id: "shadows" as const, label: "🌑 Shadows", icon: "●" },
    { id: "animations" as const, label: "✨ Animations", icon: "⚡" },
    { id: "layout" as const, label: "📐 Layout", icon: "⊞" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">UI Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize typography, spacing, shadows, animations, and layout across your entire website
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reset to Default
          </button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
            }}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save UI Settings"}
          </motion.button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border-2 rounded-lg font-semibold hover:shadow-lg transition"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            👁️ View on Site
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 text-blue-600 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Typography Tab */}
      {activeTab === "typography" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Typography Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => handleChange("fontFamily", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="'Merriweather', serif">Merriweather</option>
                <option value="system-ui, sans-serif">System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading Font Family
              </label>
              <select
                value={settings.headingFontFamily}
                onChange={(e) => handleChange("headingFontFamily", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Inter, system-ui, sans-serif">Inter</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
                <option value="'Poppins', sans-serif">Poppins</option>
                <option value="'Playfair Display', serif">Playfair Display</option>
                <option value="'Merriweather', serif">Merriweather</option>
                <option value="system-ui, sans-serif">System Default</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Font Size: {settings.baseFontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={settings.baseFontSize}
                onChange={(e) => handleChange("baseFontSize", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => handleChange("lineHeight", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading 1 Size: {settings.heading1Size}px
              </label>
              <input
                type="range"
                min="32"
                max="72"
                value={settings.heading1Size}
                onChange={(e) => handleChange("heading1Size", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading 2 Size: {settings.heading2Size}px
              </label>
              <input
                type="range"
                min="24"
                max="56"
                value={settings.heading2Size}
                onChange={(e) => handleChange("heading2Size", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heading 3 Size: {settings.heading3Size}px
              </label>
              <input
                type="range"
                min="18"
                max="40"
                value={settings.heading3Size}
                onChange={(e) => handleChange("heading3Size", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Spacing: {settings.letterSpacing}em
              </label>
              <input
                type="range"
                min="-0.05"
                max="0.1"
                step="0.01"
                value={settings.letterSpacing}
                onChange={(e) => handleChange("letterSpacing", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Spacing Tab */}
      {activeTab === "spacing" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📏 Spacing Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Padding Top: {settings.sectionPaddingTop}px
              </label>
              <input
                type="range"
                min="40"
                max="160"
                value={settings.sectionPaddingTop}
                onChange={(e) => handleChange("sectionPaddingTop", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Padding Bottom: {settings.sectionPaddingBottom}px
              </label>
              <input
                type="range"
                min="40"
                max="160"
                value={settings.sectionPaddingBottom}
                onChange={(e) => handleChange("sectionPaddingBottom", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Padding: {settings.containerPadding}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={settings.containerPadding}
                onChange={(e) => handleChange("containerPadding", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Padding: {settings.cardPadding}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={settings.cardPadding}
                onChange={(e) => handleChange("cardPadding", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Padding X: {settings.buttonPaddingX}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                value={settings.buttonPaddingX}
                onChange={(e) => handleChange("buttonPaddingX", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Padding Y: {settings.buttonPaddingY}px
              </label>
              <input
                type="range"
                min="8"
                max="24"
                value={settings.buttonPaddingY}
                onChange={(e) => handleChange("buttonPaddingY", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Shadows Tab */}
      {activeTab === "shadows" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🌑 Shadow Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small Shadow
              </label>
              <select
                value={settings.shadowSmall}
                onChange={(e) => handleChange("shadowSmall", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="none">None</option>
                <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Subtle</option>
                <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Light</option>
                <option value="0 2px 4px 0 rgba(0, 0, 0, 0.1)">Medium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium Shadow
              </label>
              <select
                value={settings.shadowMedium}
                onChange={(e) => handleChange("shadowMedium", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="none">None</option>
                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Standard</option>
                <option value="0 6px 12px -2px rgba(0, 0, 0, 0.15)">Elevated</option>
                <option value="0 8px 16px -4px rgba(0, 0, 0, 0.2)">Strong</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Large Shadow
              </label>
              <select
                value={settings.shadowLarge}
                onChange={(e) => handleChange("shadowLarge", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="none">None</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Standard</option>
                <option value="0 15px 25px -5px rgba(0, 0, 0, 0.15)">Elevated</option>
                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.2)">Strong</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Shadow
              </label>
              <select
                value={settings.cardShadow}
                onChange={(e) => handleChange("cardShadow", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="none">None</option>
                <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Light</option>
                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Standard</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Elevated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Shadow
              </label>
              <select
                value={settings.buttonShadow}
                onChange={(e) => handleChange("buttonShadow", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="none">None</option>
                <option value="0 2px 4px 0 rgba(0, 0, 0, 0.1)">Light</option>
                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Standard</option>
                <option value="0 6px 12px -2px rgba(0, 0, 0, 0.15)">Elevated</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Animations Tab */}
      {activeTab === "animations" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">✨ Animation Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transition Duration: {settings.transitionDuration}ms
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={settings.transitionDuration}
                onChange={(e) => handleChange("transitionDuration", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hover Scale: {settings.hoverScale}x
              </label>
              <input
                type="range"
                min="1"
                max="1.2"
                step="0.01"
                value={settings.hoverScale}
                onChange={(e) => handleChange("hoverScale", parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hover Lift: {settings.hoverLift}px
              </label>
              <input
                type="range"
                min="0"
                max="12"
                value={settings.hoverLift}
                onChange={(e) => handleChange("hoverLift", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === "layout" && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📐 Layout Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container Max Width: {settings.containerMaxWidth}px
              </label>
              <input
                type="range"
                min="960"
                max="1920"
                step="40"
                value={settings.containerMaxWidth}
                onChange={(e) => handleChange("containerMaxWidth", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grid Gap: {settings.gridGap}px
              </label>
              <input
                type="range"
                min="12"
                max="48"
                step="4"
                value={settings.gridGap}
                onChange={(e) => handleChange("gridGap", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Gap: {settings.sectionGap}px
              </label>
              <input
                type="range"
                min="40"
                max="160"
                step="10"
                value={settings.sectionGap}
                onChange={(e) => handleChange("sectionGap", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius Small: {settings.borderRadiusSmall}px
              </label>
              <input
                type="range"
                min="0"
                max="16"
                value={settings.borderRadiusSmall}
                onChange={(e) => handleChange("borderRadiusSmall", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius Medium: {settings.borderRadiusMedium}px
              </label>
              <input
                type="range"
                min="0"
                max="24"
                value={settings.borderRadiusMedium}
                onChange={(e) => handleChange("borderRadiusMedium", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Border Radius Large: {settings.borderRadiusLarge}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={settings.borderRadiusLarge}
                onChange={(e) => handleChange("borderRadiusLarge", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Border Radius: {settings.buttonBorderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="24"
                value={settings.buttonBorderRadius}
                onChange={(e) => handleChange("buttonBorderRadius", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Border Radius: {settings.cardBorderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={settings.cardBorderRadius}
                onChange={(e) => handleChange("cardBorderRadius", parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">👁️ Live Preview</h2>
        <div className="space-y-4">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: `${settings.cardBorderRadius}px`,
              boxShadow: settings.cardShadow,
              padding: `${settings.cardPadding}px`,
            }}
          >
            <h3
              style={{
                fontFamily: settings.headingFontFamily,
                fontSize: `${settings.heading2Size}px`,
                lineHeight: settings.lineHeight,
                letterSpacing: `${settings.letterSpacing}em`,
                color: "var(--color-text)",
                marginBottom: "12px",
              }}
            >
              Sample Heading
            </h3>
            <p
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.baseFontSize}px`,
                lineHeight: settings.lineHeight,
                letterSpacing: `${settings.letterSpacing}em`,
                color: "var(--color-text-secondary)",
                marginBottom: "16px",
              }}
            >
              This is how your typography and spacing will look across the website.
            </p>
            <button
              className="transition-all"
              style={{
                padding: `${settings.buttonPaddingY}px ${settings.buttonPaddingX}px`,
                borderRadius: `${settings.buttonBorderRadius}px`,
                boxShadow: settings.buttonShadow,
                background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                color: "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(${settings.hoverScale}) translateY(-${settings.hoverLift}px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
