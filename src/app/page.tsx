import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Features } from "@/components/landing/Features";
import { PlanosPreview } from "@/components/landing/PlanosPreview";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Lumina Astral",
      url: appUrl,
    },
    {
      "@type": "WebSite",
      name: "Lumina Astral",
      url: appUrl,
      inLanguage: "pt-BR",
      description:
        "Monte seu mapa astral com precisão astronômica real: Sol, Lua, Ascendente, planetas, casas e aspectos.",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <ComoFunciona />
        <Features />
        <PlanosPreview />
      </main>
      <Footer />
    </>
  );
}
