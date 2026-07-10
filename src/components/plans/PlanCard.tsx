import { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import type { PlanoInfo } from "@/lib/planos";
import { Check } from "lucide-react";

export function PlanCard({
  plano,
  ctaHref,
  ctaLabel,
  ctaSlot,
}: {
  plano: PlanoInfo;
  ctaHref?: string;
  ctaLabel?: string;
  ctaSlot?: ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl p-8 ${
        plano.destaque
          ? "border-2 border-accent bg-surface-2/80 shadow-xl shadow-accent/10"
          : "glass-card"
      }`}
    >
      {plano.destaque && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      )}

      <h3 className="font-display text-xl font-bold">{plano.nome}</h3>
      <p className="mt-1 text-sm text-foreground/60">{plano.descricao}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">
          {plano.preco === 0 ? "R$0" : `R$${plano.preco.toFixed(2).replace(".", ",")}`}
        </span>
        {plano.preco > 0 && <span className="text-sm text-foreground/50">/mês</span>}
      </div>

      <ul className="mt-8 flex-1 space-y-3">
        {plano.recursos.map((recurso) => (
          <li key={recurso} className="flex items-start gap-2 text-sm text-foreground/80">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-2" />
            {recurso}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {ctaSlot ??
          (ctaHref && (
            <ButtonLink
              href={ctaHref}
              variant={plano.destaque ? "primary" : "secondary"}
              className="w-full"
            >
              {ctaLabel}
            </ButtonLink>
          ))}
      </div>
    </div>
  );
}
