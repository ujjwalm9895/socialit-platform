"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";

interface FooterLink {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
}

interface FooterColumn {
  id: string;
  title: string;
  content?: string;
  links: FooterLink[];
}

interface FooterConfig {
  columns: FooterColumn[];
  copyright_text: string;
  styling: {
    background_color: string;
    text_color: string;
    link_color: string;
    use_gradient?: boolean;
    gradient_from?: string;
    gradient_to?: string;
    gradient_direction?: string;
  };
}

function SortableColumn({
  column,
  onUpdate,
  onRemove,
  onMove,
  totalColumns,
}: {
  column: FooterColumn;
  onUpdate: (id: string, data: FooterColumn) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  totalColumns: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.8 : 1, scale: isDragging ? 1.02 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`border border-gray-200 rounded-lg overflow-hidden ${
        isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{column.title || "Untitled Column"}</h4>
            <p className="text-sm text-gray-500">
              {column.links?.length || 0} links
              {column.content && " • Has content"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMove(column.id, "up")}
            disabled={totalColumns <= 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => onMove(column.id, "down")}
            disabled={totalColumns <= 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            {isExpanded ? "Collapse" : "Edit"}
          </button>
          <button
            onClick={() => onRemove(column.id)}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Remove
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-white"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Title
                </label>
                <input
                  type="text"
                  value={column.title || ""}
                  onChange={(e) =>
                    onUpdate(column.id, { ...column, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Column Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Content (Optional)
                </label>
                <textarea
                  value={column.content || ""}
                  onChange={(e) =>
                    onUpdate(column.id, { ...column, content: e.target.value })
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Column description or content..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Links
                  </label>
                  <button
                    onClick={() => {
                      setEditingLink({
                        id: `link-${Date.now()}`,
                        label: "",
                        href: "",
                        open_in_new_tab: false,
                      });
                      setShowLinkModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {column.links?.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{link.label}</div>
                        <div className="text-xs text-gray-500">{link.href}</div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingLink(link);
                          setShowLinkModal(true);
                        }}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onUpdate(column.id, {
                            ...column,
                            links: column.links.filter((l) => l.id !== link.id),
                          });
                        }}
                        className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!column.links || column.links.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No links yet. Click "Add Link" to add one.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Edit Modal */}
      <AnimatePresence>
        {showLinkModal && editingLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowLinkModal(false);
              setEditingLink(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingLink.id.startsWith("link-") ? "Add Link" : "Edit Link"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Label
                  </label>
                  <input
                    type="text"
                    value={editingLink.label}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, label: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Link text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={editingLink.href}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, href: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="/page or https://example.com"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingLink.open_in_new_tab}
                      onChange={(e) =>
                        setEditingLink({
                          ...editingLink,
                          open_in_new_tab: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Open in new tab</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setEditingLink(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const existingIndex = column.links.findIndex(
                      (l) => l.id === editingLink.id
                    );
                    const updatedLinks = existingIndex >= 0
                      ? column.links.map((l) =>
                          l.id === editingLink.id ? editingLink : l
                        )
                      : [...(column.links || []), editingLink];
                    onUpdate(column.id, { ...column, links: updatedLinks });
                    setShowLinkModal(false);
                    setEditingLink(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FooterBuilderPage() {
  const [config, setConfig] = useState<FooterConfig>({
    columns: [],
    copyright_text: "Copyright © {year} Social IT. All rights reserved.",
    styling: {
      background_color: "#0052A5",
      text_color: "#FFFFFF",
      link_color: "#00A8E8",
      use_gradient: false,
      gradient_from: "#0052A5",
      gradient_to: "#0066CC",
      gradient_direction: "to right",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/cms/site-settings/footer");
      if (response.data) {
        setConfig(response.data);
      }
    } catch (err: any) {
      console.error("Failed to load footer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await apiClient.put("/cms/site-settings/footer", config);
      setSuccess("Footer saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save footer");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.columns.findIndex((col) => col.id === active.id);
        const newIndex = prev.columns.findIndex((col) => col.id === over.id);
        return {
          ...prev,
          columns: arrayMove(prev.columns, oldIndex, newIndex),
        };
      });
    }
  };

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: `column-${Date.now()}`,
      title: "New Column",
      links: [],
    };
    setConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
  };

  const updateColumn = (id: string, data: FooterColumn) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => (col.id === id ? data : col)),
    }));
  };

  const removeColumn = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((col) => col.id !== id),
    }));
  };

  const moveColumn = (id: string, direction: "up" | "down") => {
    setConfig((prev) => {
      const index = prev.columns.findIndex((col) => col.id === id);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.columns.length) return prev;
      return {
        ...prev,
        columns: arrayMove(prev.columns, index, newIndex),
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Footer Builder</h1>
            <p className="text-gray-600 mt-1">
              Customize your site footer with columns, links, and styling
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              View on Site
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Footer"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Columns */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Footer Columns</h2>
              <button
                onClick={addColumn}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                + Add Column
              </button>
            </div>

            {config.columns.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded">
                <p className="text-gray-500 mb-4">No columns yet</p>
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Your First Column
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={config.columns.map((col) => col.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {config.columns.map((column) => (
                      <SortableColumn
                        key={column.id}
                        column={column}
                        onUpdate={updateColumn}
                        onRemove={removeColumn}
                        onMove={moveColumn}
                        totalColumns={config.columns.length}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Copyright Text */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Copyright Text</h2>
            <input
              type="text"
              value={config.copyright_text}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, copyright_text: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Copyright © {year} Your Company. All rights reserved."
            />
            <p className="text-sm text-gray-500 mt-2">
              Use {"{year}"} to automatically insert the current year
            </p>
          </div>
        </div>

        {/* Styling Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Styling</h2>
            <div className="space-y-4">
              {/* Gradient Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.styling.use_gradient || false}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        styling: {
                          ...prev.styling,
                          use_gradient: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use Gradient Background
                  </span>
                </label>
              </div>

              {config.styling.use_gradient ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gradient From
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.styling.gradient_from || "#0052A5"}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              styling: {
                                ...prev.styling,
                                gradient_from: e.target.value,
                              },
                            }))
                          }
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={config.styling.gradient_from || "#0052A5"}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              styling: {
                                ...prev.styling,
                                gradient_from: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gradient To
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.styling.gradient_to || "#0066CC"}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              styling: {
                                ...prev.styling,
                                gradient_to: e.target.value,
                              },
                            }))
                          }
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={config.styling.gradient_to || "#0066CC"}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              styling: {
                                ...prev.styling,
                                gradient_to: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gradient Direction
                    </label>
                    <select
                      value={config.styling.gradient_direction || "to right"}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          styling: {
                            ...prev.styling,
                            gradient_direction: e.target.value,
                          },
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="to right">To Right →</option>
                      <option value="to left">To Left ←</option>
                      <option value="to bottom">To Bottom ↓</option>
                      <option value="to top">To Top ↑</option>
                      <option value="to bottom right">To Bottom Right ↘</option>
                      <option value="to bottom left">To Bottom Left ↙</option>
                      <option value="to top right">To Top Right ↗</option>
                      <option value="to top left">To Top Left ↖</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.styling.link_color}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        styling: { ...prev.styling, link_color: e.target.value },
                      }))
                    }
                    className="w-16 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={config.styling.link_color}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        styling: { ...prev.styling, link_color: e.target.value },
                      }))
                    }
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            <div
              className="p-4 rounded border"
              style={{
                background: config.styling.use_gradient &&
                  config.styling.gradient_from &&
                  config.styling.gradient_to
                  ? `linear-gradient(${config.styling.gradient_direction || "to right"}, ${config.styling.gradient_from}, ${config.styling.gradient_to})`
                  : config.styling.background_color,
                color: config.styling.text_color,
              }}
            >
              <div className="text-sm space-y-2">
                <div className="font-semibold">Sample Column</div>
                <div style={{ color: config.styling.link_color }}>Sample Link</div>
                <div style={{ color: config.styling.link_color }}>Another Link</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
