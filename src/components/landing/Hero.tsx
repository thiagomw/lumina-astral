import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="glass-card rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-accent-2">
          ✨ seu portal astrológico pessoal
        </span>

        <h1 className="font-display mt-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Descubra o que os astros
          <br />
          <span className="text-gradient">contam sobre você</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-foreground/70 sm:text-lg">
          Monte seu mapa astral em segundos: Sol, Lua, Ascendente, casas e
          aspectos calculados com precisão astronômica real — numa vibe leve,
          jovem e mística, só sua.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/cadastro" className="text-base">
            Gerar meu mapa grátis
          </ButtonLink>
          <ButtonLink href="/planos" variant="secondary" className="text-base">
            Ver planos
          </ButtonLink>
        </div>

        <p className="mt-6 text-xs text-foreground/40">
          Sem cartão de crédito para começar · leva menos de 2 minutos
        </p>
      </div>
    </section>
  );
}
