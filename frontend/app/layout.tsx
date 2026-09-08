import type { Metadata } from "next";
import {
  Space_Grotesk,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
} from "next/font/google";

import "./globals.css";
import { AuthProvider } from '../components/auth/AuthProvider';

/* ========================================
   TYPOGRAPHIE — DESIGN SYSTEM RH IA
   Lot 11
   ======================================== */

const spaceGrotesk = Space_Grotesk({
  variable: "--font-rh-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-rh-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-rh-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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
      className={`
        ${spaceGrotesk.variable}
        ${ibmPlexSans.variable}
        ${ibmPlexMono.variable}
        h-full
        antialiased
      `}
    >
      {/* AJOUTER ICI */}
      <head>
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
