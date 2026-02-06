"use client";

import { useEffect } from "react";
import SectionRenderer from "./SectionRenderer";
import { getSiteUrl } from "@/lib/env";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    type: "service" | "page" | "blog" | "case-study";
    data: any;
  };
  url?: string;
  isHomepage?: boolean;
}

export default function PreviewModal({ isOpen, onClose, content, url, isHomepage }: PreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderPreview = () => {
    switch (content.type) {
      case "service":
        return (
          <div className="max-w-4xl mx-auto p-8">
            {content.data.featured_image_url && (
              <img
                src={content.data.featured_image_url}
                alt={content.data.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {content.data.title}
            </h1>
            {content.data.subtitle && (
              <p className="text-xl text-gray-600 mb-6">{content.data.subtitle}</p>
            )}
            {content.data.description && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {content.data.description}
                </p>
              </div>
            )}
          </div>
        );

      case "page":
        return (
          <div className="w-full">
            {content.data.content && Array.isArray(content.data.content) && content.data.content.length > 0 ? (
              content.data.content.map((section: any, index: number) => (
                <SectionRenderer
                  key={section.id || index}
                  section={section}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">No content yet</p>
                <p className="text-sm">Add sections to see the preview</p>
              </div>
            )}
          </div>
        );

      case "blog":
        return (
          <div className="max-w-4xl mx-auto p-8">
            {content.data.featured_image_url && (
              <img
                src={content.data.featured_image_url}
                alt={content.data.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {content.data.title}
            </h1>
            {content.data.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{content.data.excerpt}</p>
            )}
            {content.data.content && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {typeof content.data.content === "string"
                    ? content.data.content
                    : JSON.stringify(content.data.content, null, 2)}
                </p>
              </div>
            )}
          </div>
        );

      case "case-study":
        return (
          <div className="max-w-4xl mx-auto p-8">
            {content.data.featured_image_url && (
              <img
                src={content.data.featured_image_url}
                alt={content.data.title}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {content.data.title}
            </h1>
            {content.data.client_name && (
              <p className="text-lg text-gray-600 mb-6">
                Client: {content.data.client_name}
              </p>
            )}
            {content.data.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{content.data.excerpt}</p>
            )}
            {content.data.challenge && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">The Challenge</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {content.data.challenge}
                </p>
              </div>
            )}
            {content.data.solution && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Our Solution</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {content.data.solution}
                </p>
              </div>
            )}
            {content.data.results && (
              <div>
                <h2 className="text-2xl font-semibold mb-2">Results</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {content.data.results}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Preview not available</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full relative z-[201]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                {isHomepage && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                    <span>📍 Published at:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                      {url || `${getSiteUrl()}/`}
                    </code>
                  </div>
                )}
                {url && !isHomepage && (
                  <div className="mt-1 text-xs text-gray-600">
                    <span>URL: </span>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                      {url}
                    </code>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto bg-white rounded-lg">
              {renderPreview()}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:items-center sm:justify-between">
            {isHomepage && (
              <div className="mb-3 sm:mb-0 sm:flex-1">
                <a
                  href={url || "/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <span>🌐</span>
                  <span>View on Site</span>
                </a>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
