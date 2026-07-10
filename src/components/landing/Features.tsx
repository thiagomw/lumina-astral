const features = [
  {
    icone: "☀️",
    titulo: "Sol, Lua e Ascendente",
    descricao: "A tríade essencial da sua personalidade, explicada sem enrolação.",
  },
  {
    icone: "🪐",
    titulo: "Todos os planetas",
    descricao: "Mercúrio, Vênus, Marte e mais — cada um na sua casa e no seu signo.",
  },
  {
    icone: "🔺",
    titulo: "Aspectos entre planetas",
    descricao: "Trígonos, quadraturas e oposições que revelam suas tensões e talentos.",
  },
  {
    icone: "🏠",
    titulo: "Casas astrológicas",
    descricao: "Onde cada energia do seu mapa se manifesta na sua vida real.",
  },
  {
    icone: "🌙",
    titulo: "Atualizações contínuas",
    descricao: "Seu mapa evolui com novos conteúdos e trânsitos ao longo do tempo.",
  },
  {
    icone: "🔒",
    titulo: "Seus dados, sua privacidade",
    descricao: "Informações de nascimento protegidas — só você acessa seu mapa.",
  },
];

export function Features() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Tudo que o <span className="text-gradient">universo</span> guarda sobre você
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.titulo}
              className="glass-card rounded-2xl p-6 transition hover:border-accent/50"
            >
              <span className="text-3xl">{feature.icone}</span>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {feature.titulo}
              </h3>
              <p className="mt-2 text-sm text-foreground/60">{feature.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
