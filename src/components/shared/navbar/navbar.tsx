"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogIn } from "lucide-react";

import { UserMenu } from "@/features/auth/components/user-menu";
import { useSession } from "@/features/auth/hooks/use-session";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ClubLogo } from "@/components/shared/club-logo";
import { LoginDialog } from "@/features/auth/components/login-dialog";
import { cn } from "@/lib/utils";
import {
  DISCIPLINAS_HREF,
  hasChildren,
  NAV_ENTRIES,
  type NavEntry,
  type NavItem,
} from "./nav-config";
import { MobileNav } from "./mobile-nav";
import { SponsorsBar } from "./sponsors-bar";

const linkStyles =
  "rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none";

/**
 * Cuelga las disciplinas de su entrada del menú.
 * Si la lista viene vacía (API caída), "Disciplinas" queda como un enlace
 * común en vez de un desplegable sin nada adentro.
 */
export function armarEntradas(disciplinas: NavItem[]): NavEntry[] {
  return NAV_ENTRIES.map((entrada) =>
    entrada.href === DISCIPLINAS_HREF && disciplinas.length > 0
      ? { ...entrada, children: disciplinas }
      : entrada,
  );
}

export function Navbar({ disciplinas = [] }: { disciplinas?: NavItem[] }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();

  const entradas = armarEntradas(disciplinas);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-black">
        <SponsorsBar />

        <div className="border-b border-white/10">
          <div className="container mx-auto flex h-16 items-center gap-4 px-4">
            <Link
              href="/"
              aria-label="Club Deportivo Independencia, ir al inicio"
              className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-brand-red-soft focus-visible:outline-none"
            >
              <ClubLogo className="h-10" />
              <span className="hidden font-heading text-sm leading-tight font-bold text-white lg:block">
                Club Deportivo
                <br />
                Independencia
              </span>
            </Link>

            <nav
              aria-label="Navegación principal"
              className="mx-auto hidden items-center gap-1 md:flex"
            >
              {entradas.map((entry) => {
                if (!hasChildren(entry)) {
                  return (
                    <Link
                      key={entry.href}
                      href={entry.href}
                      aria-current={isActive(entry.href) ? "page" : undefined}
                      className={cn(linkStyles, isActive(entry.href) && "bg-white/10 text-white")}
                    >
                      {entry.label}
                    </Link>
                  );
                }

                // También activa en el índice (/disciplinas), no solo en sus hijas.
                const sectionActive =
                  isActive(entry.href) || entry.children.some((child) => isActive(child.href));

                return (
                  <DropdownMenu key={entry.label}>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className={cn(
                            linkStyles,
                            "group flex items-center gap-1 aria-expanded:bg-white/10 aria-expanded:text-white",
                            sectionActive && "bg-white/10 text-white",
                          )}
                        >
                          {entry.label}
                          <ChevronDown
                            className="size-4 transition-transform group-aria-expanded:rotate-180"
                            aria-hidden
                          />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="center" className="w-60">
                      {entry.children.map((child) => (
                        <DropdownMenuItem
                          key={child.href}
                          render={
                            <Link href={child.href} className="flex-col items-start gap-0.5">
                              <span className="font-medium">{child.label}</span>
                              {child.description && (
                                <span className="text-xs text-muted-foreground">
                                  {child.description}
                                </span>
                              )}
                            </Link>
                          }
                        />
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Button
                  size="lg"
                  className="hidden h-10 px-5 md:inline-flex"
                  onClick={() => setLoginOpen(true)}
                >
                  <LogIn className="size-4" aria-hidden />
                  Iniciar sesión
                </Button>
              )}

              <MobileNav
                entradas={entradas}
                onLoginClick={() => setLoginOpen(true)}
                isActive={isActive}
              />
            </div>
          </div>
        </div>
      </header>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
