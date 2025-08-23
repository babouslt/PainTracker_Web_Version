"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register as registerApi } from "@/components/api/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerApi(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      if (response.success) {
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        router.replace("/login");
      } else {
        alert(response.message || "Erreur lors de l'inscription");
      }
    } catch (error) {
      alert("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <ThemeToggle />
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-white">
            Inscription
          </h1>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Créez votre compte
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Votre prénom"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Votre nom"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Confirmez votre mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-6 rounded-xl py-4 text-lg font-bold text-white transition-colors ${
              isLoading
                ? "bg-gray-400 dark:bg-gray-600"
                : "bg-green-500 hover:bg-green-600 active:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            }`}
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        {/* Lien de connexion */}
        <div className="mt-8 flex items-center justify-center py-4">
          <span className="text-lg text-gray-600 dark:text-gray-300">
            Déjà un compte ?{" "}
          </span>
          <Link
            href="/login"
            className="text-lg font-bold text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 ml-1"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
