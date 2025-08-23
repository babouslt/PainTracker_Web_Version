"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/components/api/user";
import { jwtDecode } from "jwt-decode";
import ThemeToggle from "@/components/ThemeToggle";

const genders = [
  { label: "Homme", value: "male" },
  { label: "Femme", value: "female" },
  { label: "Autre", value: "other" },
];

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("male");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !age || !height || !weight || !gender) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        alert("Utilisateur non authentifié");
        setIsLoading(false);
        return;
      }
      const decoded = jwtDecode<{ body?: { id?: string } }>(token);
      const userId = decoded.body?.id;

      if (!userId) {
        alert("Impossible de récupérer l'ID utilisateur");
        setIsLoading(false);
        return;
      }
      const response = await updateProfile(
        userId,
        {
          firstName,
          lastName,
          age,
          height,
          weight,
          gender,
        },
        token
      );
      if (response.success) {
        alert("Profil complété !");
        router.replace("/home");
      } else {
        alert(response.message || "Erreur lors de la mise à jour du profil");
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <ThemeToggle />
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-white">
            Complétez votre profil
          </h1>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Quelques infos pour personnaliser votre expérience
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleOnboarding} className="space-y-6">
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Prénom
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400"
              placeholder="Votre prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Nom
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400"
              placeholder="Votre nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Âge
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400"
              placeholder="Votre âge"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Taille (cm)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400"
              placeholder="Votre taille en cm"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Poids (kg)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400"
              placeholder="Votre poids en kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Sexe
            </label>
            <div className="flex space-x-4">
              {genders.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`rounded-xl border px-4 py-2 transition-colors ${
                    gender === g.value
                      ? "border-yellow-500 dark:border-yellow-400 bg-yellow-500 dark:bg-yellow-600 text-white"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-yellow-300 dark:hover:border-yellow-500"
                  }`}
                  onClick={() => setGender(g.value)}
                >
                  <span className={gender === g.value ? "font-bold" : ""}>
                    {g.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-6 rounded-xl py-4 text-lg font-bold text-white transition-colors ${
              isLoading
                ? "bg-gray-400 dark:bg-gray-600"
                : "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
            }`}
          >
            {isLoading ? "Enregistrement..." : "Terminer"}
          </button>
        </form>
      </div>
    </div>
  );
}
