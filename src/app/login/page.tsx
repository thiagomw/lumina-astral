import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      titulo="Bem-vinda(o) de volta"
      subtitulo="Entre para acessar seu mapa astral."
      rodape={{
        texto: "Ainda não tem conta?",
        linkTexto: "Criar conta grátis",
        linkHref: "/cadastro",
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
