"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  type: "link" | "dropdown";
  children?: MenuItem[];
  open_in_new_tab: boolean;
}

interface HeaderConfig {
  logo: {
    type: "text" | "image";
    text: string;
    subtext: string;
    image_url: string;
    position: "left" | "center" | "right";
    link: string;
  };
  menu_items: MenuItem[];
  cta_button: {
    enabled: boolean;
    text: string;
    href: string;
    style: "solid" | "outline" | "gradient";
    color: string;
    gradient_from: string;
    gradient_to: string;
  };
  styling: {
    background_color: string;
    text_color: string;
    sticky: boolean;
    padding_top: number;
    padding_bottom: number;
  };
}

export default function HeaderBuilderPage() {
  const [config, setConfig] = useState<HeaderConfig>({
    logo: {
      type: "text",
      text: "Social IT",
      subtext: "Digital Transformation Partner",
      image_url: "",
      position: "left",
      link: "/",
    },
    menu_items: [],
    cta_button: {
      enabled: true,
      text: "Contact Us",
      href: "/contact",
      style: "gradient",
      color: "#ff00ff",
      gradient_from: "#ff00ff",
      gradient_to: "#8b00ff",
    },
    styling: {
      background_color: "#000000",
      text_color: "#ffffff",
      sticky: true,
      padding_top: 16,
      padding_bottom: 16,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadHeader();
  }, []);

  const loadHeader = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/cms/site-settings/header");
      if (response.data) {
        setConfig(response.data);
      }
    } catch (err: any) {
      console.error("Failed to load header:", err);
      // Use default config if not found
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.put("/cms/site-settings/header", config);
      setSuccess("Header saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save header");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.menu_items.findIndex((item) => item.id === active.id);
        const newIndex = prev.menu_items.findIndex((item) => item.id === over.id);
        return {
          ...prev,
          menu_items: arrayMove(prev.menu_items, oldIndex, newIndex),
        };
      });
    }
  };

  const addMenuItem = (item: MenuItem) => {
    setConfig((prev) => ({
      ...prev,
      menu_items: [...prev.menu_items, item],
    }));
    setShowMenuItemModal(false);
    setEditingMenuItem(null);
  };

  const updateMenuItem = (id: string, updated: MenuItem) => {
    setConfig((prev) => ({
      ...prev,
      menu_items: prev.menu_items.map((item) => (item.id === id ? updated : item)),
    }));
    setShowMenuItemModal(false);
    setEditingMenuItem(null);
  };

  const deleteMenuItem = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      menu_items: prev.menu_items.filter((item) => item.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading header builder...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Header Builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize your website header with logo, menu items, and CTA button
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Header"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
          {/* Logo Configuration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Logo Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Type
                </label>
                <select
                  value={config.logo.type}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, type: e.target.value as "text" | "image" },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {config.logo.type === "text" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Text
                    </label>
                    <input
                      type="text"
                      value={config.logo.text}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, text: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtext
                    </label>
                    <input
                      type="text"
                      value={config.logo.subtext}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          logo: { ...prev.logo, subtext: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    value={config.logo.image_url}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        logo: { ...prev.logo, image_url: e.target.value },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Position
                </label>
                <select
                  value={config.logo.position}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, position: e.target.value as "left" | "center" | "right" },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Link
                </label>
                <input
                  type="text"
                  value={config.logo.link}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, link: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setShowMenuItemModal(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Item
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={config.menu_items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {config.menu_items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      onEdit={() => {
                        setEditingMenuItem(item);
                        setShowMenuItemModal(true);
                      }}
                      onDelete={() => deleteMenuItem(item.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {config.menu_items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No menu items yet. Click "Add Item" to get started.
              </p>
            )}
          </div>

          {/* CTA Button */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">CTA Button</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cta-enabled"
                  checked={config.cta_button.enabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      cta_button: { ...prev.cta_button, enabled: e.target.checked },
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="cta-enabled" className="text-sm font-medium text-gray-700">
                  Enable CTA Button
                </label>
              </div>

              {config.cta_button.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={config.cta_button.text}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          cta_button: { ...prev.cta_button, text: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={config.cta_button.href}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          cta_button: { ...prev.cta_button, href: e.target.value },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Style
                    </label>
                    <select
                      value={config.cta_button.style}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          cta_button: { ...prev.cta_button, style: e.target.value as any },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="outline">Outline</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                  {config.cta_button.style === "gradient" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gradient From
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={config.cta_button.gradient_from}
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  cta_button: { ...prev.cta_button, gradient_from: e.target.value },
                                }))
                              }
                              className="w-16 h-10 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={config.cta_button.gradient_from}
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  cta_button: { ...prev.cta_button, gradient_from: e.target.value },
                                }))
                              }
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gradient To
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={config.cta_button.gradient_to}
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  cta_button: { ...prev.cta_button, gradient_to: e.target.value },
                                }))
                              }
                              className="w-16 h-10 border border-gray-300 rounded"
                            />
                            <input
                              type="text"
                              value={config.cta_button.gradient_to}
                              onChange={(e) =>
                                setConfig((prev) => ({
                                  ...prev,
                                  cta_button: { ...prev.cta_button, gradient_to: e.target.value },
                                }))
                              }
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {config.cta_button.style === "solid" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.cta_button.color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              cta_button: { ...prev.cta_button, color: e.target.value },
                            }))
                          }
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={config.cta_button.color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              cta_button: { ...prev.cta_button, color: e.target.value },
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Styling */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Styling</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.styling.background_color}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          styling: { ...prev.styling, background_color: e.target.value },
                        }))
                      }
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={config.styling.background_color}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          styling: { ...prev.styling, background_color: e.target.value },
                        }))
                      }
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.styling.text_color}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          styling: { ...prev.styling, text_color: e.target.value },
                        }))
                      }
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={config.styling.text_color}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          styling: { ...prev.styling, text_color: e.target.value },
                        }))
                      }
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sticky"
                  checked={config.styling.sticky}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      styling: { ...prev.styling, sticky: e.target.checked },
                    }))
                  }
                  className="mr-2"
                />
                <label htmlFor="sticky" className="text-sm font-medium text-gray-700">
                  Sticky Header
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding Top (px)
                  </label>
                  <input
                    type="number"
                    value={config.styling.padding_top}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        styling: { ...prev.styling, padding_top: parseInt(e.target.value) || 16 },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding Bottom (px)
                  </label>
                  <input
                    type="number"
                    value={config.styling.padding_bottom}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        styling: { ...prev.styling, padding_bottom: parseInt(e.target.value) || 16 },
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Full Preview Panel */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Full Preview</h2>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              View on Site →
            </Link>
          </div>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <div className="relative">
              <HeaderPreview config={config} />
              {/* Sample content below header to show sticky behavior */}
              <div className="p-8 bg-gradient-to-b from-gray-50 to-white min-h-[600px]">
                <div className="max-w-4xl mx-auto space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900">Sample Page Content</h2>
                  <p className="text-gray-600">
                    This is a preview of how your header will look on the actual site. Scroll down to see the sticky behavior if enabled.
                  </p>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Section {i}</h3>
                        <p className="text-gray-600">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Item Modal */}
      {showMenuItemModal && (
        <MenuItemModal
          item={editingMenuItem}
          onSave={editingMenuItem ? (item) => updateMenuItem(editingMenuItem.id, item) : addMenuItem}
          onClose={() => {
            setShowMenuItemModal(false);
            setEditingMenuItem(null);
          }}
        />
      )}
    </div>
  );
}

function MenuItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400">
        ⋮⋮
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm">{item.label}</div>
        <div className="text-xs text-gray-500">{item.href}</div>
        {item.type === "dropdown" && item.children && (
          <div className="text-xs text-gray-400 mt-1">
            {item.children.length} sub-item{item.children.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <button
        onClick={onEdit}
        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Delete
      </button>
    </motion.div>
  );
}

function MenuItemModal({
  item,
  onSave,
  onClose,
}: {
  item: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<MenuItem>(
    item || {
      id: `menu-${Date.now()}`,
      label: "",
      href: "",
      type: "link",
      children: [],
      open_in_new_tab: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-md w-full p-6"
      >
        <h3 className="text-xl font-bold mb-4">{item ? "Edit" : "Add"} Menu Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as "link" | "dropdown" })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="link">Link</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-tab"
              checked={formData.open_in_new_tab}
              onChange={(e) => setFormData({ ...formData, open_in_new_tab: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="new-tab" className="text-sm font-medium text-gray-700">
              Open in new tab
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              {item ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function HeaderPreview({ config }: { config: HeaderConfig }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: config.styling.background_color,
        color: config.styling.text_color,
        paddingTop: `${config.styling.padding_top}px`,
        paddingBottom: `${config.styling.padding_bottom}px`,
        position: config.styling.sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 50,
      }}
      className="backdrop-blur-sm w-full"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={
              config.logo.position === "center"
                ? "flex-1 flex justify-center"
                : config.logo.position === "right"
                ? "flex-1 flex justify-end"
                : "flex-1"
            }
          >
            <Link href={config.logo.link} className="flex items-center">
              {config.logo.type === "text" ? (
                <div>
                  <h1 className="text-2xl font-bold">{config.logo.text}</h1>
                  {config.logo.subtext && (
                    <p className="text-xs opacity-80">{config.logo.subtext}</p>
                  )}
                </div>
              ) : (
                config.logo.image_url && (
                  <img src={config.logo.image_url} alt={config.logo.text} className="h-10" />
                )
              )}
            </Link>
          </motion.div>

          {/* Menu */}
          <nav
            className={`hidden md:flex space-x-6 ${
              config.logo.position === "center" ? "flex-1 justify-center" : "flex-1 justify-center"
            }`}
          >
            {config.menu_items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  className="relative text-sm font-medium transition-colors hover:opacity-80"
                >
                  <span className="opacity-90">{item.label}</span>
                  {item.type === "dropdown" && <span className="ml-1">▼</span>}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex-1 flex justify-end">
            {config.cta_button.enabled && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: config.menu_items.length * 0.1 }}
              >
                <Link
                  href={config.cta_button.href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={
                    config.cta_button.style === "gradient"
                      ? {
                          background: `linear-gradient(to right, ${config.cta_button.gradient_from}, ${config.cta_button.gradient_to})`,
                        }
                      : config.cta_button.style === "solid"
                      ? { backgroundColor: config.cta_button.color }
                      : {
                          border: `2px solid ${config.cta_button.color}`,
                          color: config.cta_button.color,
                          background: "transparent",
                        }
                  }
                >
                  {config.cta_button.text}
                </Link>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-current"
            >
              ☰
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden mt-4 border-t pt-4"
              style={{ borderColor: `${config.styling.text_color}20` }}
            >
              <div className="space-y-2">
                {config.menu_items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.open_in_new_tab ? "_blank" : undefined}
                    rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                    className="block py-2 text-sm font-medium hover:opacity-80"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                    {item.type === "dropdown" && " ▼"}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
