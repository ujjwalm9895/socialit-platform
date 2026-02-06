"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/lib/env";

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_instagram?: string;
}

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  heading_font: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "seo">("general");
  const [saving, setSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: "Social IT",
    site_description: "We build amazing digital solutions for your business",
    contact_email: "info@socialit.com",
  });
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primary_color: "#2563eb",
    secondary_color: "#7c3aed",
    accent_color: "#10b981",
    background_color: "#f9fafb",
    text_color: "#111827",
    font_family: "Inter",
    heading_font: "Inter",
  });

  const apiUrl = getApiUrl();

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSiteSettings = localStorage.getItem("site_settings");
    const savedThemeSettings = localStorage.getItem("theme_settings");
    
    if (savedSiteSettings) {
      setSiteSettings(JSON.parse(savedSiteSettings));
    }
    if (savedThemeSettings) {
      setThemeSettings(JSON.parse(savedThemeSettings));
    }
  }, []);

  const handleSaveSiteSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem("site_settings", JSON.stringify(siteSettings));
      // TODO: Save to API when backend is ready
      alert("Site settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveThemeSettings = async () => {
    setSaving(true);
    try {
      localStorage.setItem("theme_settings", JSON.stringify(themeSettings));
      // Apply theme to document
      const root = document.documentElement;
      root.style.setProperty("--primary-color", themeSettings.primary_color);
      root.style.setProperty("--secondary-color", themeSettings.secondary_color);
      root.style.setProperty("--accent-color", themeSettings.accent_color);
      root.style.setProperty("--background-color", themeSettings.background_color);
      root.style.setProperty("--text-color", themeSettings.text_color);
      // TODO: Save to API when backend is ready
      alert("Theme settings saved successfully!");
    } catch (err) {
      alert("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure your website settings, theme, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("theme")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "theme"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Theme
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "seo"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            SEO
          </button>
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">General Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name *
              </label>
              <input
                type="text"
                value={siteSettings.site_name}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, site_name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description *
              </label>
              <textarea
                value={siteSettings.site_description}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, site_description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Logo URL
              </label>
              <input
                type="url"
                value={siteSettings.site_logo_url || ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, site_logo_url: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={siteSettings.contact_email}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, contact_email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={siteSettings.contact_phone || ""}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, contact_phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={siteSettings.address || ""}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, address: e.target.value })
                }
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Social Media</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={siteSettings.social_facebook || ""}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, social_facebook: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={siteSettings.social_twitter || ""}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, social_twitter: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={siteSettings.social_linkedin || ""}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, social_linkedin: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={siteSettings.social_instagram || ""}
                    onChange={(e) =>
                      setSiteSettings({ ...siteSettings, social_instagram: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveSiteSettings}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings */}
      {activeTab === "theme" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Theme Customization</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeSettings.primary_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, primary_color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={themeSettings.primary_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, primary_color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeSettings.secondary_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, secondary_color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={themeSettings.secondary_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, secondary_color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeSettings.accent_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, accent_color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={themeSettings.accent_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, accent_color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeSettings.background_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, background_color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={themeSettings.background_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, background_color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={themeSettings.text_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, text_color: e.target.value })
                    }
                    className="h-10 w-20 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={themeSettings.text_color}
                    onChange={(e) =>
                      setThemeSettings({ ...themeSettings, text_color: e.target.value })
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  value={themeSettings.font_family}
                  onChange={(e) =>
                    setThemeSettings({ ...themeSettings, font_family: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Theme Preview</h3>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: themeSettings.background_color,
                  color: themeSettings.text_color,
                }}
              >
                <h4
                  className="text-2xl font-bold mb-2"
                  style={{ color: themeSettings.primary_color }}
                >
                  Sample Heading
                </h4>
                <p className="mb-4">This is how your content will look with the selected theme.</p>
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: themeSettings.primary_color }}
                >
                  Primary Button
                </button>
                <button
                  className="ml-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: themeSettings.secondary_color }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveThemeSettings}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Theme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === "seo" && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">SEO Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Meta Title
              </label>
              <input
                type="text"
                placeholder="Your Site Name - Description"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                placeholder="A brief description of your website"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Meta Keywords
              </label>
              <input
                type="text"
                placeholder="keyword1, keyword2, keyword3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default OG Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/og-image.png"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save SEO Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
