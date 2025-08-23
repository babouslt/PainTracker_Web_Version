"use client";

import React from "react";
import Link from "next/link";

interface SubscriptionCardProps {
  isPremium: boolean;
}

export default function SubscriptionCard({ isPremium }: SubscriptionCardProps) {
  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⭐</span>
          </div>
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Abonnement Premium Actif
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm mb-4">
            Profitez de toutes les fonctionnalités avancées
          </p>
          <Link
            href="/abonnement"
            className="inline-block bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Gérer l&apos;abonnement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💳</span>
        </div>
        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">
          Passez à Premium
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
          Débloquez toutes les fonctionnalités avancées
        </p>
        <Link
          href="/abonnement"
          className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Voir les plans
        </Link>
      </div>
    </div>
  );
}
