// API d'authentification pour la version web
const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL!;

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        token: data.token,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur de connexion",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const register = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: "Inscription réussie",
        token: data.token,
      };
    } else {
      return {
        success: false,
        message: data.message || "Erreur lors de l'inscription",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur de connexion au serveur",
    };
  }
};

export const logout = () => {
  localStorage.removeItem("jwt");
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("jwt");
  return !!token;
};
