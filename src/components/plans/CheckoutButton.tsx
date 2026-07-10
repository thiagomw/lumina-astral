"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PlanoId } from "@/lib/planos";

export function CheckoutButton({ planoId, label }: { planoId: PlanoId; label: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleClick() {
    setErro(null);
    setCarregando(true);

    const resposta = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planoId }),
    });

    const dados = await resposta.json();
    setCarregando(false);

    if (!resposta.ok) {
      setErro(dados.error ?? "Não foi possível iniciar o checkout.");
      return;
    }

    window.location.href = dados.url;
  }

  return (
    <div className="w-full">
      <Button onClick={handleClick} disabled={carregando} className="w-full">
        {carregando ? "Redirecionando..." : label}
      </Button>
      {erro && <p className="mt-2 text-center text-xs text-red-400">{erro}</p>}
    </div>
  );
}
