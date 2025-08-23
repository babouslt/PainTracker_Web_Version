"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavigation() {
  const pathname = usePathname();

  const navigationItems = [
    { href: "/home", label: "Accueil", icon: "🏠" },
    { href: "/analyse", label: "Analyse", icon: "📊" },
    { href: "/douleur", label: "Douleurs", icon: "💊", isActive: true },
    { href: "/profile", label: "Profil", icon: "👤" },
    { href: "/parametres", label: "Paramètres", icon: "⚙️" },
    { href: "/admin", label: "Admin", icon: "🛡️" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              pathname === item.href || item.isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
