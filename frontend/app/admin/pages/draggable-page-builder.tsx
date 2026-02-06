"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../lib/api";
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
import { SECTION_TYPES, SectionType } from "./enhanced-builder";
import JSONImportModal from "../../../components/JSONImportModal";

interface Section {
  type: string;
  data: any;
  id: string;
}

interface DraggablePageBuilderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

function SortableSection({
  section,
  index,
  onUpdate,
  onRemove,
  onMove,
  totalSections,
}: {
  section: Section;
  index: number;
  onUpdate: (id: string, data: any) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  totalSections: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [availableServices, setAvailableServices] = useState<{ id: string; slug: string; title: string }[]>([]);

  // Only fetch services when this section is expanded (edit opened) to avoid 401/redirect on modal open
  useEffect(() => {
    if (section.type === "services-grid" && isExpanded) {
      apiClient.get("/cms/services").then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAvailableServices(list.map((s: any) => ({ id: s.id, slug: s.slug, title: s.title })));
      }).catch(() => setAvailableServices([]));
    }
  }, [section.type, isExpanded]);

  const handleJsonImport = async (data: any[]) => {
    if (data.length > 0) {
      // Merge imported data with existing section data
      const importedData = data[0];
      onUpdate(section.id, {
        ...section.data,
        ...importedData,
      });
      setShowJsonImport(false);
    }
  };

  const validateSectionData = (item: any): { valid: boolean; error?: string } => {
    if (typeof item !== "object" || item === null) {
      return { valid: false, error: "Section data must be an object" };
    }
    return { valid: true };
  };

  const getSectionExampleJSON = () => {
    const config = SECTION_TYPES[section.type as SectionType];
    return JSON.stringify(config?.defaultData || {}, null, 2);
  };

  const renderField = (label: string, key: string, type: string = "text") => {
    const value = section.data[key] || "";
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) =>
              onUpdate(section.id, { ...section.data, [key]: e.target.value })
            }
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        ) : type === "color" ? (
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) =>
                onUpdate(section.id, { ...section.data, [key]: e.target.value })
              }
              className="w-16 h-10 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={value}
              onChange={(e) =>
                onUpdate(section.id, { ...section.data, [key]: e.target.value })
              }
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) =>
              onUpdate(section.id, { ...section.data, [key]: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        )}
      </div>
    );
  };

  const renderAnimationOptions = () => {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">✨ Animation Options</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animation Type
            </label>
            <select
              value={section.data.animationType || "auto"}
              onChange={(e) =>
                onUpdate(section.id, {
                  ...section.data,
                  animationType: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="auto">Auto (Based on position)</option>
              <option value="slideInUp">Slide In Up</option>
              <option value="slideInDown">Slide In Down</option>
              <option value="slideInLeft">Slide In Left</option>
              <option value="slideInRight">Slide In Right</option>
              <option value="fadeIn">Fade In</option>
              <option value="fadeInScale">Fade In + Scale</option>
              <option value="reveal">Reveal (Clip Path)</option>
              <option value="rotateIn">Rotate In</option>
              <option value="bounceIn">Bounce In</option>
              <option value="none">No Animation</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose how this section animates when it enters the viewport
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Duration (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                value={section.data.animationDuration || 0.6}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    animationDuration: parseFloat(e.target.value) || 0.6,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0.1"
                max="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Delay (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                value={section.data.animationDelay || 0}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    animationDelay: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
                max="2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Easing Function
            </label>
            <select
              value={section.data.animationEasing || "easeOut"}
              onChange={(e) =>
                onUpdate(section.id, {
                  ...section.data,
                  animationEasing: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="easeOut">Ease Out (Default)</option>
              <option value="easeIn">Ease In</option>
              <option value="easeInOut">Ease In Out</option>
              <option value="linear">Linear</option>
              <option value="spring">Spring (Bouncy)</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={section.data.animationOnce !== false}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    animationOnce: e.target.checked,
                  })
                }
              />
              <span className="text-sm text-gray-700">
                Animate only once (don't re-animate on scroll up)
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderStylingOptions = () => {
    const useGradient = section.data.useGradient || false;
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">🎨 Styling Options</h4>
        <div className="space-y-4">
          {/* Gradient Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useGradient}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    useGradient: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Gradient Background
              </span>
            </label>
          </div>

          {useGradient ? (
            <>
              {/* Gradient Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gradient From Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={section.data.gradientFrom || "#0066CC"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          gradientFrom: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={section.data.gradientFrom || "#0066CC"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          gradientFrom: e.target.value,
                        })
                      }
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gradient To Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={section.data.gradientTo || "#00A8E8"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          gradientTo: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={section.data.gradientTo || "#00A8E8"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          gradientTo: e.target.value,
                        })
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
                  value={section.data.gradientDirection || "to right"}
                  onChange={(e) =>
                    onUpdate(section.id, {
                      ...section.data,
                      gradientDirection: e.target.value,
                    })
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
            <div className="grid grid-cols-2 gap-4">
              {renderField("Background Color", "backgroundColor", "color")}
            </div>
          )}
          {renderField("Text Color", "textColor", "color")}
          {renderField("Background Image URL", "backgroundImage")}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <select
              value={section.data.fontFamily || "inherit"}
              onChange={(e) =>
                onUpdate(section.id, {
                  ...section.data,
                  fontFamily: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="inherit">Default</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text Alignment
            </label>
            <select
              value={section.data.textAlign || "left"}
              onChange={(e) =>
                onUpdate(section.id, {
                  ...section.data,
                  textAlign: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding Top (px)
              </label>
              <input
                type="number"
                value={section.data.paddingTop || 40}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    paddingTop: parseInt(e.target.value) || 40,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding Bottom (px)
              </label>
              <input
                type="number"
                value={section.data.paddingBottom || 40}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    paddingBottom: parseInt(e.target.value) || 40,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Border Radius (px)
              </label>
              <input
                type="number"
                value={section.data.borderRadius || 0}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    borderRadius: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Box Shadow
              </label>
              <select
                value={section.data.boxShadow || "none"}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    boxShadow: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionEditor = () => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Hero Section Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Heading", "heading")}
            {renderField("Subheading", "subheading")}
            {renderField("Button Text", "buttonText")}
            {renderField("Button Link", "buttonLink")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={section.data.alignment || "center"}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    alignment: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "cta":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">CTA Section Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Description", "description", "textarea")}
            {renderField("Button Text", "buttonText")}
            {renderField("Button Link", "buttonLink")}
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "features":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Features Section Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Subtitle", "subtitle")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features (JSON)
              </label>
              <textarea
                value={JSON.stringify(section.data.features || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdate(section.id, { ...section.data, features: parsed });
                  } catch {}
                }}
                rows={10}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
              />
            </div>
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "about-hero":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">About Hero Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Heading", "heading")}
            {renderField("Subheading", "subheading")}
            {renderField("Icon (emoji)", "icon")}
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "values-grid":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Values Grid Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Values (JSON)
              </label>
              <textarea
                value={JSON.stringify(section.data.values || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdate(section.id, { ...section.data, values: parsed });
                  } catch {}
                }}
                rows={12}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
              />
            </div>
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "careers-list":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Careers List Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Subtitle", "subtitle")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jobs (JSON)
              </label>
              <textarea
                value={JSON.stringify(section.data.jobs || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onUpdate(section.id, { ...section.data, jobs: parsed });
                  } catch {}
                }}
                rows={15}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
              />
            </div>
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "toggle-section":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Toggle Section Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Icon (emoji)", "icon")}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={section.data.defaultOpen || false}
                  onChange={(e) =>
                    onUpdate(section.id, {
                      ...section.data,
                      defaultOpen: e.target.checked,
                    })
                  }
                />
                <span className="text-sm font-medium text-gray-700">
                  Open by default
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (HTML)
              </label>
              <textarea
                value={section.data.content || ""}
                onChange={(e) =>
                  onUpdate(section.id, { ...section.data, content: e.target.value })
                }
                rows={8}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
                placeholder="<p>Your content here...</p>"
              />
            </div>
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      case "contact-form":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Contact Form Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Subtitle", "subtitle")}
            {renderStylingOptions()}
          </div>
        );

      case "services-grid":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <h4 className="text-sm font-semibold text-gray-900">Services Grid Data</h4>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            {renderField("Title", "title")}
            {renderField("Subtitle", "subtitle")}

            {/* Which services to show */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Services to display
                </label>
                {availableServices.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdate(section.id, { ...section.data, selectedServiceSlugs: [] })}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Show all
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(section.id, {
                          ...section.data,
                          selectedServiceSlugs: availableServices.map((s) => s.slug),
                        })
                      }
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Select all
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                All checked = show all services. Uncheck services to hide them from this section.
              </p>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 space-y-2">
                {availableServices.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading services…</p>
                ) : (
                  availableServices.map((svc) => {
                    const selectedSlugs: string[] = Array.isArray(section.data?.selectedServiceSlugs)
                      ? section.data.selectedServiceSlugs
                      : [];
                    const isChecked = selectedSlugs.length === 0 || selectedSlugs.includes(svc.slug);
                    const toggle = () => {
                      let next: string[];
                      if (selectedSlugs.length === 0) {
                        next = availableServices.map((s) => s.slug).filter((slug) => slug !== svc.slug);
                      } else if (isChecked) {
                        next = selectedSlugs.filter((s) => s !== svc.slug);
                      } else {
                        next = [...selectedSlugs, svc.slug];
                      }
                      onUpdate(section.id, { ...section.data, selectedServiceSlugs: next });
                    };
                    return (
                      <label key={svc.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/60 rounded px-2 py-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={toggle}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-800">{svc.title}</span>
                        <span className="text-xs text-gray-400">({svc.slug})</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Columns
              </label>
              <select
                value={section.data.columns || 3}
                onChange={(e) =>
                  onUpdate(section.id, {
                    ...section.data,
                    columns: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
              </select>
            </div>
            
            {/* Color Customization */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">🎨 Color Options</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderField("Title Color", "titleColor", "color")}
                  {renderField("Subtitle Color", "subtitleColor", "color")}
                </div>
                
                {/* Card Background Gradient Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.data.cardUseGradient || false}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          cardUseGradient: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Use Gradient for Card Background
                    </span>
                  </label>
                </div>

                {section.data.cardUseGradient ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Gradient From
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={section.data.cardGradientFrom || "#F8F9FA"}
                          onChange={(e) =>
                            onUpdate(section.id, {
                              ...section.data,
                              cardGradientFrom: e.target.value,
                            })
                          }
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={section.data.cardGradientFrom || "#F8F9FA"}
                          onChange={(e) =>
                            onUpdate(section.id, {
                              ...section.data,
                              cardGradientFrom: e.target.value,
                            })
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Gradient To
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={section.data.cardGradientTo || "#FFFFFF"}
                          onChange={(e) =>
                            onUpdate(section.id, {
                              ...section.data,
                              cardGradientTo: e.target.value,
                            })
                          }
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={section.data.cardGradientTo || "#FFFFFF"}
                          onChange={(e) =>
                            onUpdate(section.id, {
                              ...section.data,
                              cardGradientTo: e.target.value,
                            })
                          }
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("Card Background", "cardBackgroundColor", "color")}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {renderField("Card Border Color", "cardBorderColor", "color")}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderField("Hover Overlay Color", "hoverOverlayColor", "color")}
                  {renderField("Link Color", "linkColor", "color")}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Shadow Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={section.data.cardShadowColor || "#000000"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          cardShadowColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={section.data.cardShadowColor || "#000000"}
                      onChange={(e) =>
                        onUpdate(section.id, {
                          ...section.data,
                          cardShadowColor: e.target.value,
                        })
                      }
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shadow Opacity (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={section.data.shadowOpacity || 0.1}
                    onChange={(e) =>
                      onUpdate(section.id, {
                        ...section.data,
                        shadowOpacity: parseFloat(e.target.value) || 0.1,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );

      default:
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Section Data (JSON)
              </label>
              <button
                type="button"
                onClick={() => setShowJsonImport(true)}
                className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                📥 Import JSON
              </button>
            </div>
            <textarea
              value={JSON.stringify(section.data, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate(section.id, parsed);
                } catch {}
              }}
              rows={12}
              className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-xs"
            />
            {renderStylingOptions()}
            {renderAnimationOptions()}
          </div>
        );
    }
  };

  return (
    <>
      <JSONImportModal
        isOpen={showJsonImport}
        onClose={() => setShowJsonImport(false)}
        onImport={handleJsonImport}
        title={`${SECTION_TYPES[section.type as SectionType]?.name || section.type} Section Data`}
        exampleJSON={getSectionExampleJSON()}
        validateItem={validateSectionData}
      />
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isDragging ? 0.8 : 1, scale: isDragging ? 1.02 : 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7 2a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM7 8a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM7 14a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM13 2a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM13 8a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM13 14a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z" />
            </svg>
          </div>
          <span className="text-xl">
            {SECTION_TYPES[section.type as SectionType]?.icon || "📄"}
          </span>
          <div>
            <div className="font-medium text-sm text-gray-900">
              {SECTION_TYPES[section.type as SectionType]?.name || section.type}
            </div>
            <div className="text-xs text-gray-500">Section {index + 1}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMove(section.id, "up")}
            disabled={index === 0}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(section.id, "down")}
            disabled={index === totalSections - 1}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm px-3 py-1"
          >
            {isExpanded ? "Hide" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onRemove(section.id)}
            className="text-red-600 hover:text-red-700 text-sm px-3 py-1"
          >
            Remove
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          {renderSectionEditor()}
        </div>
      )}
    </motion.div>
    </>
  );
}

export default function DraggablePageBuilder({
  sections: initialSections,
  onSectionsChange,
}: DraggablePageBuilderProps) {
  const [sections, setSections] = useState<Section[]>(initialSections || []);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const isInternalUpdate = useRef(false);
  const prevSectionsRef = useRef<string>(JSON.stringify(initialSections));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync sections to parent only when they change internally (not from prop updates)
  useEffect(() => {
    if (isInternalUpdate.current) {
      const currentSectionsStr = JSON.stringify(sections);
      if (currentSectionsStr !== prevSectionsRef.current) {
        prevSectionsRef.current = currentSectionsStr;
        onSectionsChange(sections);
      }
      isInternalUpdate.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // Sync initial sections from parent prop changes
  useEffect(() => {
    const currentInitialStr = JSON.stringify(initialSections || []);
    const currentSectionsStr = JSON.stringify(sections);
    
    // Only update if prop changed and local state is different
    if (currentInitialStr !== prevSectionsRef.current && currentInitialStr !== currentSectionsStr) {
      // This is an update from parent, don't trigger onSectionsChange
      isInternalUpdate.current = false;
      setSections(initialSections || []);
      prevSectionsRef.current = currentInitialStr;
    }
  }, [initialSections, sections]);

  const addSection = (type: SectionType) => {
    const config = SECTION_TYPES[type];
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: JSON.parse(JSON.stringify(config.defaultData)),
    };
    isInternalUpdate.current = true;
    setSections((prev) => [...prev, newSection]);
    setShowSectionPicker(false);
  };

  const removeSection = (id: string) => {
    isInternalUpdate.current = true;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, data: any) => {
    isInternalUpdate.current = true;
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, data } : s))
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    isInternalUpdate.current = true;
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;

      const newSections = [...prev];
      if (direction === "up" && index > 0) {
        [newSections[index - 1], newSections[index]] = [
          newSections[index],
          newSections[index - 1],
        ];
      } else if (direction === "down" && index < prev.length - 1) {
        [newSections[index], newSections[index + 1]] = [
          newSections[index + 1],
          newSections[index],
        ];
      }
      return newSections;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      isInternalUpdate.current = true;
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Page Sections</h3>
        <button
          type="button"
          onClick={() => setShowSectionPicker(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Section
        </button>
      </div>

      <AnimatePresence>
        {showSectionPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSectionPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Choose Section Type</h3>
              <button
                type="button"
                onClick={() => setShowSectionPicker(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(SECTION_TYPES).map(([type, config], idx) => (
                <motion.button
                  key={type}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addSection(type as SectionType)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition shadow-sm hover:shadow-md"
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="font-medium text-sm text-gray-900">
                    {config.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {config.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">
                  No sections added yet. Click "Add Section" to start.
                </p>
              </div>
            ) : (
              sections.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  index={index}
                  onUpdate={updateSection}
                  onRemove={removeSection}
                  onMove={moveSection}
                  totalSections={sections.length}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
