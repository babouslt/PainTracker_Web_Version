// API Gestion des douleurs pour la version web

export interface PainRecord {
  id?: string;
  intensity: number;
  location: string;
  description?: string;
  duration?: number;
  triggers?: string[];
  timestamp: string;
}

export interface PainRecordResponse {
  success: boolean;
  record?: PainRecord;
  records?: PainRecord[];
  message?: string;
}

export const createPainRecord = async (
  painData: Omit<PainRecord, "id" | "timestamp">
): Promise<PainRecordResponse> => {
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
        body: JSON.stringify({
          ...painData,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        record: data.record,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la création du relevé de douleur",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const getPainRecords = async (): Promise<PainRecordResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        records: data.records,
      };
    } else {
      return {
        success: false,
        message:
          data.message ||
          "Erreur lors de la récupération des relevés de douleur",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const updatePainRecord = async (
  id: string,
  painData: Partial<PainRecord>
): Promise<PainRecordResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/${id}`,
      {
        method: "PUT",
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
        record: data.record,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la mise à jour du relevé de douleur",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const deletePainRecord = async (
  id: string
): Promise<PainRecordResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/pain/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return {
        success: true,
        message: "Relevé de douleur supprimé avec succès",
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message:
          data.message || "Erreur lors de la suppression du relevé de douleur",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};
