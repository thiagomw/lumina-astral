import Link from "next/link";
import { Lock } from "lucide-react";
import type { MapaAstral } from "@/lib/astrologia";
import { SIMBOLO_PLANETA, PLANETAS_PLANO_GRATIS } from "@/lib/planetas";

function LinhaPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-border/70 px-4 py-3 text-sm text-foreground/40">
      <span className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5" /> {label}
      </span>
      <Link href="/planos" className="text-accent-2 hover:underline">
        Desbloquear
      </Link>
    </div>
  );
}

export function PlacementsList({
  mapa,
  planoAtual,
}: {
  mapa: MapaAstral;
  planoAtual: "FREE" | "ESSENCIAL" | "MISTICO";
}) {
  const temPlanetasCompletos = planoAtual !== "FREE";
  const temAspectos = planoAtual === "MISTICO";

  const planetasVisiveis = temPlanetasCompletos
    ? mapa.planetas
    : mapa.planetas.filter((p) => PLANETAS_PLANO_GRATIS.includes(p.nome));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Ângulos
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="glass-card flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-sm text-foreground/70">Ascendente</span>
            <span className="font-display font-semibold">
              {mapa.ascendente.simboloSigno} {mapa.ascendente.signo} · {mapa.ascendente.grauFormatado}
            </span>
          </div>
          <div className="glass-card flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-sm text-foreground/70">Meio do Céu</span>
            <span className="font-display font-semibold">
              {mapa.meioDoCeu.simboloSigno} {mapa.meioDoCeu.signo} · {mapa.meioDoCeu.grauFormatado}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Planetas
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {planetasVisiveis.map((p) => (
            <div
              key={p.nome}
              className="glass-card flex items-center justify-between rounded-xl px-4 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-foreground/70">
                <span className="text-base">{SIMBOLO_PLANETA[p.nome]}</span>
                {p.nome}
                {p.retrogrado && (
                  <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                    Rx
                  </span>
                )}
              </span>
              <span className="font-display font-semibold">
                {p.simboloSigno} {p.signo} · {p.grauFormatado}
                <span className="ml-2 text-xs font-normal text-foreground/40">casa {p.casa}</span>
              </span>
            </div>
          ))}

          {!temPlanetasCompletos && <LinhaPlaceholder label="+8 planetas no plano Essencial" />}
        </div>
      </div>

      <div>
        <h3 className="font-display mb-3 text-sm font-semibold uppercase tracking-widest text-foreground/50">
          Aspectos
        </h3>
        {temAspectos ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {mapa.aspectos.length === 0 && (
              <p className="text-sm text-foreground/50">Nenhum aspecto relevante encontrado.</p>
            )}
            {mapa.aspectos.map((a, i) => (
              <div key={i} className="glass-card rounded-xl px-4 py-2.5 text-sm text-foreground/70">
                {a.entre[0]} <span className="text-accent-2">{a.tipo}</span> {a.entre[1]}
                <span className="ml-2 text-xs text-foreground/40">orbe {a.orbe}°</span>
              </div>
            ))}
          </div>
        ) : (
          <LinhaPlaceholder label="Aspectos entre planetas no plano Místico" />
        )}
      </div>
    </div>
  );
}
