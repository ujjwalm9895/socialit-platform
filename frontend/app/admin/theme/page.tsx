"use client";

import { useState, useEffect } from "react";
import { getTheme, saveTheme, defaultTheme, Theme } from "@/lib/theme";
import apiClient from "@/lib/api";
import { motion } from "framer-motion";

export default function ThemePage() {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load theme from backend API
    const loadTheme = async () => {
      try {
        const response = await apiClient.get("/cms/site-settings/theme");
        if (response.data) {
          setTheme(response.data);
          saveTheme(response.data); // Also save to localStorage for instant updates
        } else {
          // Fallback to localStorage if API returns empty
          const localTheme = getTheme();
          setTheme(localTheme);
        }
      } catch (error) {
        console.error("Failed to load theme from API, using local:", error);
        // Fallback to localStorage
        const localTheme = getTheme();
        setTheme(localTheme);
      }
    };
    loadTheme();
  }, []);

  const handleColorChange = (key: keyof Theme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to backend API
      await apiClient.put("/cms/site-settings/theme", theme);
      
      // Also save to localStorage for instant updates
      saveTheme(theme);
      
      // Trigger a custom event to update all pages
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("theme-updated", { detail: theme }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Failed to save theme:", error);
      alert(error.response?.data?.detail || "Failed to save theme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      setTheme(defaultTheme);
      // Save to backend
      await apiClient.put("/cms/site-settings/theme", defaultTheme);
      // Save to localStorage
      saveTheme(defaultTheme);
      
      // Trigger theme update event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("theme-updated", { detail: defaultTheme }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Failed to reset theme:", error);
      alert(error.response?.data?.detail || "Failed to reset theme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const presetThemes = [
    {
      name: "Modern Premium (Recommended)",
      theme: defaultTheme,
    },
    {
      name: "Zensar Professional",
      theme: {
        primary: "#0066CC",
        secondary: "#00A8E8",
        accent: "#0052A5",
        background: "#FFFFFF",
        surface: "#F8F9FA",
        text: "#1A1A1A",
        textSecondary: "#6C757D",
        border: "#DEE2E6",
        success: "#28A745",
        warning: "#FFC107",
        error: "#DC3545",
        info: "#17A2B8",
      },
    },
    {
      name: "Modern Purple/Pink",
      theme: {
        primary: "#7C3AED",
        secondary: "#A78BFA",
        accent: "#EC4899",
        background: "#FFFFFF",
        surface: "#FAF5FF",
        text: "#1E1B4B",
        textSecondary: "#6B7280",
        border: "#E9D5FF",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#06B6D4",
      },
    },
    {
      name: "Corporate Blue",
      theme: {
        primary: "#1E40AF", // Deep blue
        secondary: "#3B82F6", // Medium blue
        accent: "#60A5FA", // Light blue
        background: "#FFFFFF",
        surface: "#F1F5F9",
        text: "#0F172A",
        textSecondary: "#64748B",
        border: "#CBD5E1",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
    },
    {
      name: "Tech Green",
      theme: {
        primary: "#059669", // Professional green
        secondary: "#10B981", // Bright green
        accent: "#34D399", // Light green
        background: "#FFFFFF",
        surface: "#F0FDF4",
        text: "#064E3B",
        textSecondary: "#6B7280",
        border: "#D1FAE5",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
    },
  ];

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize the color scheme for your entire website
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
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Theme"}
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

      {/* Preset Themes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">🎨 Preset Themes</h2>
        <p className="text-sm text-gray-600 mb-6">Choose a professional theme or customize your own</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {presetThemes.map((preset) => (
            <motion.button
              key={preset.name}
              onClick={async () => {
                setTheme(preset.theme);
                try {
                  // Save to backend
                  await apiClient.put("/cms/site-settings/theme", preset.theme);
                  // Save to localStorage
                  saveTheme(preset.theme);
                  
                  // Trigger theme update event
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("theme-updated", { detail: preset.theme }));
                  }
                  
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2000);
                } catch (error: any) {
                  console.error("Failed to apply preset theme:", error);
                  alert(error.response?.data?.detail || "Failed to apply theme. Please try again.");
                }
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 border-2 rounded-xl transition-all text-left hover:shadow-lg"
              style={{
                borderColor: preset.name.includes("Recommended") ? "var(--color-primary)" : "#E5E7EB",
                backgroundColor: preset.name.includes("Recommended") ? "color-mix(in srgb, var(--color-primary) 5%, white)" : "white",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${preset.theme.primary}, ${preset.theme.secondary})` }}
                />
                <span className="font-semibold text-gray-900 text-sm">{preset.name}</span>
              </div>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.theme.primary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.theme.secondary }}></div>
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.theme.accent }}></div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Theme Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">🎨 Custom Theme</h2>
        <p className="text-sm text-gray-600 mb-6">Fine-tune individual colors to match your brand</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Primary Colors</h3>
            <ColorPicker
              label="Primary"
              value={theme.primary}
              onChange={(value) => handleColorChange("primary", value)}
            />
            <ColorPicker
              label="Secondary"
              value={theme.secondary}
              onChange={(value) => handleColorChange("secondary", value)}
            />
            <ColorPicker
              label="Accent"
              value={theme.accent}
              onChange={(value) => handleColorChange("accent", value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Background & Surface</h3>
            <ColorPicker
              label="Background"
              value={theme.background}
              onChange={(value) => handleColorChange("background", value)}
            />
            <ColorPicker
              label="Surface"
              value={theme.surface}
              onChange={(value) => handleColorChange("surface", value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Text Colors</h3>
            <ColorPicker
              label="Text Primary"
              value={theme.text}
              onChange={(value) => handleColorChange("text", value)}
            />
            <ColorPicker
              label="Text Secondary"
              value={theme.textSecondary}
              onChange={(value) => handleColorChange("textSecondary", value)}
            />
            <ColorPicker
              label="Border"
              value={theme.border}
              onChange={(value) => handleColorChange("border", value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Status Colors</h3>
            <ColorPicker
              label="Success"
              value={theme.success}
              onChange={(value) => handleColorChange("success", value)}
            />
            <ColorPicker
              label="Warning"
              value={theme.warning}
              onChange={(value) => handleColorChange("warning", value)}
            />
            <ColorPicker
              label="Error"
              value={theme.error}
              onChange={(value) => handleColorChange("error", value)}
            />
            <ColorPicker
              label="Info"
              value={theme.info}
              onChange={(value) => handleColorChange("info", value)}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">👁️ Preview</h2>
        <div
          className="p-8 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            color: theme.background,
          }}
        >
          <h3 className="text-2xl font-bold mb-2">Sample Heading</h3>
          <p className="opacity-90 mb-4">This is how your theme will look across all pages.</p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: theme.background, color: theme.primary }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-semibold border-2"
              style={{ borderColor: theme.background, color: theme.background }}
            >
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
