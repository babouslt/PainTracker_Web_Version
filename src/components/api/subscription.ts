export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
}

export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    clientSecret?: string;
    status: string;
  };
  message?: string;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  plans?: SubscriptionPlan[];
  message?: string;
}

export const getSubscriptionPlans =
  async (): Promise<SubscriptionPlansResponse> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_API_URL!}/subscription/plans`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          plans: data.plans,
        };
      } else {
        return {
          success: false,
          message:
            data.message ||
            "Erreur lors de la récupération des plans d'abonnement",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Erreur de connexion au serveur de paiement",
      };
    }
  };

export interface SubscriptionRequest {
  userId: string;
  email: string;
  amount?: number;
  currency?: string;
}

const PAYMENT_API_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:3001/api/";

export const createSubscription = async (
  subscriptionData: SubscriptionRequest
): Promise<SubscriptionResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token non trouvé");
    }

    const response = await fetch(`${PAYMENT_API_URL}subscriptions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscriptionData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur lors de la création de l'abonnement"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionStatus = async (
  subscriptionId: string
): Promise<SubscriptionResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token non trouvé");
    }

    const response = await fetch(
      `${PAYMENT_API_URL}subscriptions/${subscriptionId}/status`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur lors de la récupération du statut"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<SubscriptionResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token non trouvé");
    }

    const requestBody = { cancelAtPeriodEnd };

    const response = await fetch(
      `${PAYMENT_API_URL}subscriptions/${subscriptionId}/cancel`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubscription = async (
  subscriptionId: string
): Promise<SubscriptionResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token non trouvé");
    }

    const response = await fetch(
      `${PAYMENT_API_URL}subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Erreur lors de la récupération de l'abonnement"
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
};
