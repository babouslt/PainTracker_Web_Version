"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Navigation from "@/components/Navigation";
import { getUserById } from "@/components/api/user";
import ThemeToggle from "@/components/ThemeToggle";
import SubscriptionCard from "@/components/SubscriptionCard";

export default function HomePage() {
  const [user, setUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isPremium: boolean;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token) as any;

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("jwt");
          router.replace("/login");
          return;
        }

        const userId = decoded.body?.id || decoded.id;
        if (!userId) {
          router.replace("/login");
          return;
        }

        const response = await getUserById(userId, token);

        if (response.success) {
          setUser(response.user || response);
        } else {
          setUser({
            id: userId,
            firstName:
              decoded.body?.firstName || decoded.firstName || "Utilisateur",
            lastName: decoded.body?.lastName || decoded.lastName || "",
            email: decoded.body?.email || decoded.email || "",
            isPremium: decoded.body?.isPremium || decoded.isPremium || false,
            role: decoded.body?.role || decoded.role || "user",
          });
        }
      } catch (error) {
        localStorage.removeItem("jwt");
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-2">
            Erreur : Utilisateur non trouvé
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      <Navigation user={user} />

      {/* Header moderne et épuré */}
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Bonjour {user.firstName || "Utilisateur"} 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Bienvenue sur PainTracker, votre compagnon santé intelligent
            </p>
          </div>
        </div>
      </div>

      {/* Actions principales - Design moderne */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Que souhaitez-vous faire aujourd'hui ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analyse médicale */}
            <Link
              href="/analyse"
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Analyse médicale
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analysez vos symptômes avec l'IA
                </p>
              </div>
            </Link>

            {/* Gestion de la douleur */}
            <Link
              href="/douleur"
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50 hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion de la douleur
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Suivez et analysez vos douleurs
                </p>
              </div>
            </Link>
          </div>

          {/* Actions secondaires */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/profile"
              className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 backdrop-blur-sm rounded-2xl p-8 text-center hover:from-purple-500/30 hover:to-pink-500/30 dark:hover:from-purple-400/30 dark:hover:to-pink-400/30 hover:shadow-2xl transition-all duration-300 border border-purple-200/30 dark:border-purple-600/30 hover:scale-105 hover:border-purple-300/50 dark:hover:border-purple-500/50"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Profil
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Gérez vos informations personnelles
              </p>
            </Link>

            <SubscriptionCard isPremium={user?.isPremium || false} />
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            PainTracker - Votre santé, simplifiée
          </p>
        </div>
      </div>
    </div>
  );
}
