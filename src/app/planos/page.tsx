import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PlanCard } from "@/components/plans/PlanCard";
import { PLANOS } from "@/lib/planos";
import { auth } from "@/auth";

export default async function PlanosPage() {
  const session = await auth();
  const destino = session?.user ? "/dashboard/assinatura" : "/cadastro";

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-2">
              Planos
            </span>
            <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
              Encontre o seu <span className="text-gradient">nível de conexão</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-foreground/60">
              Todos os planos incluem o cálculo astronômico real do seu mapa.
              Cancele quando quiser, sem burocracia.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {PLANOS.map((plano) => (
              <PlanCard
                key={plano.id}
                plano={plano}
                ctaHref={plano.id === "FREE" ? "/cadastro" : destino}
                ctaLabel={plano.preco === 0 ? "Começar grátis" : "Assinar agora"}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
