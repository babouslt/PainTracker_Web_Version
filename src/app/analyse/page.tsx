"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Navigation from "@/components/Navigation";
import { getUserById } from "@/components/api/user";
import { generateMedicalAnalysis } from "@/components/api/ia";
import { createPain } from "@/components/api/douleur";
import ResultSlider from "@/components/ResultSlider";
import Modal from "@/components/Modal";
import ThemeToggle from "@/components/ThemeToggle";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  isPremium: boolean;
  _id?: string;
  id?: string;
  role: string;
  aiUsageCount?: number;
}

interface DiagnosisResult {
  titre: string;
  symptomes: string;
  cause: string;
  traitement: string;
  tests: string;
}

export default function AnalysePage() {
  const [user, setUser] = useState<User | null>(null);
  const [symptomes, setSymptomes] = useState("");
  const [niveauDouleur, setNiveauDouleur] = useState("");
  const [localisationDouleur, setLocalisationDouleur] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parsedResults, setParsedResults] = useState<DiagnosisResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingPain, setIsCreatingPain] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      const userId = decoded.body?.id;
      if (!userId) return;
      const response = await getUserById(userId, token);
      if (response.success) {
        setUser(response.user || response);
      }
    } catch (error) {
      // Gestion silencieuse de l'erreur
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      const userId = decoded.body?.id;
      if (!userId) return;

      setLoadingHistory(true);
      const response = await fetch(`/api/medical-history?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicalHistory(data.data?.analyses || []);
      } else {
        console.error("Erreur lors de la récupération de l'historique");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const parseResults = (rawResult: string): DiagnosisResult[] => {
    const results: DiagnosisResult[] = [];

    rawResult.split("🔹").forEach((diag) => {
      if (!diag.trim()) return;

      const titreMatch = diag.match(/\d+\.\s*(\[([^\]]+)\]|([^\n]+))/i);
      let titre = "";
      if (titreMatch) {
        titre = titreMatch[2] || titreMatch[3] || "";
        titre = titre.trim();
      }

      const symptomes =
        diag.match(/Sympt[oô]mes?\s*:\s*([^\n]*)/i)?.[1]?.trim() || "";
      const cause = diag.match(/Cause\s*:\s*([^\n]*)/i)?.[1]?.trim() || "";
      const traitement =
        diag.match(/Traitement\s*:\s*([^\n]*)/i)?.[1]?.trim() || "";
      const tests = diag.match(/Tests?\s*:\s*([^\n]*)/i)?.[1]?.trim() || "";

      const titreEstGenerique = /^Diagnostic \d+$/i.test(titre);

      if (
        (titreEstGenerique && !(symptomes || cause || traitement || tests)) ||
        !(titre || symptomes || cause || traitement || tests)
      ) {
        return;
      }

      results.push({
        titre: titre || `Diagnostic ${results.length + 1}`,
        symptomes,
        cause,
        traitement,
        tests,
      });
    });

    return results;
  };

  const handleSubmit = async () => {
    if (!symptomes || !niveauDouleur || !localisationDouleur) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (!user) {
      alert("Profil utilisateur non trouvé.");
      return;
    }

    // Vérifier que le profil utilisateur est complet
    if (!user.age || !user.height || !user.weight || !user.gender) {
      alert(
        "Votre profil n&apos;est pas complet. Veuillez d&apos;abord compléter votre profil dans la page d&apos;onboarding."
      );
      router.push("/onboarding");
      return;
    }

    // Vérifier si l'utilisateur a encore des crédits IA (sauf s'il est premium)
    if (
      !user.isPremium &&
      user.aiUsageCount !== undefined &&
      user.aiUsageCount <= 0
    ) {
      alert(
        "Vous avez épuisé vos crédits d&apos;analyse IA gratuits. Passez à Premium pour des analyses illimitées !"
      );
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await generateMedicalAnalysis({
        userId: user._id || user.id || "",
        age: parseInt(user.age || "0"),
        sexe: user.gender === "male" ? "Male" : "Female",
        taille: parseInt(user.height || "0"),
        poids: parseFloat(user.weight || "0"),
        symptomes,
        niveauDouleur: parseInt(niveauDouleur),
        localisationDouleur,
      });

      if (res.success) {
        // Décrémenter le compteur IA uniquement si l'utilisateur n'est pas premium
        if (!user.isPremium) {
          try {
            const decrementResponse = await fetch("/api/decrement-ai-usage", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId: user._id || user.id }),
            });

            if (decrementResponse.ok) {
              // Mettre à jour le compteur local
              setUser((prev) =>
                prev
                  ? {
                      ...prev,
                      aiUsageCount: (prev.aiUsageCount || 0) - 1,
                    }
                  : prev
              );
            }
          } catch (decrementError) {
            // Erreur silencieuse pour la décrémentation
          }
        }

        setResult(res.data.response);
        const parsed = parseResults(res.data.response);
        setParsedResults(parsed);
        setIsModalOpen(true);
      } else {
        alert(res.message || "Impossible d'obtenir l'analyse médicale.");
      }
    } catch (e) {
      alert("Impossible d'obtenir l'analyse médicale.");
    } finally {
      setLoading(false);
    }
  };

  const isOutOfAI =
    !user?.isPremium &&
    user?.aiUsageCount !== undefined &&
    user?.aiUsageCount <= 0;

  const handleCreatePainFromAnalysis = async () => {
    if (!user || !symptomes || !localisationDouleur || !niveauDouleur) {
      alert("Informations manquantes pour créer la douleur.");
      return;
    }

    setIsCreatingPain(true);

    try {
      const painData = {
        userId: user._id || user.id || "",
        symptomes: symptomes,
        localisation: localisationDouleur,
        cause: parsedResults.length > 0 ? parsedResults[0].cause : undefined,
        dateDebut: new Date().toISOString(),
        intensiteDouleur: parseInt(niveauDouleur),
      };

      const response = await createPain(painData);

      if (response.success) {
        // Confirmer avec l'utilisateur s'il veut aller à la page des douleurs
        const goToPainPage = confirm(
          "Douleur créée avec succès ! Voulez-vous aller à la page de suivi des douleurs maintenant ?"
        );

        setIsModalOpen(false);

        if (goToPainPage) {
          router.push("/douleur");
        }
      } else {
        alert(response.message || "Erreur lors de la création de la douleur.");
      }
    } catch (error) {
      alert("Erreur lors de la création de la douleur.");
    } finally {
      setIsCreatingPain(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      {user && <Navigation user={user} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 mb-2">
            Analyse médicale
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-4">
            Obtenez une analyse préliminaire de vos symptômes en quelques
            secondes.
          </p>

          {/* Indicateur de crédits IA */}
          {user && !user.isPremium && (
            <div className="mb-4">
              {user.aiUsageCount !== undefined ? (
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    user.aiUsageCount > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  <span className="mr-2">🤖</span>
                  {user.aiUsageCount > 0
                    ? `${user.aiUsageCount} analyses IA restantes`
                    : "Plus d'analyses IA disponibles"}
                </div>
              ) : null}
            </div>
          )}

          {/* Badge Premium */}
          {user && user.isPremium && (
            <div className="mb-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 dark:from-yellow-900/20 dark:to-amber-900/20 dark:text-amber-400">
                <span className="mr-2">⭐</span>
                Analyses IA illimitées (Premium)
              </div>
            </div>
          )}

          {/* Bouton Historique */}
          {user && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setIsHistoryModalOpen(true);
                  fetchMedicalHistory();
                }}
                className="group inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full mr-3 group-hover:bg-white/30 transition-colors">
                  <span className="text-sm">📋</span>
                </div>
                <span>Voir l&apos;historique</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
          {/* Avertissement profil incomplet */}
          {user &&
            (!user.age || !user.height || !user.weight || !user.gender) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      ⚠️ Profil incomplet
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                      Votre profil n&apos;est pas complet. Vous devez
                      d&apos;abord compléter votre profil (âge, taille, poids,
                      sexe) pour pouvoir utiliser l&apos;analyse IA.
                    </p>
                    <button
                      onClick={() => router.push("/onboarding")}
                      className="mt-2 inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Compléter mon profil
                    </button>
                  </div>
                </div>
              </div>
            )}

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Symptômes (10 caractères minimum)
            </label>
            <textarea
              value={symptomes}
              onChange={(e) => setSymptomes(e.target.value)}
              placeholder="Décrivez vos symptômes"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Niveau de douleur (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={niveauDouleur}
              onChange={(e) => setNiveauDouleur(e.target.value)}
              placeholder="Ex: 5"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Localisation de la douleur
            </label>
            <input
              type="text"
              value={localisationDouleur}
              onChange={(e) => setLocalisationDouleur(e.target.value)}
              placeholder="Ex: genou droit, bas du dos..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400"
            />
          </div>

          {/* Disclaimer important */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  ⚠️ Avertissement important
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  Cette analyse est générée par une intelligence artificielle et
                  ne remplace en aucun cas l&apos;avis d&apos;un professionnel
                  de santé. Consultez toujours un médecin pour un diagnostic
                  médical précis et un traitement approprié.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              isOutOfAI ||
              !user ||
              !user.age ||
              !user.height ||
              !user.weight ||
              !user.gender
            }
            className={`w-full mt-2 rounded-xl py-4 shadow-md transition-colors font-bold text-lg ${
              loading ||
              isOutOfAI ||
              !user ||
              !user.age ||
              !user.height ||
              !user.weight ||
              !user.gender
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyse en cours...
              </div>
            ) : (
              "Analyser"
            )}
          </button>

          {isOutOfAI && (
            <div className="text-center">
              <p className="text-base font-semibold text-red-500 dark:text-red-400 mb-3">
                Vous avez épuisé vos analyses IA gratuites !
              </p>
              <Link
                href="/abonnement"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="mr-2">⭐</span>
                Passer à Premium pour analyses illimitées
              </Link>
            </div>
          )}
        </div>

        {/* Modal avec les résultats */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {parsedResults.length > 0 && (
              <ResultSlider results={parsedResults} />
            )}

            {/* Bouton pour créer une douleur */}
            <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCreatePainFromAnalysis}
                disabled={isCreatingPain}
                className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isCreatingPain
                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                }`}
              >
                {isCreatingPain ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📝</span>
                    Ajouter cette douleur au suivi
                  </>
                )}
              </button>
            </div>

            {/* Texte informatif */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              💡 Créez un suivi personnalisé avec vos symptômes, localisation et
              intensité pour un meilleur suivi médical
            </p>
          </div>
        </Modal>

        {/* Modal Historique des analyses */}
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* En-tête avec gradient */}
            <div className="text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10 rounded-t-2xl"></div>
              <div className="relative py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Historique des analyses médicales
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base">
                  Consultez et revisitez toutes vos analyses précédentes
                </p>
              </div>
            </div>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-blue-800"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                </div>
                <span className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                  Chargement de votre historique...
                </span>
              </div>
            ) : medicalHistory.length > 0 ? (
              <div className="space-y-4 max-h-[24rem] overflow-y-auto pr-2">
                {medicalHistory.map((analysis, index) => (
                  <div
                    key={analysis._id || index}
                    className="group relative bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Badge numéro d'analyse */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>

                    {/* En-tête avec date */}
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🔬</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          Analyse médicale
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-base">📅</span>
                        <span className="font-medium">
                          {new Date(analysis.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Informations principales avec icônes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-sm">🩺</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm block">
                              Symptômes
                            </span>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 break-words">
                              {analysis.requestData?.symptomes}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">📍</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm block">
                              Localisation
                            </span>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {analysis.requestData?.localisationDouleur}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">⚡</span>
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm block">
                              Intensité
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(10)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full mr-1 ${
                                      i <
                                      (analysis.requestData?.niveauDouleur || 0)
                                        ? "bg-red-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                {analysis.requestData?.niveauDouleur}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section résultats avec design amélioré */}
                    <div className="mt-4">
                      <details className="group/details">
                        <summary className="cursor-pointer flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm">📊</span>
                            </div>
                            <span className="font-semibold text-blue-700 dark:text-blue-300">
                              Voir les résultats de l&apos;analyse
                            </span>
                          </div>
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-open/details:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner">
                          {analysis.responseData?.response ? (
                            <div className="space-y-4">
                              {(() => {
                                const response = analysis.responseData.response;

                                // Utiliser la même logique que parseResults pour la cohérence
                                const results: DiagnosisResult[] = [];

                                response.split("🔹").forEach((diag: string) => {
                                  if (!diag.trim()) return;

                                  const titreMatch = diag.match(
                                    /\d+\.\s*(\[([^\]]+)\]|([^\n]+))/i
                                  );
                                  let titre = "";
                                  if (titreMatch) {
                                    titre =
                                      titreMatch[2] || titreMatch[3] || "";
                                    titre = titre.trim();
                                  }

                                  const symptomes =
                                    diag
                                      .match(
                                        /Sympt[oô]mes?\s*:\s*([^\n]*)/i
                                      )?.[1]
                                      ?.trim() || "";
                                  const cause =
                                    diag
                                      .match(/Cause\s*:\s*([^\n]*)/i)?.[1]
                                      ?.trim() || "";
                                  const traitement =
                                    diag
                                      .match(/Traitement\s*:\s*([^\n]*)/i)?.[1]
                                      ?.trim() || "";
                                  const tests =
                                    diag
                                      .match(/Tests?\s*:\s*([^\n]*)/i)?.[1]
                                      ?.trim() || "";

                                  const titreEstGenerique =
                                    /^Diagnostic \d+$/i.test(titre);

                                  if (
                                    (titreEstGenerique &&
                                      !(
                                        symptomes ||
                                        cause ||
                                        traitement ||
                                        tests
                                      )) ||
                                    !(
                                      titre ||
                                      symptomes ||
                                      cause ||
                                      traitement ||
                                      tests
                                    )
                                  ) {
                                    return;
                                  }

                                  results.push({
                                    titre:
                                      titre ||
                                      `Diagnostic ${results.length + 1}`,
                                    symptomes,
                                    cause,
                                    traitement,
                                    tests,
                                  });
                                });

                                // Si aucun résultat valide, afficher le texte brut
                                if (results.length === 0) {
                                  return (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {response}
                                      </pre>
                                    </div>
                                  );
                                }

                                // Afficher les résultats avec le même design que ResultSlider
                                return results.map((result, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm"
                                  >
                                    {/* Titre du diagnostic */}
                                    <div className="text-center mb-4">
                                      <h5 className="text-lg font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-2">
                                        {result.titre}
                                      </h5>
                                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                                    </div>

                                    {/* Grille des informations */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {result.symptomes && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                                          <h6 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center text-sm">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                            Symptômes
                                          </h6>
                                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {result.symptomes}
                                          </p>
                                        </div>
                                      )}

                                      {result.cause && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-lg p-3 border border-green-200/50 dark:border-green-700/50">
                                          <h6 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            Cause
                                          </h6>
                                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {result.cause}
                                          </p>
                                        </div>
                                      )}

                                      {result.traitement && (
                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 rounded-lg p-3 border border-orange-200/50 dark:border-orange-700/50">
                                          <h6 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center text-sm">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                            Traitement
                                          </h6>
                                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {result.traitement}
                                          </p>
                                        </div>
                                      )}

                                      {result.tests && (
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg p-3 border border-purple-200/50 dark:border-purple-700/50">
                                          <h6 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center text-sm">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                            Tests recommandés
                                          </h6>
                                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            {result.tests}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                              <span className="text-lg">📝</span>
                              <p className="mt-2">Aucun résultat disponible</p>
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
                  <span className="text-4xl">📭</span>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Aucune analyse trouvée
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                  Vous n&apos;avez pas encore effectué d&apos;analyse médicale.
                  Commencez par analyser vos symptômes !
                </p>
              </div>
            )}
          </div>

          {/* Styles personnalisés pour les résultats */}
          <style jsx>{`
            .diagnostic-title {
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            .section-header {
              border-left: 3px solid;
              padding-left: 12px;
              margin-left: -4px;
            }

            .section-header.symptoms {
              border-left-color: #ef4444;
            }
            .section-header.cause {
              border-left-color: #f97316;
            }
            .section-header.treatment {
              border-left-color: #22c55e;
            }
            .section-header.tests {
              border-left-color: #3b82f6;
            }
            .section-header.recommendations {
              border-left-color: #a855f7;
            }
            .section-header.precautions {
              border-left-color: #eab308;
            }

            /* Masquer la scrollbar native */
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
            .overflow-y-auto {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </Modal>
      </div>
    </div>
  );
}
