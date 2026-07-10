export type PlanoId = "FREE" | "ESSENCIAL" | "MISTICO";

export interface PlanoInfo {
  id: PlanoId;
  nome: string;
  preco: number;
  descricao: string;
  destaque?: boolean;
  recursos: string[];
  stripePriceEnv?: "NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL" | "NEXT_PUBLIC_STRIPE_PRICE_MISTICO";
}

export const PLANOS: PlanoInfo[] = [
  {
    id: "FREE",
    nome: "Grátis",
    preco: 0,
    descricao: "Pra sentir a energia do seu mapa.",
    recursos: ["Sol, Lua e Ascendente", "Signo e grau de cada um", "1 mapa astral salvo"],
  },
  {
    id: "ESSENCIAL",
    nome: "Essencial",
    preco: 19.9,
    descricao: "Pra quem quer ir mais fundo.",
    destaque: true,
    recursos: [
      "Tudo do plano Grátis",
      "Todos os planetas do seu mapa",
      "As 12 casas astrológicas",
      "Retrogradações",
    ],
    stripePriceEnv: "NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL",
  },
  {
    id: "MISTICO",
    nome: "Místico",
    preco: 34.9,
    descricao: "A experiência completa do universo.",
    recursos: [
      "Tudo do plano Essencial",
      "Aspectos entre planetas",
      "Conteúdos místicos exclusivos",
      "Múltiplos mapas salvos",
      "Suporte prioritário",
    ],
    stripePriceEnv: "NEXT_PUBLIC_STRIPE_PRICE_MISTICO",
  },
];

export function planoPorId(id: string | undefined | null): PlanoInfo {
  return PLANOS.find((p) => p.id === id) ?? PLANOS[0];
}

export function nivelDoPlano(id: string | undefined | null): number {
  return PLANOS.findIndex((p) => p.id === id) === -1 ? 0 : PLANOS.findIndex((p) => p.id === id);
}
