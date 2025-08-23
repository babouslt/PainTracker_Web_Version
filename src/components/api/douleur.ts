// API Gestion des douleurs pour le système de suivi
// Adaptée au backend BDDService

export interface PainEvolution {
  date: Date;
  note?: string;
  intensite?: number;
  symptomes?: string;
}

export interface PainRecord {
  _id: string;
  userId: string;
  symptomes: string;
  localisation: string;
  cause?: string;
  dateDebut: Date;
  intensiteDouleur: number;
  evolutions: PainEvolution[];
  status: "actif" | "fini";
  dateFin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PainResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Créer une nouvelle douleur
export const createPain = async (painData: {
  userId: string;
  symptomes: string;
  localisation: string;
  cause?: string;
  dateDebut: string;
  intensiteDouleur: number;
}): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(painData),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Récupérer toutes les douleurs d'un utilisateur
export const getUserPains = async (userId: string): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Récupérer les douleurs d'un utilisateur par statut
export const getUserPainsByStatus = async (
  userId: string,
  status: "actif" | "fini"
): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/status/${userId}/${status}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Récupérer une douleur spécifique
export const getPainDetail = async (painId: string): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/detail/${painId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Ajouter une évolution à une douleur
export const addPainEvolution = async (
  painId: string,
  evolution: {
    note?: string;
    intensite?: number;
    symptomes?: string;
  }
): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/${painId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...evolution,
          date: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Clôturer une douleur
export const closePain = async (painId: string): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/close/${painId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Supprimer une douleur
export const deletePain = async (painId: string): Promise<PainResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/${painId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erreur serveur");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Erreur de connexion au serveur",
    };
  }
};

// Fonctions utilitaires pour adapter les données
export const adaptPainRecordToDouleur = (painRecord: PainRecord) => ({
  id: painRecord._id,
  titre: painRecord.localisation,
  symptomes: painRecord.symptomes,
  cause: painRecord.cause || "",
  dateDebut: new Date(painRecord.dateDebut).toLocaleDateString("fr-FR"),
  intensite: painRecord.intensiteDouleur,
  statut: painRecord.status === "actif" ? "active" : "terminee",
  evolutions: painRecord.evolutions.map((ev) => ({
    id:
      ev.date instanceof Date
        ? ev.date.getTime().toString()
        : new Date(ev.date).getTime().toString(),
    douleurId: painRecord._id,
    date:
      ev.date instanceof Date
        ? ev.date.toLocaleString("fr-FR")
        : new Date(ev.date).toLocaleString("fr-FR"),
    note: ev.note || "",
    symptomes: ev.symptomes || "",
    intensite: ev.intensite || painRecord.intensiteDouleur,
  })),
});

export const adaptDouleurToPainRecord = (douleur: any) => ({
  userId: douleur.userId,
  symptomes: douleur.symptomes,
  localisation: douleur.titre,
  cause: douleur.cause,
  dateDebut: new Date(douleur.dateDebut),
  intensiteDouleur: douleur.intensite,
});
