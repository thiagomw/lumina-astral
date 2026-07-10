export type Elemento = "Fogo" | "Terra" | "Ar" | "Água";

export interface SignoInfo {
  nome: string;
  simbolo: string;
  elemento: Elemento;
}

export const SIGNOS: SignoInfo[] = [
  { nome: "Áries", simbolo: "♈", elemento: "Fogo" },
  { nome: "Touro", simbolo: "♉", elemento: "Terra" },
  { nome: "Gêmeos", simbolo: "♊", elemento: "Ar" },
  { nome: "Câncer", simbolo: "♋", elemento: "Água" },
  { nome: "Leão", simbolo: "♌", elemento: "Fogo" },
  { nome: "Virgem", simbolo: "♍", elemento: "Terra" },
  { nome: "Libra", simbolo: "♎", elemento: "Ar" },
  { nome: "Escorpião", simbolo: "♏", elemento: "Água" },
  { nome: "Sagitário", simbolo: "♐", elemento: "Fogo" },
  { nome: "Capricórnio", simbolo: "♑", elemento: "Terra" },
  { nome: "Aquário", simbolo: "♒", elemento: "Ar" },
  { nome: "Peixes", simbolo: "♓", elemento: "Água" },
];

export function grausParaSigno(longitude: number): {
  signo: SignoInfo;
  signoIndex: number;
  grauNoSigno: number;
} {
  const lon = ((longitude % 360) + 360) % 360;
  const signoIndex = Math.floor(lon / 30);
  const grauNoSigno = lon - signoIndex * 30;
  return { signo: SIGNOS[signoIndex], signoIndex, grauNoSigno };
}

export function formatarGrau(grauNoSigno: number): string {
  const graus = Math.floor(grauNoSigno);
  const minutos = Math.round((grauNoSigno - graus) * 60);
  return `${graus}°${minutos.toString().padStart(2, "0")}'`;
}
