import { NextRequest, NextResponse } from "next/server";
import { buildMailServiceUrl, MAIL_SERVICE_CONFIG } from "@/config/mail";

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 }
      );
    }

    // Appel au MailService
    const mailServiceUrl = buildMailServiceUrl(
      MAIL_SERVICE_CONFIG.ENDPOINTS.SEND_WELCOME_EMAIL
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      MAIL_SERVICE_CONFIG.DEFAULT_TIMEOUT
    );

    const response = await fetch(mailServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        firstName: firstName || "",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erreur MailService:", errorData);
      return NextResponse.json(
        { success: false, message: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur API send-welcome-email:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, message: "Timeout lors de l'envoi de l'email" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
