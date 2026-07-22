import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Criar conta grátis",
  robots: { index: false, follow: true },
};

export default function CadastroPage() {
  return (
    <AuthCard
      titulo="Crie sua conta"
      subtitulo="Grátis para começar. Leva menos de 1 minuto."
      rodape={{
        texto: "Já tem conta?",
        linkTexto: "Entrar",
        linkHref: "/login",
      }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
