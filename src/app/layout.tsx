import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

const title = "Lumina Astral — Seu mapa astral, sua jornada";
const description =
  "Monte seu mapa astral com precisão astronômica real: Sol, Lua, Ascendente, planetas, casas e aspectos. Sem textos genéricos de signo — cálculo de verdade, numa vibe jovem e mística.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: title,
    template: "%s · Lumina Astral",
  },
  description,
  keywords: [
    "mapa astral",
    "astrologia",
    "signo",
    "ascendente",
    "mapa astral grátis",
    "casas astrológicas",
    "aspectos planetários",
  ],
  authors: [{ name: "Thiago Ribeiro" }],
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Lumina Astral",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzel.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="stars-bg" />
        <div className="stars-layer" />
        {children}
      </body>
    </html>
  );
}
