// API Statistiques et métriques pour la version web

export interface PainStats {
  totalRecords: number;
  averageIntensity: number;
  mostCommonLocation: string;
  painTrend: "increasing" | "decreasing" | "stable";
  weeklyData: Array<{
    week: string;
    averageIntensity: number;
    recordCount: number;
  }>;
}

export interface StatsResponse {
  success: boolean;
  stats?: PainStats;
  message?: string;
}

export const getPainStats = async (): Promise<StatsResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_METRICS_API_URL!}/stats/pain`,
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
        stats: data.stats,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la récupération des statistiques",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de métriques",
    };
  }
};

export const getWeeklyReport = async (): Promise<StatsResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_METRICS_API_URL!}/stats/weekly`,
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
        stats: data.stats,
      };
    } else {
      return {
        success: false,
        message:
          data.message ||
          "Erreur lors de la récupération du rapport hebdomadaire",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de métriques",
    };
  }
};

export const getMonthlyReport = async (): Promise<StatsResponse> => {
  try {
    const token = localStorage.getItem("jwt");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_METRICS_API_URL!}/stats/monthly`,
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
        stats: data.stats,
      };
    } else {
      return {
        success: false,
        message:
          data.message || "Erreur lors de la récupération du rapport mensuel",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur de métriques",
    };
  }
};
