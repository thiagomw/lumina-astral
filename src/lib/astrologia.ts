import * as Astronomy from "astronomy-engine";
import { grausParaSigno, formatarGrau, SIGNOS } from "@/lib/zodiaco";

export interface DadosNascimento {
  /** Instante do nascimento já convertido para UTC */
  dataHoraUtc: Date;
  /** Latitude em graus decimais (positivo = Norte) */
  latitude: number;
  /** Longitude em graus decimais (positivo = Leste) */
  longitude: number;
}

export interface PosicaoPlaneta {
  corpo: string;
  nome: string;
  simboloSigno: string;
  signo: string;
  grauNoSigno: number;
  grauFormatado: string;
  longitude: number;
  casa: number;
  retrogrado: boolean;
}

export interface Angulo {
  signo: string;
  simboloSigno: string;
  grauNoSigno: number;
  grauFormatado: string;
  longitude: number;
}

export interface CasaWholeSign {
  numero: number;
  signo: string;
  simboloSigno: string;
}

export type TipoAspecto =
  | "Conjunção"
  | "Oposição"
  | "Trígono"
  | "Quadratura"
  | "Sextil";

export interface Aspecto {
  entre: [string, string];
  tipo: TipoAspecto;
  anguloExato: number;
  orbe: number;
}

export interface MapaAstral {
  planetas: PosicaoPlaneta[];
  ascendente: Angulo;
  meioDoCeu: Angulo;
  casas: CasaWholeSign[];
  aspectos: Aspecto[];
}

const CORPOS: { corpo: Astronomy.Body; nome: string }[] = [
  { corpo: Astronomy.Body.Sun, nome: "Sol" },
  { corpo: Astronomy.Body.Moon, nome: "Lua" },
  { corpo: Astronomy.Body.Mercury, nome: "Mercúrio" },
  { corpo: Astronomy.Body.Venus, nome: "Vênus" },
  { corpo: Astronomy.Body.Mars, nome: "Marte" },
  { corpo: Astronomy.Body.Jupiter, nome: "Júpiter" },
  { corpo: Astronomy.Body.Saturn, nome: "Saturno" },
  { corpo: Astronomy.Body.Uranus, nome: "Urano" },
  { corpo: Astronomy.Body.Neptune, nome: "Netuno" },
  { corpo: Astronomy.Body.Pluto, nome: "Plutão" },
];

const ASPECTOS_DEF: { tipo: TipoAspecto; angulo: number; orbe: number }[] = [
  { tipo: "Conjunção", angulo: 0, orbe: 8 },
  { tipo: "Oposição", angulo: 180, orbe: 8 },
  { tipo: "Trígono", angulo: 120, orbe: 6 },
  { tipo: "Quadratura", angulo: 90, orbe: 6 },
  { tipo: "Sextil", angulo: 60, orbe: 4 },
];

function norm360(graus: number): number {
  const g = graus % 360;
  return g < 0 ? g + 360 : g;
}

/** Longitude eclíptica geocêntrica aparente de um corpo, em graus (0-360). */
function longitudeGeocentrica(corpo: Astronomy.Body, time: Astronomy.AstroTime): number {
  const vetor = Astronomy.GeoVector(corpo, time, true);
  const eclipse = Astronomy.Ecliptic(vetor);
  return norm360(eclipse.elon);
}

/** Detecta movimento retrógrado comparando a longitude com ~1h de diferença. */
function estaRetrogrado(corpo: Astronomy.Body, time: Astronomy.AstroTime): boolean {
  const antes = new Astronomy.AstroTime(time.ut - 1 / 24);
  const depois = new Astronomy.AstroTime(time.ut + 1 / 24);
  const lonAntes = longitudeGeocentrica(corpo, antes);
  const lonDepois = longitudeGeocentrica(corpo, depois);
  let diff = lonDepois - lonAntes;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function calcularAscendenteMeioDoCeu(
  time: Astronomy.AstroTime,
  latitude: number,
  longitude: number
) {
  const gastGraus = Astronomy.SiderealTime(time) * 15;
  const lstGraus = norm360(gastGraus + longitude);
  const obliquidade = Astronomy.e_tilt(time).tobl;

  const theta = (lstGraus * Math.PI) / 180;
  const eps = (obliquidade * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;

  const ascY = Math.cos(theta);
  const ascX = -(Math.sin(theta) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps));
  const ascendenteLon = norm360((Math.atan2(ascY, ascX) * 180) / Math.PI);

  const mcLon = norm360(
    (Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(eps)) * 180) / Math.PI
  );

  return { ascendenteLon, mcLon };
}

function paraAngulo(longitude: number): Angulo {
  const { signo, grauNoSigno } = grausParaSigno(longitude);
  return {
    signo: signo.nome,
    simboloSigno: signo.simbolo,
    grauNoSigno,
    grauFormatado: formatarGrau(grauNoSigno),
    longitude,
  };
}

function calcularAspectos(planetas: PosicaoPlaneta[]): Aspecto[] {
  const aspectos: Aspecto[] = [];
  for (let i = 0; i < planetas.length; i++) {
    for (let j = i + 1; j < planetas.length; j++) {
      const a = planetas[i];
      const b = planetas[j];
      let diff = Math.abs(a.longitude - b.longitude) % 360;
      if (diff > 180) diff = 360 - diff;

      for (const def of ASPECTOS_DEF) {
        const orbeReal = Math.abs(diff - def.angulo);
        if (orbeReal <= def.orbe) {
          aspectos.push({
            entre: [a.nome, b.nome],
            tipo: def.tipo,
            anguloExato: Number(diff.toFixed(2)),
            orbe: Number(orbeReal.toFixed(2)),
          });
          break;
        }
      }
    }
  }
  return aspectos;
}

export function calcularMapaAstral(dados: DadosNascimento): MapaAstral {
  const time = Astronomy.MakeTime(dados.dataHoraUtc);

  const { ascendenteLon, mcLon } = calcularAscendenteMeioDoCeu(
    time,
    dados.latitude,
    dados.longitude
  );

  const ascendente = paraAngulo(ascendenteLon);
  const meioDoCeu = paraAngulo(mcLon);
  const ascendenteSignoIndex = SIGNOS.findIndex((s) => s.nome === ascendente.signo);

  const casas: CasaWholeSign[] = Array.from({ length: 12 }, (_, i) => {
    const signoIndex = (ascendenteSignoIndex + i) % 12;
    return {
      numero: i + 1,
      signo: SIGNOS[signoIndex].nome,
      simboloSigno: SIGNOS[signoIndex].simbolo,
    };
  });

  const planetas: PosicaoPlaneta[] = CORPOS.map(({ corpo, nome }) => {
    const longitude = longitudeGeocentrica(corpo, time);
    const { signo, signoIndex, grauNoSigno } = grausParaSigno(longitude);
    const casa = ((signoIndex - ascendenteSignoIndex + 12) % 12) + 1;

    return {
      corpo: corpo.toString(),
      nome,
      simboloSigno: signo.simbolo,
      signo: signo.nome,
      grauNoSigno,
      grauFormatado: formatarGrau(grauNoSigno),
      longitude,
      casa,
      retrogrado: nome === "Sol" || nome === "Lua" ? false : estaRetrogrado(corpo, time),
    };
  });

  return {
    planetas,
    ascendente,
    meioDoCeu,
    casas,
    aspectos: calcularAspectos(planetas),
  };
}
