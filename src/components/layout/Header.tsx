import Link from "next/link";
import { auth, signOut } from "@/auth";
import { ButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "@/components/layout/MobileMenu";

const navLinks = [
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/planos", label: "Planos" },
];

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

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

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <ButtonLink href="/dashboard" variant="secondary" className="!px-4 !py-2 text-xs">
                Meu mapa
              </ButtonLink>
              <form action={handleSignOut}>
                <button className="text-xs text-foreground/60 hover:text-foreground transition">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                Entrar
              </Link>
              <ButtonLink href="/cadastro" className="!px-4 !py-2 text-xs">
                Criar conta grátis
              </ButtonLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ButtonLink
            href={isLoggedIn ? "/dashboard" : "/cadastro"}
            className="!px-4 !py-2 text-xs"
          >
            {isLoggedIn ? "Meu mapa" : "Criar conta"}
          </ButtonLink>
          <MobileMenu navLinks={navLinks} isLoggedIn={isLoggedIn} onSignOut={handleSignOut} />
        </div>
      </div>
    </header>
  );
}
