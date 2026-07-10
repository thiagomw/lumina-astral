import { PLANOS } from "@/lib/planos";
import { PlanCard } from "@/components/plans/PlanCard";

export function PlanosPreview() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Escolha seu <span className="text-gradient">nível</span> de conexão
          </h2>
          <p className="mt-3 text-foreground/60">
            Comece de graça. Evolua quando estiver pronta(o).
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {PLANOS.map((plano) => (
            <PlanCard
              key={plano.id}
              plano={plano}
              ctaHref="/cadastro"
              ctaLabel={plano.preco === 0 ? "Começar grátis" : "Assinar agora"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
