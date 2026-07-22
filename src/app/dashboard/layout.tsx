import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Meu mapa astral",
  robots: { index: false, follow: false },
};

const abas = [
  { href: "/dashboard", label: "Meu mapa" },
  { href: "/dashboard/mapa/novo", label: "Novo mapa" },
  { href: "/dashboard/assinatura", label: "Assinatura" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-10 flex justify-center gap-2">
            {abas.map((aba) => (
              <Link
                key={aba.href}
                href={aba.href}
                className="glass-card rounded-full px-4 py-2 text-sm text-foreground/70 transition hover:text-foreground hover:border-accent/50"
              >
                {aba.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
