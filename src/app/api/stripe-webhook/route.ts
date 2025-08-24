import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-07-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature Stripe manquante" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return NextResponse.json(
        { error: "Signature webhook invalide" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du traitement du webhook" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const { id: subscriptionId, metadata, status } = subscription;
    const userId = metadata.userId;

    if (userId && status === "active") {
      await updateUserPremiumStatus(userId, true);
    }
  } catch (error) {
    // Gestion silencieuse de l'erreur
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const { id: subscriptionId, status, metadata } = subscription;
    const userId = metadata.userId;

    if (userId) {
      if (status === "active") {
        await updateUserPremiumStatus(userId, true);
      } else if (
        ["canceled", "unpaid", "past_due", "incomplete"].includes(status)
      ) {
        await updateUserPremiumStatus(userId, false);
      }
    }
  } catch (error) {
    // Gestion silencieuse de l'erreur
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const { metadata } = subscription;
    const userId = metadata.userId;

    if (userId) {
      await updateUserPremiumStatus(userId, false);
    }
  } catch (error) {
    // Gestion silencieuse de l'erreur
  }
}

async function updateUserPremiumStatus(userId: string, isPremium: boolean) {
  try {
    const BDD_API_URL =
      process.env.NEXT_PUBLIC_BDD_API_URL || "http://localhost:3004/api";

    const response = await fetch(`${BDD_API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isPremium }),
    });

    if (response.ok) {
    } else {
    }
  } catch (error) {
    // Gestion silencieuse de l'erreur
  }
}
