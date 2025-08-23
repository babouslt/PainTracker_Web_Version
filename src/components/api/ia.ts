const IA_API_URL =
  process.env.NEXT_PUBLIC_IA_API_URL || "http://localhost:3002/api";

export async function generateMedicalAnalysis(analysisData: {
  userId: string;
  age: number;
  sexe: string;
  taille: number;
  poids: number;
  symptomes: string;
  niveauDouleur: number;
  localisationDouleur: string;
}) {
  try {
    const response = await fetch(`${IA_API_URL}ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysisData),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la génération de l'analyse médicale",
    };
  }
}
