"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

const NotificationIcon = ({ type }: { type: NotificationProps["type"] }) => {
  switch (type) {
    case "success":
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    case "info":
      return (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

const getNotificationStyles = (type: NotificationProps["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200 text-green-800";
    case "error":
      return "bg-red-50 border-red-200 text-red-800";
    case "warning":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "info":
      return "bg-blue-50 border-blue-200 text-blue-800";
  }
};

const Notification = ({
  notification,
  onRemove,
}: {
  notification: NotificationProps;
  onRemove: (id: string) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(notification.id), 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onRemove]);

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-start space-x-3 p-4 rounded-lg border shadow-sm ${getNotificationStyles(
          notification.type
        )}`}
      >
        <div className="flex-shrink-0 mt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(notification.id), 300);
          }}
          className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-white/50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, addNotification, removeNotification };
};

export const NotificationContainer = ({
  notifications,
}: {
  notifications: NotificationProps[];
}) => {
  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={(id) => {
            // Cette fonction sera remplacée par removeNotification du hook
            // Pour l'instant, on laisse la notification se supprimer automatiquement
          }}
        />
      ))}
    </div>,
    document.body
  );
};
