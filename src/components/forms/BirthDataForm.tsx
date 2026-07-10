"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FUSOS_HORARIOS } from "@/lib/fusos";
import { MapPin, Loader2 } from "lucide-react";

interface ResultadoCidade {
  nome: string;
  latitude: number;
  longitude: number;
}

export function BirthDataForm() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [horaNascimento, setHoraNascimento] = useState("12:00");
  const [fusoMinutos, setFusoMinutos] = useState(-180);

  const [buscaCidade, setBuscaCidade] = useState("");
  const [resultados, setResultados] = useState<ResultadoCidade[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<ResultadoCidade | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (cidadeSelecionada || buscaCidade.trim().length < 3) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      try {
        const resposta = await fetch(`/api/geocode?q=${encodeURIComponent(buscaCidade)}`);
        const dados = await resposta.json();
        setResultados(dados.resultados ?? []);
      } finally {
        setBuscando(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [buscaCidade, cidadeSelecionada]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!cidadeSelecionada) {
      setErro("Selecione a cidade de nascimento na lista de sugestões.");
      return;
    }
    if (!dataNascimento) {
      setErro("Informe a data de nascimento.");
      return;
    }

    setCarregando(true);

    const resposta = await fetch("/api/perfil-natal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome || "Meu mapa",
        dataNascimento,
        horaNascimento,
        fusoMinutos,
        cidade: cidadeSelecionada.nome,
        latitude: cidadeSelecionada.latitude,
        longitude: cidadeSelecionada.longitude,
      }),
    });

    const dados = await resposta.json();
    setCarregando(false);

    if (!resposta.ok) {
      setErro(dados.error ?? "Não foi possível calcular seu mapa astral.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm text-foreground/70">
          Nome do mapa (opcional)
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Meu mapa, Mapa da Maria..."
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm text-foreground/70">
            Data de nascimento
          </label>
          <input
            type="date"
            required
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-foreground/70">
            Hora de nascimento
          </label>
          <input
            type="time"
            required
            value={horaNascimento}
            onChange={(e) => setHoraNascimento(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent [color-scheme:dark]"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-foreground/70">Fuso horário no nascimento</label>
        <select
          value={fusoMinutos}
          onChange={(e) => setFusoMinutos(Number(e.target.value))}
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent [color-scheme:dark]"
        >
          {FUSOS_HORARIOS.map((fuso) => (
            <option key={fuso.valor} value={fuso.valor}>
              {fuso.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-foreground/40">
          Não sabe? Se você nasceu no Brasil (fora do Amazonas/Acre), o padrão já está certo.
        </p>
      </div>

      <div className="relative">
        <label className="mb-1.5 block text-sm text-foreground/70">
          Cidade de nascimento
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            required
            value={cidadeSelecionada ? cidadeSelecionada.nome : buscaCidade}
            onChange={(e) => {
              const valor = e.target.value;
              setCidadeSelecionada(null);
              setBuscaCidade(valor);
              if (valor.trim().length < 3) {
                setResultados([]);
              }
            }}
            placeholder="Digite a cidade..."
            className="w-full rounded-xl border border-border bg-surface/60 py-3 pl-10 pr-4 text-sm outline-none focus:border-accent"
          />
          {buscando && (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-foreground/40" />
          )}
        </div>

        {resultados.length > 0 && (
          <ul className="glass-card absolute z-10 mt-1 w-full overflow-hidden rounded-xl">
            {resultados.map((resultado) => (
              <li key={`${resultado.latitude}-${resultado.longitude}`}>
                <button
                  type="button"
                  onClick={() => {
                    setCidadeSelecionada(resultado);
                    setResultados([]);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-2 transition"
                >
                  {resultado.nome}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <Button type="submit" disabled={carregando} className="w-full">
        {carregando ? "Consultando os astros..." : "Gerar meu mapa astral"}
      </Button>
    </form>
  );
}
