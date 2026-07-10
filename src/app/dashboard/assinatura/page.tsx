import { auth } from "@/auth";
import { PLANOS, planoPorId } from "@/lib/planos";
import { PlanCard } from "@/components/plans/PlanCard";
import { CheckoutButton } from "@/components/plans/CheckoutButton";
import { Button } from "@/components/ui/Button";

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ sucesso?: string; cancelado?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const planoAtual = planoPorId(session?.user?.plan);

  return (
    <div>
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-2">
          Assinatura
        </span>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
          Seu plano atual: <span className="text-gradient">{planoAtual.nome}</span>
        </h1>

        {params.sucesso && (
          <p className="mt-3 text-sm text-emerald-400">
            Pagamento confirmado! Pode levar alguns instantes para seu plano atualizar.
          </p>
        )}
        {params.cancelado && (
          <p className="mt-3 text-sm text-foreground/50">Checkout cancelado.</p>
        )}
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {PLANOS.map((plano) => {
          const ehAtual = plano.id === planoAtual.id;
          return (
            <PlanCard
              key={plano.id}
              plano={plano}
              ctaSlot={
                ehAtual ? (
                  <Button variant="secondary" disabled className="w-full">
                    Plano atual
                  </Button>
                ) : plano.id === "FREE" ? undefined : (
                  <CheckoutButton planoId={plano.id} label={`Assinar ${plano.nome}`} />
                )
              }
            />
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs text-foreground/40">
        Pagamentos processados via Stripe. Em ambiente de desenvolvimento, configure
        STRIPE_SECRET_KEY e os price IDs no .env para testar o checkout em modo teste.
      </p>
    </div>
  );
}
