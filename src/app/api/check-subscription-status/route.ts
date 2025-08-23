import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const PAYMENT_API_URL =
      process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:3003/api";

    // Utiliser la même approche que la version mobile : appeler directement le PaymentService
    try {
      const response = await fetch(
        `${PAYMENT_API_URL}/subscriptions/check-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const result = await response.json();

        return NextResponse.json({
          success: true,
          subscriptionStatus: result.subscriptionStatus,
          isPremium: result.isPremium,
        });
      } else {
        return NextResponse.json(
          { error: "Erreur PaymentService" },
          { status: response.status }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Erreur de connexion au PaymentService" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la vérification du statut" },
      { status: 500 }
    );
  }
}
