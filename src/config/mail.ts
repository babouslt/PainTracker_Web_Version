// Configuration du MailService
export const MAIL_SERVICE_CONFIG = {
  // URL du MailService (port par défaut: 3005)
  BASE_URL: process.env.MAIL_SERVICE_URL || "http://localhost:3005",

  // Endpoints
  ENDPOINTS: {
    SEND_WELCOME_EMAIL: "/api/mail/send",
  },

  // Configuration par défaut
  DEFAULT_TIMEOUT: 10000, // 10 secondes
};

// Fonction pour construire l'URL complète
export const buildMailServiceUrl = (endpoint: string): string => {
  return `${MAIL_SERVICE_CONFIG.BASE_URL}${endpoint}`;
};
