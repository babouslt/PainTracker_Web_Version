import { NextRequest, NextResponse } from "next/server";

const BDD_API_URL =
  process.env.NEXT_PUBLIC_BDD_API_URL || "http://localhost:3004/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BDD_API_URL}/history/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la récupération de l'historique médical",
      },
      { status: 500 }
    );
  }
}
