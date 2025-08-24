"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Navigation from "@/components/Navigation";
import {
  getUserById,
  updateProfile,
  updatePassword,
} from "@/components/api/user";
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

interface EditableUser {
  firstName: string;
  lastName: string;
  age: string;
  height: string;
  weight: string;
  gender: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<EditableUser>({
    firstName: "",
    lastName: "",
    age: "",
    height: "",
    weight: "",
    gender: "",
  });
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
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
          const userData = response.user || response;
          setUser(userData);
          // Initialiser les données d'édition
          setEditingUser({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            age: userData.age || "",
            height: userData.height || "",
            weight: userData.weight || "",
            gender: userData.gender || "",
          });
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

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurer les données originales
    if (user) {
      setEditingUser({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age || "",
        height: user.height || "",
        weight: user.weight || "",
        gender: user.gender || "",
      });
    }
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        router.replace("/login");
        return;
      }

      const userId = user._id || user.id;
      if (!userId) {
        setSaveMessage({ type: "error", message: "ID utilisateur non trouvé" });
        return;
      }
      const response = await updateProfile(userId, editingUser, token);

      if (response.success) {
        setUser({ ...user, ...editingUser });
        setIsEditing(false);
        setSaveMessage({
          type: "success",
          message: "Profil mis à jour avec succès !",
        });

        // Effacer le message après 3 secondes
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({
          type: "error",
          message: response.message || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setSaveMessage({
        type: "error",
        message: "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditableUser, value: string) => {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordChange, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (!user) return;

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        message: "Les mots de passe ne correspondent pas",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
      return;
    }

    setChangingPassword(true);
    setPasswordMessage(null);

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        router.replace("/login");
        return;
      }

      const userId = user._id || user.id;
      if (!userId) {
        setPasswordMessage({
          type: "error",
          message: "ID utilisateur non trouvé",
        });
        return;
      }

      const response = await updatePassword(
        userId,
        passwordData.currentPassword,
        passwordData.newPassword,
        token
      );

      if (response.success) {
        setPasswordMessage({
          type: "success",
          message: "Mot de passe mis à jour avec succès !",
        });
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Effacer le message après 3 secondes
        setTimeout(() => setPasswordMessage(null), 3000);
      } else {
        setPasswordMessage({
          type: "error",
          message:
            response.message || "Erreur lors de la mise à jour du mot de passe",
        });
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        message: "Erreur lors de la mise à jour du mot de passe",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleStopSubscription = () => {
    // Logique pour arrêter l'abonnement
    alert("Fonctionnalité d'arrêt d'abonnement à implémenter");
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

            {/* Boutons d'action */}
            <div className="mt-4 space-y-2">
              {!isEditing ? (
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    ✏️ Modifier le profil
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    🔒 Changer le mot de passe
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2 justify-center">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
                  >
                    ❌ Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                  >
                    {saving ? "💾 Sauvegarde..." : "💾 Sauvegarder"}
                  </button>
                </div>
              )}
            </div>

            {/* Message de sauvegarde */}
            {saveMessage && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm ${
                  saveMessage.type === "success"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                }`}
              >
                {saveMessage.message}
              </div>
            )}
          </div>

          {/* Carte des détails du profil */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              {/* Prénom */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Prénom
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre prénom"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.firstName || "Non renseigné"}
                  </span>
                )}
              </div>

              {/* Nom */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Nom
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.lastName || "Non renseigné"}
                  </span>
                )}
              </div>

              {/* Âge */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Âge
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editingUser.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                    placeholder="Âge"
                    min="1"
                    max="120"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.age ? `${user.age} ans` : "Non renseigné"}
                  </span>
                )}
              </div>

              {/* Taille */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Taille
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editingUser.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                    placeholder="cm"
                    min="100"
                    max="250"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.height ? `${user.height} cm` : "Non renseigné"}
                  </span>
                )}
              </div>

              {/* Poids */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Poids
                </span>
                {isEditing ? (
                  <input
                    type="number"
                    value={editingUser.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                    placeholder="kg"
                    min="30"
                    max="300"
                  />
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.weight ? `${user.weight} kg` : "Non renseigné"}
                  </span>
                )}
              </div>

              {/* Sexe */}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  Sexe
                </span>
                {isEditing ? (
                  <select
                    value={editingUser.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                ) : (
                  <span className="text-gray-800 dark:text-white">
                    {user.gender === "male"
                      ? "Homme"
                      : user.gender === "female"
                      ? "Femme"
                      : user.gender === "other"
                      ? "Autre"
                      : "Non renseigné"}
                  </span>
                )}
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

          {/* Bouton arrêter l'abonnement (si Premium) */}
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

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                🔒 Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    handlePasswordChange("newPassword", e.target.value)
                  }
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nouveau mot de passe (min. 6 caract&egrave;res)"
                />
              </div>

              {/* Confirmation du nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    handlePasswordChange("confirmPassword", e.target.value)
                  }
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>

              {/* Message de statut */}
              {passwordMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}
                >
                  {passwordMessage.message}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {changingPassword
                    ? "Changement..."
                    : "Changer le mot de passe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
