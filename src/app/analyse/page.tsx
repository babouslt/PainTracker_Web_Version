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

    // Vérifier si l'utilisateur a encore des crédits IA (sauf s'il est premium)
    if (
      !user.isPremium &&
      user.aiUsageCount !== undefined &&
      user.aiUsageCount <= 0
    ) {
      alert(
        "Vous avez épuisé vos crédits d'analyse IA gratuits. Passez à Premium pour des analyses illimitées !"
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Symptômes
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
            disabled={loading || isOutOfAI}
            className={`w-full mt-2 rounded-xl py-4 shadow-md transition-colors font-bold text-lg ${
              loading || isOutOfAI
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
      </div>
    </div>
  );
}
