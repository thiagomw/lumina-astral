"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resposta = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.error ?? "Não foi possível criar sua conta.");
      setCarregando(false);
      return;
    }

    const resultado = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setCarregando(false);

    if (resultado?.error) {
      setErro("Conta criada, mas houve um erro ao entrar. Tente fazer login.");
      router.push("/login");
      return;
    }

    router.push("/dashboard/mapa/novo");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm text-foreground/70">Nome</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent"
          placeholder="Como podemos te chamar?"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-foreground/70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent"
          placeholder="voce@email.com"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-foreground/70">Senha</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm outline-none focus:border-accent"
          placeholder="mínimo 8 caracteres"
        />
      </div>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <Button type="submit" disabled={carregando} className="w-full">
        {carregando ? "Criando conta..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
