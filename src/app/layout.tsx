import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeruExplorer | Descubre la Magia de los Andes",
  description: "Guía premium de lugares turísticos en Perú con reacciones de usuarios e ingresos optimizados.",
};

import { LanguageProvider } from "@/i18n/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <html lang="es">
          <body
            className={`${outfit.variable} antialiased`}
          >
            {children}
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}
