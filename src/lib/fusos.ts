export interface FusoHorario {
  valor: number; // offset em minutos em relação ao UTC
  label: string;
}

export const FUSOS_HORARIOS: FusoHorario[] = [
  { valor: -180, label: "UTC−03:00 — Brasília, São Paulo, Rio de Janeiro" },
  { valor: -240, label: "UTC−04:00 — Manaus, Amazonas" },
  { valor: -300, label: "UTC−05:00 — Rio Branco, Acre" },
  { valor: -60, label: "UTC−01:00 — Fernando de Noronha" },
  { valor: 0, label: "UTC±00:00 — Londres, Lisboa" },
  { valor: 60, label: "UTC+01:00 — Paris, Berlim, Lisboa (verão)" },
  { valor: 120, label: "UTC+02:00 — Cairo, Joanesburgo" },
  { valor: -120, label: "UTC−02:00" },
  { valor: -330, label: "UTC−05:30 — Índia" },
  { valor: -360, label: "UTC−06:00 — Cidade do México" },
  { valor: -420, label: "UTC−07:00" },
  { valor: -480, label: "UTC−08:00 — Los Angeles" },
  { valor: -540, label: "UTC−09:00" },
  { valor: 180, label: "UTC+03:00 — Moscou" },
  { valor: 210, label: "UTC+03:30 — Irã" },
  { valor: 240, label: "UTC+04:00" },
  { valor: 270, label: "UTC+04:30 — Afeganistão" },
  { valor: 300, label: "UTC+05:00" },
  { valor: 330, label: "UTC+05:30 — Índia, Sri Lanka" },
  { valor: 345, label: "UTC+05:45 — Nepal" },
  { valor: 360, label: "UTC+06:00" },
  { valor: 420, label: "UTC+07:00" },
  { valor: 480, label: "UTC+08:00 — China, Singapura" },
  { valor: 540, label: "UTC+09:00 — Japão, Coreia" },
  { valor: 570, label: "UTC+09:30 — Austrália Central" },
  { valor: 600, label: "UTC+10:00 — Austrália Oriental" },
  { valor: 720, label: "UTC+12:00 — Nova Zelândia" },
];
