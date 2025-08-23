"use client";

import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface DiagnosisResult {
  titre: string;
  symptomes: string;
  cause: string;
  traitement: string;
  tests: string;
}

interface ResultSliderProps {
  results: DiagnosisResult[];
}

export default function ResultSlider({ results }: ResultSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === results.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? results.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!results || results.length === 0) {
    return null;
  }

  const currentResult = results[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Titre du slider avec gradient - parfaitement centré */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Résultats de l&apos;analyse IA
          </h3>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full shadow-md"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {currentIndex + 1}
          </span>{" "}
          sur{" "}
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {results.length}
          </span>{" "}
          diagnostics
        </p>
      </div>

      {/* Conteneur principal du slider - parfaitement centré */}
      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/30 w-full max-w-7xl mx-auto">
        {/* Effet de gradient en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/60 to-purple-50/40 dark:from-gray-800/40 dark:via-gray-700/60 dark:to-gray-800/40"></div>

        {/* Boutons de navigation - positionnement précis */}
        <button
          onClick={prevSlide}
          className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-40 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-gray-200/60 dark:border-gray-600/60"
          aria-label="Diagnostic précédent"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-40 bg-white/95 dark:bg-gray-700/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-gray-200/60 dark:border-gray-600/60"
          aria-label="Diagnostic suivant"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        {/* Carte du diagnostic actuel - contenu parfaitement centré */}
        <div className="relative z-10 p-6 min-h-[280px] flex flex-col justify-center">
          {/* Titre du diagnostic - parfaitement centré */}
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent mb-3">
              {currentResult.titre}
            </h4>
            {/* Points décoratifs parfaitement alignés */}
            <div className="flex justify-center items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>

          {/* Grille des informations - parfaitement alignée et centrée */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-6xl mx-auto w-full">
            {/* Symptômes */}
            <div className="group transform transition-all duration-300 hover:scale-105 h-full">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl p-4 shadow-md border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center text-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2 animate-pulse"></div>
                  Symptômes
                </h5>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {currentResult.symptomes}
                </p>
              </div>
            </div>

            {/* Cause */}
            <div className="group transform transition-all duration-300 hover:scale-105 h-full">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl p-4 shadow-md border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <h5 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center text-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-2 animate-pulse"></div>
                  Cause
                </h5>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {currentResult.cause}
                </p>
              </div>
            </div>

            {/* Traitement */}
            <div className="group transform transition-all duration-300 hover:scale-105 h-full">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 rounded-xl p-4 shadow-md border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <h5 className="font-bold text-orange-800 dark:text-orange-300 mb-2 flex items-center text-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-2 animate-pulse"></div>
                  Traitement
                </h5>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {currentResult.traitement}
                </p>
              </div>
            </div>

            {/* Tests recommandés */}
            <div className="group transform transition-all duration-300 hover:scale-105 h-full">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl p-4 shadow-md border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <h5 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center text-sm">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-2 animate-pulse"></div>
                  Tests recommandés
                </h5>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {currentResult.tests}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de navigation - parfaitement centrés */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        {results.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transform transition-all duration-300 hover:scale-125 ${
              index === currentIndex
                ? "w-3.5 h-3.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-md"
                : "w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-110"
            } rounded-full`}
            aria-label={`Aller au diagnostic ${index + 1}`}
          />
        ))}
      </div>

      {/* Instructions de navigation - parfaitement centrées */}
      <div className="text-center mt-6">
        <div className="inline-flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200/60 dark:border-gray-700/60">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            Utilisez les flèches ← → ou cliquez sur les indicateurs pour
            naviguer
          </span>
        </div>
      </div>
    </div>
  );
}
