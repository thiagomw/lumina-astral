import Link from "next/link";
import { auth, signOut } from "@/auth";
import { ButtonLink } from "@/components/ui/Button";

const navLinks = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/planos", label: "Planos" },
];

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-wide">
          <span className="text-gradient">✦ Lumina Astral</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary" className="!px-4 !py-2 text-xs">
                Meu mapa
              </ButtonLink>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="text-xs text-foreground/60 hover:text-foreground transition">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm text-foreground/70 hover:text-foreground sm:block"
              >
                Entrar
              </Link>
              <ButtonLink href="/cadastro" className="!px-4 !py-2 text-xs">
                Criar conta grátis
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
