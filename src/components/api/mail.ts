// API Envoi d'emails pour la version web

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  attachments?: File[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
}

export const sendEmail = async (
  emailData: EmailData
): Promise<EmailResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const formData = new FormData();
    formData.append("to", emailData.to);
    formData.append("subject", emailData.subject);
    formData.append("content", emailData.content);

    if (emailData.attachments) {
      emailData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIL_API_URL!}/mail/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messageId,
        message: "Email envoyé avec succès",
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'envoi de l'email",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de messagerie",
    };
  }
};

export const sendPainReport = async (painData: any): Promise<EmailResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIL_API_URL!}/mail/pain-report`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(painData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messageId,
        message: "Rapport de douleur envoyé avec succès",
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'envoi du rapport de douleur",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de messagerie",
    };
  }
};

export const sendMedicalReport = async (
  medicalData: any
): Promise<EmailResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MAIL_API_URL!}/mail/medical-report`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicalData),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messageId,
        message: "Rapport médical envoyé avec succès",
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'envoi du rapport médical",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de messagerie",
    };
  }
};
