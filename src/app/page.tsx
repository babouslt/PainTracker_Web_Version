"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("jwt");

      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  return null; // Affiche rien, c'est juste une page de redirection
}
