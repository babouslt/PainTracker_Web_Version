"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navigation from "@/components/Navigation";
import { getUserById } from "@/components/api/user";
import {
  createSubscription,
  cancelSubscription,
} from "@/components/api/subscription";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isPremium?: boolean;
  stripeSubscriptionId?: string;
  role?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "monthly",
    name: "Mensuel",
    price: 6.99,
    currency: "EUR",
    period: "mois",
    features: [
      "Analyses IA illimitées",
      "Suivi avancé des douleurs",
      "Statistiques détaillées",
      "Support prioritaire",
      "Accès aux fonctionnalités premium",
    ],
    popular: true,
  },
];

export default function AbonnementPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      setSuccess(
        "Paiement réussi ! Votre profil sera mis à jour dans quelques secondes."
      );
      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        fetchUserProfile();
      }, 3000);
    } else if (urlParams.get("canceled") === "true") {
      setError("Paiement annulé. Vous pouvez réessayer à tout moment.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      setError("Utilisateur non connecté");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          currency: plan.currency.toLowerCase(),
          userId: user._id || user.id,
          email: user.email,
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        setError("Erreur lors de la création de la session de paiement");
      }
    } catch (error) {
      setError("Erreur lors de la souscription. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.stripeSubscriptionId) {
      setError("Aucun abonnement trouvé");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await cancelSubscription(
        user.stripeSubscriptionId,
        true
      );
      if (response.success) {
        setSuccess(
          "Votre abonnement sera annulé à la fin de la période en cours."
        );
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        setError(response.message || "Erreur lors de l&apos;annulation");
      }
    } catch (error) {
      setError("Erreur lors de l&apos;annulation. Veuillez réessayer.");
    } finally {
      setProcessing(false);
    }
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

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <ThemeToggle />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 text-lg mb-2">
              {error}
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

  const navUser = {
    firstName: user?.firstName || "Utilisateur",
    lastName: user?.lastName || "",
    email: user?.email || "",
    isPremium: user?.isPremium || false,
    role: user?.role || "user",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      <Navigation user={navUser} />

      <div className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Débloquez toutes les fonctionnalités premium et améliorez votre
              expérience
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center">
                <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
                <p className="text-red-800 dark:text-red-200 text-sm">
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 mr-2">
                  ✅
                </span>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  {success}
                </p>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl max-w-md w-full ${
                  plan.popular
                    ? "border-blue-500 dark:border-blue-400 scale-105"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ⭐ Plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.currency}/{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {user?.isPremium ? (
                  <div className="text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg">
                      ✅ Abonnement actif
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processing}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      processing
                        ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white hover:scale-105"
                    }`}
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </div>
                    ) : (
                      `Souscrire - ${plan.price}${plan.currency}`
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {user?.isPremium && user?.stripeSubscriptionId && (
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-3">
                  <span className="text-green-500 text-lg">✅ Premium</span>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={processing}
                    className={`bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded text-xs transition-colors ${
                      processing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {processing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                        ...
                      </div>
                    ) : (
                      "Annuler"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi choisir Premium ?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  IA Illimitée
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Analyses médicales sans limite pour un diagnostic plus précis
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Statistiques Avancées
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Suivez l&apos;évolution de vos symptômes avec des graphiques
                  détaillés
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Suivi Personnalisé
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Recommandations adaptées à votre profil et vos antécédents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
