"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navigation from "@/components/Navigation";
import { getUserById } from "@/components/api/user";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  isPremium?: boolean;
  aiUsageCount?: number;
  role?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          router.replace("/login");
          return;
        }

        const decoded = jwtDecode<any>(token);
        const userId = decoded.body?.id || decoded.id;

        if (!userId) {
          setError("ID utilisateur non trouvé");
          setLoading(false);
          return;
        }

        const response = await getUserById(userId, token);
        if (response.success) {
          setUser(response.user || response);
        } else {
          setError("Erreur lors de la récupération du profil");
        }
      } catch (error) {
        setError("Erreur d'authentification");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleStopSubscription = () => {
    // Logique pour arrêter l&apos;abonnement
    alert("Fonctionnalité d&apos;arrêt d&apos;abonnement à implémenter");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <ThemeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Chargement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <ThemeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 text-lg mb-2">
              {error || "Erreur de chargement du profil"}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Créer un utilisateur pour la navigation
  const navUser = {
    firstName: user.firstName || "Utilisateur",
    lastName: user.lastName || "",
    email: user.email || "",
    isPremium: user.isPremium || false,
    role: user.role || "user",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeToggle />
      <Navigation user={navUser} />

      {/* Main content - centré */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-md px-6 py-8">
          {/* Header du profil */}
          <div className="text-center mb-8">
            {/* Avatar circulaire */}
            <div className="h-24 w-24 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl font-bold text-white">
                {user.firstName?.charAt(0) || user.lastName?.charAt(0) || "U"}
              </span>
            </div>

            {/* Nom et statut Premium */}
            <div className="flex items-center justify-center space-x-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>

              {user.isPremium && (
                <div className="bg-yellow-400 dark:bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                  PREMIUM
                </div>
              )}
            </div>

            {/* Email */}
            <p className="text-gray-600 dark:text-gray-300 text-base">
              {user.email}
            </p>
          </div>

          {/* Carte des détails du profil */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Âge */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Âge
                </span>
                <span className="text-gray-800 dark:text-white">
                  {user.age ? `${user.age} ans` : "Non renseigné"}
                </span>
              </div>

              {/* Taille */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Taille
                </span>
                <span className="text-gray-800 dark:text-white">
                  {user.height ? `${user.height} cm` : "Non renseigné"}
                </span>
              </div>

              {/* Poids */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Poids
                </span>
                <span className="text-gray-800 dark:text-white">
                  {user.weight ? `${user.weight} kg` : "Non renseigné"}
                </span>
              </div>

              {/* Sexe */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Sexe
                </span>
                <span className="text-gray-800 dark:text-white">
                  {user.gender === "male"
                    ? "Homme"
                    : user.gender === "female"
                    ? "Femme"
                    : "Non renseigné"}
                </span>
              </div>

              {/* Requêtes IA restantes */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Requêtes IA restantes
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                  {user.aiUsageCount !== undefined ? user.aiUsageCount : "∞"}
                </span>
              </div>
            </div>
          </div>

          {/* Bouton arrêter l&apos;abonnement (si Premium) */}
          {user.isPremium && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/abonnement")}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-sm"
                >
                  Gérer l&apos;abonnement
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Accédez à la page d&apos;abonnement pour plus d&apos;options
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
