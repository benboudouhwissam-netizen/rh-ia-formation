import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from '../components/auth/AuthProvider';

/* ========================================
   TYPOGRAPHIE — DESIGN SYSTEM RH IA
   Lot 11
   ======================================== */

/* ========================================
   METADATA
   ======================================== */

export const metadata: Metadata = {
  title: "RH IA — Formation",
  description:
    "Plateforme RH IA — Module Formation & Compétences",
};

/* ========================================
   ROOT LAYOUT
   ======================================== */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className="h-full antialiased"
    >
      {/* AJOUTER ICI */}
      <head>
        {/* Icon styles are intentionally loaded from CDN; next/font is not used. */}
        {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" 
          rel="stylesheet" 
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
