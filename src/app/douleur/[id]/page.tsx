"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  getPainDetail,
  addPainEvolution,
  closePain,
  adaptPainRecordToDouleur,
} from "@/components/api/douleur";

interface Douleur {
  id: string;
  titre: string;
  symptomes: string;
  cause: string;
  dateDebut: string;
  intensite: number;
  statut: "active" | "terminee";
  evolutions: Evolution[];
}

interface Evolution {
  id: string;
  douleurId: string;
  date: string;
  note: string;
  symptomes: string;
  intensite: number;
}

export default function DouleurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const douleurId = params.id as string;

  const [douleur, setDouleur] = useState<Douleur | null>(null);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newEvolution, setNewEvolution] = useState({
    note: "",
    symptomes: "",
    intensite: 5,
  });

  useEffect(() => {
    loadDouleurData();
  }, [douleurId]);

  const loadDouleurData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPainDetail(douleurId);

      if (response.success && response.data?.data) {
        const painRecord = response.data.data;
        const adaptedDouleur = adaptPainRecordToDouleur(painRecord);
        setDouleur(adaptedDouleur as Douleur);
        setEvolutions(adaptedDouleur.evolutions || []);
      } else {
        setError("Douleur non trouvée");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
      console.error("Erreur lors du chargement de la douleur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvolution = async () => {
    if (!newEvolution.note && !newEvolution.symptomes) {
      setError("Veuillez remplir au moins une note ou des symptômes");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const evolutionData = {
        note: newEvolution.note,
        symptomes: newEvolution.symptomes,
        intensite: newEvolution.intensite,
      };

      const response = await addPainEvolution(douleurId, evolutionData);

      if (response.success) {
        // Recharger les données
        await loadDouleurData();
        setNewEvolution({ note: "", symptomes: "", intensite: 5 });
        setError(null);
      } else {
        setError(response.message || "Erreur lors de l'ajout de l'évolution");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
      console.error("Erreur lors de l'ajout de l'évolution:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloturerDouleur = async () => {
    try {
      setError(null);
      const response = await closePain(douleurId);

      if (response.success) {
        // Mettre à jour l'état local
        if (douleur) {
          setDouleur({ ...douleur, statut: "terminee" });
        }
      } else {
        setError(response.message || "Erreur lors de la clôture de la douleur");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
      console.error("Erreur lors de la clôture de la douleur:", error);
    }
  };

  const getIntensiteColor = (intensite: number) => {
    if (intensite <= 3)
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700";
    if (intensite <= 6)
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700";
  };

  const getProgressPercentage = () => {
    if (!douleur || evolutions.length === 0) return 0;

    const initialIntensite = douleur.intensite;
    const currentIntensite =
      evolutions.length > 0 ? evolutions[0].intensite : initialIntensite;

    if (currentIntensite <= initialIntensite) return 100;
    if (currentIntensite >= 10) return 0;

    return Math.max(
      0,
      Math.min(100, ((10 - currentIntensite) / (10 - initialIntensite)) * 100)
    );
  };

  const mockUser = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    isPremium: true,
    role: "user",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation user={mockUser} />
        <div className="lg:ml-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Chargement de la douleur...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!douleur) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation user={mockUser} />
        <div className="lg:ml-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">❌</div>
              <p className="text-red-600 dark:text-red-400 text-lg">
                Douleur non trouvée
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                La douleur que vous recherchez n&apos;existe pas ou a été
                supprimée
              </p>
              <button
                onClick={() => router.push("/douleur")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                Retour à la liste
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={mockUser} />

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push("/douleur")}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Retour à la liste</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {douleur.titre}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Suivi détaillé de l&apos;évolution de votre douleur
                </p>
              </div>
              {douleur.statut === "active" && (
                <button
                  onClick={handleCloturerDouleur}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  Clôturer la douleur
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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

          {/* Douleur Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informations générales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Localisation:</span>{" "}
                  {douleur.titre}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Symptômes:</span>{" "}
                  {douleur.symptomes}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Cause:</span>{" "}
                  {douleur.cause || "Non spécifiée"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Date de début:</span>{" "}
                  {douleur.dateDebut}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Statut:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      douleur.statut === "active"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    }`}
                  >
                    {douleur.statut === "active" ? "Active" : "Terminée"}
                  </span>
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <span className="font-medium">Intensité actuelle:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium border ${getIntensiteColor(
                      douleur.intensite
                    )}`}
                  >
                    {douleur.intensite}/10
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Progression de la guérison
            </h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>Début</span>
                <span>Guérison</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                {getProgressPercentage().toFixed(0)}% de progression
              </p>
            </div>
          </div>

          {/* Add Evolution Form */}
          {douleur.statut === "active" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ajouter une évolution
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newEvolution.note}
                    onChange={(e) =>
                      setNewEvolution({
                        ...newEvolution,
                        note: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Comment vous sentez-vous ?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Symptômes
                  </label>
                  <textarea
                    value={newEvolution.symptomes}
                    onChange={(e) =>
                      setNewEvolution({
                        ...newEvolution,
                        symptomes: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Décrivez vos symptômes"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intensité (1-10)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          setNewEvolution({ ...newEvolution, intensite: n })
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          newEvolution.intensite === n
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddEvolution}
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <span>Ajouter l&apos;évolution</span>
                )}
              </button>
            </div>
          )}

          {/* Evolutions List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Historique des évolutions ({evolutions.length})
            </h2>
            {evolutions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📊</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune évolution enregistrée
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Ajoutez votre première évolution pour commencer le suivi
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evolutions.map((evolution, index) => (
                  <div
                    key={evolution.id}
                    className={`border-l-4 pl-4 py-3 ${
                      index === 0
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {evolution.date}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getIntensiteColor(
                          evolution.intensite
                        )}`}
                      >
                        {evolution.intensite}/10
                      </span>
                    </div>
                    {evolution.note && (
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-medium">Note:</span>{" "}
                        {evolution.note}
                      </p>
                    )}
                    {evolution.symptomes && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Symptômes:</span>{" "}
                        {evolution.symptomes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
