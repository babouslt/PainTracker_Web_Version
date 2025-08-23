"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  createPain,
  getUserPainsByStatus,
  closePain,
  adaptPainRecordToDouleur,
} from "@/components/api/douleur";
import { getUserById } from "@/components/api/user";
import ThemeToggle from "@/components/ThemeToggle";

interface Douleur {
  id: string;
  titre: string;
  symptomes: string;
  cause: string;
  dateDebut: string;
  intensite: number;
  statut: "active" | "terminee";
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isPremium: boolean;
  role: string;
}

export default function DouleurPage() {
  const router = useRouter();
  const [douleurs, setDouleurs] = useState<Douleur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"actives" | "terminees">(
    "actives"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [newDouleur, setNewDouleur] = useState({
    titre: "",
    symptomes: "",
    cause: "",
    intensite: 5,
  });

  const mockUser = {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com",
    isPremium: true,
    role: "user",
  };

  // Récupérer l'ID utilisateur depuis le JWT
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userIdFromToken = decoded.id || decoded._id || decoded.body?.id;
        setUserId(userIdFromToken);
        if (userIdFromToken) {
          fetchUserProfile(userIdFromToken, token);
        }
      } catch (error) {
        setError("Erreur d'authentification");
      }
    } else {
      setError("Token d'authentification manquant");
    }
  }, []);

  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = async (userId: string, token: string) => {
    try {
      const response = await getUserById(userId, token);
      if (response.success) {
        setUser(response.user || response);
      }
    } catch (error) {
      // Gestion silencieuse de l'erreur
    }
  };

  // Charger les douleurs quand l'userId est disponible
  useEffect(() => {
    if (userId) {
      loadDouleurs();
    }
  }, [userId]);

  const loadDouleurs = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const activeResponse = await getUserPainsByStatus(userId, "actif");
      const finishedResponse = await getUserPainsByStatus(userId, "fini");

      let allDouleurs: Douleur[] = [];

      if (activeResponse.success && activeResponse.data?.data) {
        const activePains = Array.isArray(activeResponse.data.data)
          ? activeResponse.data.data
          : [];
        allDouleurs = [
          ...allDouleurs,
          ...activePains.map(adaptPainRecordToDouleur),
        ];
      }

      if (finishedResponse.success && finishedResponse.data?.data) {
        const finishedPains = Array.isArray(finishedResponse.data.data)
          ? finishedResponse.data.data
          : [];
        allDouleurs = [
          ...allDouleurs,
          ...finishedPains.map(adaptPainRecordToDouleur),
        ];
      }

      setDouleurs(allDouleurs);
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const douleursActives = douleurs.filter((d) => d.statut === "active");
  const douleursTerminees = douleurs.filter((d) => d.statut === "terminee");

  const getIntensiteColor = (intensite: number) => {
    if (intensite <= 3) return "bg-green-100 text-green-800 border-green-200";
    if (intensite <= 6)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const handleAddDouleur = async () => {
    if (!userId) {
      setError("Utilisateur non authentifié");
      return;
    }

    if (!newDouleur.titre || !newDouleur.symptomes) {
      setError("Veuillez remplir au moins le titre et les symptômes");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const painData = {
        userId: userId,
        symptomes: newDouleur.symptomes,
        localisation: newDouleur.titre,
        cause: newDouleur.cause,
        dateDebut: new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
        intensiteDouleur: newDouleur.intensite,
      };

      const response = await createPain(painData);

      if (response.success) {
        await loadDouleurs();
        setNewDouleur({ titre: "", symptomes: "", cause: "", intensite: 5 });
        setShowAddForm(false);
        setError(null);
      } else {
        setError(
          response.message || "Erreur lors de la création de la douleur"
        );
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloturerDouleur = async (id: string) => {
    try {
      setError(null);
      const response = await closePain(id);

      if (response.success) {
        // Mettre à jour la liste locale
        setDouleurs(
          douleurs.map((d) => (d.id === id ? { ...d, statut: "terminee" } : d))
        );
      } else {
        setError(response.message || "Erreur lors de la clôture de la douleur");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ThemeToggle />
        <Navigation user={mockUser} />
        <div className="lg:ml-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">
                Chargement des douleurs...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />
        <Navigation user={mockUser} />
        <div className="lg:ml-64">
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">🔒</div>
              <p className="text-red-600 dark:text-red-400 text-lg">
                Erreur d&apos;authentification
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Veuillez vous reconnecter
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <Navigation user={user || mockUser} />

      {/* Main content - vraiment centré sur toute la page */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-6xl px-6 py-8">
          {/* Header - parfaitement centré */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Suivi de mes douleurs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Gérez et suivez l&apos;évolution de vos douleurs
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-4xl mx-auto">
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

          {/* Tabs - centrés */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("actives")}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "actives"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Actives ({douleursActives.length})
              </button>
              <button
                onClick={() => setActiveTab("terminees")}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "terminees"
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Terminées ({douleursTerminees.length})
              </button>
            </div>
          </div>

          {/* Content based on active tab - contenu centré */}
          <div className="max-w-5xl mx-auto">
            {activeTab === "actives" && (
              <div className="space-y-6">
                {/* Add new douleur button - centré */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Douleurs actives
                  </h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-3 mx-auto"
                  >
                    <span className="text-2xl">+</span>
                    <span>Ajouter une douleur</span>
                  </button>
                </div>

                {/* Add form - centré */}
                {showAddForm && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8 max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-6 text-center">
                      Ajouter une nouvelle douleur
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Localisation *
                        </label>
                        <input
                          type="text"
                          value={newDouleur.titre}
                          onChange={(e) =>
                            setNewDouleur({
                              ...newDouleur,
                              titre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Ex: Pied, Tête, Dos..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Symptômes *
                        </label>
                        <input
                          type="text"
                          value={newDouleur.symptomes}
                          onChange={(e) =>
                            setNewDouleur({
                              ...newDouleur,
                              symptomes: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Ex: Gonflements, Migraine..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cause
                        </label>
                        <input
                          type="text"
                          value={newDouleur.cause}
                          onChange={(e) =>
                            setNewDouleur({
                              ...newDouleur,
                              cause: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Ex: Blessure, Stress..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Intensité (1-10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={newDouleur.intensite}
                          onChange={(e) =>
                            setNewDouleur({
                              ...newDouleur,
                              intensite: parseInt(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1</span>
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {newDouleur.intensite}
                          </span>
                          <span>10</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleAddDouleur}
                        disabled={submitting}
                        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Ajout en cours...</span>
                          </>
                        ) : (
                          <span>Ajouter</span>
                        )}
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        disabled={submitting}
                        className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-medium transition-all duration-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Douleurs list - centrée */}
                {douleursActives.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-8xl mb-6">💊</div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl mb-2">
                      Aucune douleur active
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                      Cliquez sur &quot;Ajouter une douleur&quot; pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {douleursActives.map((douleur) => (
                      <div
                        key={douleur.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                {douleur.titre}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntensiteColor(
                                  douleur.intensite
                                )}`}
                              >
                                {douleur.intensite}/10
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-medium">Symptômes:</span>{" "}
                              {douleur.symptomes}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-medium">Cause:</span>{" "}
                              {douleur.cause || "Non spécifiée"}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              <span className="font-medium">Début:</span>{" "}
                              {douleur.dateDebut}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleCloturerDouleur(douleur.id)}
                              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                            >
                              Clôturer
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/douleur/${douleur.id}`)
                              }
                              className="bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                            >
                              Détails
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "terminees" && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                  Douleurs terminées
                </h2>
                {douleursTerminees.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-8xl mb-6">✅</div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl mb-2">
                      Aucune douleur terminée
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Les douleurs clôturées apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {douleursTerminees.map((douleur) => (
                      <div
                        key={douleur.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                                {douleur.titre}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntensiteColor(
                                  douleur.intensite
                                )}`}
                              >
                                {douleur.intensite}/10
                              </span>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
                                Terminée
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-medium">Symptômes:</span>{" "}
                              {douleur.symptomes}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              <span className="font-medium">Cause:</span>{" "}
                              {douleur.cause || "Non spécifiée"}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              <span className="font-medium">Début:</span>{" "}
                              {douleur.dateDebut}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/douleur/${douleur.id}`)
                            }
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm"
                          >
                            Historique
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  );
}
