import { SIGNOS } from "@/lib/zodiaco";
import { SIMBOLO_PLANETA, COR_ASPECTO } from "@/lib/planetas";
import type { MapaAstral } from "@/lib/astrologia";

const TAMANHO = 420;
const CENTRO = TAMANHO / 2;
const RAIO_SIGNOS = 195;
const RAIO_SIMBOLO_SIGNO = 170;
const RAIO_PLANETAS = 130;
const RAIO_ASPECTOS = 95;

function paraPonto(longitude: number, ascendenteLon: number, raio: number) {
  const anguloDeg = 180 + (longitude - ascendenteLon);
  const anguloRad = (anguloDeg * Math.PI) / 180;
  return {
    x: CENTRO + raio * Math.cos(anguloRad),
    y: CENTRO - raio * Math.sin(anguloRad),
  };
}

export function ChartWheel({
  mapa,
  mostrarAspectos = false,
}: {
  mapa: MapaAstral;
  mostrarAspectos?: boolean;
}) {
  const ascLon = mapa.ascendente.longitude;

  const segmentosSigno = SIGNOS.map((signo, i) => {
    const inicio = i * 30;
    const meio = inicio + 15;
    const p1 = paraPonto(inicio, ascLon, RAIO_SIGNOS);
    const label = paraPonto(meio, ascLon, RAIO_SIMBOLO_SIGNO);
    return { signo, inicio, p1, label };
  });

  const planetasComPonto = mapa.planetas.map((p) => ({
    ...p,
    ponto: paraPonto(p.longitude, ascLon, RAIO_PLANETAS),
    pontoAspecto: paraPonto(p.longitude, ascLon, RAIO_ASPECTOS),
  }));

  const ascPonto = paraPonto(ascLon, ascLon, RAIO_SIGNOS + 15);
  const mcPonto = paraPonto(mapa.meioDoCeu.longitude, ascLon, RAIO_SIGNOS + 15);

  return (
    <svg
      viewBox={`0 0 ${TAMANHO} ${TAMANHO}`}
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label="Roda do mapa astral"
    >
      <circle cx={CENTRO} cy={CENTRO} r={RAIO_SIGNOS} fill="none" stroke="var(--border)" />
      <circle cx={CENTRO} cy={CENTRO} r={RAIO_PLANETAS + 20} fill="none" stroke="var(--border)" strokeOpacity={0.5} />
      <circle cx={CENTRO} cy={CENTRO} r={RAIO_ASPECTOS} fill="none" stroke="var(--border)" strokeOpacity={0.3} />

      {segmentosSigno.map(({ signo, p1, label }) => (
        <g key={signo.nome}>
          <line
            x1={CENTRO}
            y1={CENTRO}
            x2={p1.x}
            y2={p1.y}
            stroke="var(--border)"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <text
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={16}
            fill="var(--accent-2)"
          >
            {signo.simbolo}
          </text>
        </g>
      ))}

      {mostrarAspectos &&
        mapa.aspectos.map((aspecto, i) => {
          const a = planetasComPonto.find((p) => p.nome === aspecto.entre[0]);
          const b = planetasComPonto.find((p) => p.nome === aspecto.entre[1]);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.pontoAspecto.x}
              y1={a.pontoAspecto.y}
              x2={b.pontoAspecto.x}
              y2={b.pontoAspecto.y}
              stroke={COR_ASPECTO[aspecto.tipo]}
              strokeWidth={1}
              strokeOpacity={0.45}
            />
          );
        })}

      <line
        x1={CENTRO - (RAIO_SIGNOS + 15)}
        y1={CENTRO}
        x2={CENTRO + (RAIO_SIGNOS + 15)}
        y2={CENTRO}
        stroke="var(--primary)"
        strokeOpacity={0.3}
        strokeDasharray="2 3"
      />
      <text x={ascPonto.x - 14} y={ascPonto.y} fontSize={11} fill="var(--primary)" fontWeight={700}>
        ASC
      </text>
      <text x={mcPonto.x - 8} y={mcPonto.y - 6} fontSize={11} fill="var(--primary)" fontWeight={700}>
        MC
      </text>

      {planetasComPonto.map((p) => (
        <g key={p.nome}>
          <circle cx={p.ponto.x} cy={p.ponto.y} r={11} fill="var(--surface-2)" stroke="var(--border)" />
          <text
            x={p.ponto.x}
            y={p.ponto.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="var(--foreground)"
          >
            {SIMBOLO_PLANETA[p.nome] ?? p.nome[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}
