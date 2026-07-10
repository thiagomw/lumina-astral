import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calcularMapaAstral } from "@/lib/astrologia";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { PlacementsList } from "@/components/chart/PlacementsList";
import { ButtonLink } from "@/components/ui/Button";
import { PLANETAS_PLANO_GRATIS } from "@/lib/planetas";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const perfil = await prisma.birthProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!perfil) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-bold">
          Você ainda não tem um mapa astral
        </h1>
        <p className="mx-auto mt-3 max-w-md text-foreground/60">
          Preencha seus dados de nascimento e descubra o que os astros dizem
          sobre você.
        </p>
        <ButtonLink href="/dashboard/mapa/novo" className="mt-6 inline-flex">
          Criar meu mapa astral
        </ButtonLink>
      </div>
    );
  }

  const mapa = calcularMapaAstral({
    dataHoraUtc: perfil.dataHoraUtc,
    latitude: perfil.latitude,
    longitude: perfil.longitude,
  });

  const plano = session.user.plan as "FREE" | "ESSENCIAL" | "MISTICO";

  const mapaParaRoda =
    plano === "FREE"
      ? { ...mapa, planetas: mapa.planetas.filter((p) => PLANETAS_PLANO_GRATIS.includes(p.nome)) }
      : mapa;

  return (
    <div className="space-y-10">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-2">
          {perfil.nome}
        </span>
        <h1 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
          Seu <span className="text-gradient">mapa astral</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/50">
          {perfil.cidade} · nascimento registrado em {perfil.timezone}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[420px_1fr] lg:items-start">
        <div className="glass-card rounded-3xl p-6">
          <ChartWheel mapa={mapaParaRoda} mostrarAspectos={plano === "MISTICO"} />
        </div>
        <PlacementsList mapa={mapa} planoAtual={plano} />
      </div>
    </div>
  );
}
