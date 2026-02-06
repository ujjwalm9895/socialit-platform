"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedModal from "./AnimatedModal";

interface JSONImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  title: string;
  exampleJSON: string;
  validateItem?: (item: any) => { valid: boolean; error?: string };
}

export default function JSONImportModal({
  isOpen,
  onClose,
  onImport,
  title,
  exampleJSON,
  validateItem,
}: JSONImportModalProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Please upload a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        setJsonInput(JSON.stringify(parsed, null, 2));
        setError("");
        validateAndPreview(parsed);
      } catch (err: any) {
        setError(`Invalid JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const validateAndPreview = (data: any) => {
    try {
      let items: any[] = [];

      // Handle both array and single object
      if (Array.isArray(data)) {
        items = data;
      } else if (typeof data === "object" && data !== null) {
        items = [data];
      } else {
        setError("JSON must be an object or array of objects");
        setPreview([]);
        return;
      }

      // Validate each item
      const errors: string[] = [];
      const validItems: any[] = [];

      items.forEach((item, index) => {
        if (validateItem) {
          const validation = validateItem(item);
          if (!validation.valid) {
            errors.push(`Item ${index + 1}: ${validation.error}`);
          } else {
            validItems.push(item);
          }
        } else {
          validItems.push(item);
        }
      });

      if (errors.length > 0) {
        setError(errors.join("\n"));
        setPreview([]);
      } else {
        setError("");
        setPreview(validItems);
      }
    } catch (err: any) {
      setError(`Validation error: ${err.message}`);
      setPreview([]);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setError("");
    setPreview([]);

    if (value.trim()) {
      try {
        const parsed = JSON.parse(value);
        validateAndPreview(parsed);
      } catch (err) {
        // Don't show error while typing, only on blur or import
      }
    }
  };

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setError("Please provide JSON data");
      return;
    }

    try {
      setImporting(true);
      setError("");
      const parsed = JSON.parse(jsonInput);
      let items: any[] = [];

      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        items = [parsed];
      } else {
        setError("JSON must be an object or array of objects");
        return;
      }

      // Final validation
      if (validateItem) {
        const errors: string[] = [];
        items.forEach((item, index) => {
          const validation = validateItem(item);
          if (!validation.valid) {
            errors.push(`Item ${index + 1}: ${validation.error}`);
          }
        });
        if (errors.length > 0) {
          setError(errors.join("\n"));
          return;
        }
      }

      await onImport(items);
      setJsonInput("");
      setPreview([]);
      onClose();
    } catch (err: any) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleLoadExample = () => {
    try {
      const parsed = JSON.parse(exampleJSON);
      setJsonInput(JSON.stringify(parsed, null, 2));
      validateAndPreview(parsed);
    } catch (err: any) {
      setError(`Failed to load example: ${err.message}`);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import {title} from JSON</h2>
        <p className="text-sm text-gray-600 mb-6">
          Paste JSON data or upload a JSON file to bulk import {title.toLowerCase()}
        </p>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload JSON File
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* JSON Input */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              JSON Data
            </label>
            <button
              onClick={handleLoadExample}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Load Example
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            onBlur={() => {
              if (jsonInput.trim()) {
                try {
                  const parsed = JSON.parse(jsonInput);
                  validateAndPreview(parsed);
                } catch (err: any) {
                  setError(`Invalid JSON: ${err.message}`);
                }
              }
            }}
            rows={12}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your JSON data here or upload a file..."
          />
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800 mb-2">
              ✓ Valid JSON - {preview.length} item{preview.length !== 1 ? "s" : ""} ready to import
            </p>
            <div className="text-xs text-green-700 max-h-32 overflow-y-auto">
              {preview.slice(0, 3).map((item, idx) => (
                <div key={idx} className="mb-1">
                  {item.title || item.name || `Item ${idx + 1}`}
                </div>
              ))}
              {preview.length > 3 && (
                <div className="text-green-600">... and {preview.length - 3} more</div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-1">Error</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Example JSON */}
        <details className="mb-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            View Example JSON Format
          </summary>
          <pre className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-x-auto">
            {exampleJSON}
          </pre>
        </details>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !jsonInput.trim() || preview.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? "Importing..." : `Import ${preview.length > 0 ? preview.length : ""} Item${preview.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
}
