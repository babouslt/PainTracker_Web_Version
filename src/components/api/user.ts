const BDD_API_URL =
  process.env.NEXT_PUBLIC_BDD_API_URL || "http://localhost:3004/api";

export async function getUserById(userId: string, token: string) {
  try {
    const response = await fetch(`${BDD_API_URL}users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la récupération du profil",
    };
  }
}

export async function updateProfile(
  userId: string,
  profileData: any,
  token: string
) {
  try {
    const response = await fetch(`${BDD_API_URL}users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la mise à jour du profil",
    };
  }
}
