// API pour l'envoi d'emails
export interface WelcomeEmailData {
  email: string;
  firstName?: string;
}

export interface MailResponse {
  success: boolean;
  message?: string;
}

export const sendWelcomeEmail = async (
  data: WelcomeEmailData
): Promise<MailResponse> => {
  try {
    const response = await fetch("/api/send-welcome-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: result.message || "Email envoyé avec succès",
      };
    } else {
      return {
        success: false,
        message: result.message || "Erreur lors de l'envoi de l'email",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};
