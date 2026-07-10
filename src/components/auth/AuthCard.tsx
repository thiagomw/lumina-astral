import Link from "next/link";
import { ReactNode } from "react";

export function AuthCard({
  titulo,
  subtitulo,
  children,
  rodape,
}: {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  rodape: { texto: string; linkTexto: string; linkHref: string };
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold">
            <span className="text-gradient">✦ Lumina Astral</span>
          </Link>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h1 className="font-display text-2xl font-bold">{titulo}</h1>
          <p className="mt-1 text-sm text-foreground/60">{subtitulo}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-6 text-center text-sm text-foreground/60">
            {rodape.texto}{" "}
            <Link href={rodape.linkHref} className="text-accent-2 hover:underline">
              {rodape.linkTexto}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
