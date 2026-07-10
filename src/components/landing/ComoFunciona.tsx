const passos = [
  {
    numero: "01",
    titulo: "Conte sua história",
    descricao: "Data, hora e local de nascimento. É só isso que a gente precisa.",
  },
  {
    numero: "02",
    titulo: "Os astros calculam",
    descricao:
      "Cruzamos suas informações com posições astronômicas reais dos planetas no instante em que você nasceu.",
  },
  {
    numero: "03",
    titulo: "Seu mapa revelado",
    descricao:
      "Sol, Lua, Ascendente e muito mais — do básico ao profundo, no seu ritmo e no seu plano.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Como <span className="text-gradient">funciona</span>
          </h2>
          <p className="mt-3 text-foreground/60">
            Três passos entre você e o seu mapa astral completo.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {passos.map((passo) => (
            <div key={passo.numero} className="glass-card rounded-2xl p-6">
              <span className="font-display text-3xl text-primary/70">
                {passo.numero}
              </span>
              <h3 className="font-display mt-4 text-lg font-semibold">
                {passo.titulo}
              </h3>
              <p className="mt-2 text-sm text-foreground/60">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
