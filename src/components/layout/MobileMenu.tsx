"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

export function MobileMenu({
  navLinks,
  isLoggedIn,
  onSignOut,
}: {
  navLinks: NavLink[];
  isLoggedIn: boolean;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition hover:text-foreground"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open &&
        mounted &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-background/80 backdrop-blur-sm"
            />
            <div className="fixed inset-x-4 top-[4.5rem] z-50 rounded-2xl border border-border bg-surface-2 p-3 shadow-xl">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-1 border-t border-border/60" />
                {isLoggedIn ? (
                  <form action={onSignOut}>
                    <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-foreground/80 transition hover:bg-surface">
                      Sair
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-surface"
                  >
                    Entrar
                  </Link>
                )}
              </nav>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
