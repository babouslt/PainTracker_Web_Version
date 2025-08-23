"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login as loginApi } from "@/components/api/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (!email.includes("@")) {
      alert("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginApi(email, password);
      if (response.success) {
        if (response.token) {
          localStorage.setItem("jwt", response.token);
        }
        alert("Connexion réussie !");
        router.replace("/home");
      } else {
        alert(response.message || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <ThemeToggle />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800 dark:text-white">
            Connexion
          </h1>
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300 block">
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-4 text-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full mt-6 rounded-xl py-4 text-lg font-bold text-white transition-colors ${
              isLoading
                ? "bg-gray-400 dark:bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>

          {/* Forgot Password */}
          <div className="text-center py-2">
            <button className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Mot de passe oublié ?
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-8 flex items-center justify-center py-4">
          <span className="text-lg text-gray-600 dark:text-gray-300">
            Pas encore de compte ?{" "}
          </span>
          <Link
            href="/register"
            className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 ml-1"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
