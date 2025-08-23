// API Historique médical pour la version web

export interface MedicalRecord {
  id: string;
  type: "pain" | "analysis" | "consultation" | "medication";
  title: string;
  description: string;
  date: string;
  doctor?: string;
  location?: string;
  attachments?: string[];
  tags?: string[];
}

export interface HistoryResponse {
  success: boolean;
  records?: MedicalRecord[];
  record?: MedicalRecord;
  message?: string;
}

export const getMedicalHistory = async (): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history`,
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
          "Erreur lors de la récupération de l'historique médical",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const addMedicalRecord = async (
  recordData: Omit<MedicalRecord, "id">
): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
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
        message: data.message || "Erreur lors de l'ajout du dossier médical",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const updateMedicalRecord = async (
  id: string,
  recordData: Partial<MedicalRecord>
): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
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
          data.message || "Erreur lors de la mise à jour du dossier médical",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const deleteMedicalRecord = async (
  id: string
): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history/${id}`,
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
        message: "Dossier médical supprimé avec succès",
      };
    } else {
      const data = await response.json();
      return {
        success: false,
        message:
          data.message || "Erreur lors de la suppression du dossier médical",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const searchMedicalHistory = async (
  query: string,
  filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<HistoryResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const params = new URLSearchParams({ q: query });
    if (filters?.type) params.append("type", filters.type);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history/search?${params}`,
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
        message: data.message || "Erreur lors de la recherche",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

// Fonction pour récupérer l'historique médical d'un utilisateur spécifique (comme dans la version mobile)
export const getUserMedicalHistory = async (userId: string): Promise<any> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BDD_API_URL!}/history/user/${userId}`,
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
        data: data.data || data,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la récupération de l'historique",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};
