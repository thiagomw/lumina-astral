import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center text-sm text-foreground/50 md:flex-row md:justify-between md:text-left">
        <p className="font-display text-foreground/70">✦ Lumina Astral</p>
        <p>Seu mapa, suas estrelas, seu momento. © {new Date().getFullYear()}</p>
        <div className="flex gap-6">
          <Link href="/planos" className="hover:text-foreground/80">
            Planos
          </Link>
          <Link href="/login" className="hover:text-foreground/80">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}
