import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Features } from "@/components/landing/Features";
import { PlanosPreview } from "@/components/landing/PlanosPreview";

export default function Home() {
  return (
    <>
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
