import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StripeProvider } from "@/components/StripeProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Application Santé - Version Web",
  description: "Version web de votre application de santé intelligente",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider>
          <StripeProvider>{children}</StripeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
