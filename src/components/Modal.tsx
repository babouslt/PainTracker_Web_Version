"use client";

import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl";
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "4xl",
}: ModalProps) {
  // Fermer avec Échap
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Empêcher le scroll de la page
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2">
        <div
          className={`relative w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Bouton de fermeture sans titre */}
          {!title && (
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}

          {/* Content */}
          <div className="px-3 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
