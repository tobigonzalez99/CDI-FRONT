"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogIn, Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ClubLogo } from "@/components/shared/club-logo";
import { cn } from "@/lib/utils";
import { hasChildren, type NavEntry } from "./nav-config";

interface MobileNavProps {
  /** Mismo árbol que el menú de escritorio, ya con las disciplinas colgadas. */
  entradas: NavEntry[];
  onLoginClick: () => void;
  isActive: (href: string) => boolean;
}

export function MobileNav({ entradas, onLoginClick, isActive }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const submenuId = useId();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Abrir menú de navegación"
            className="text-white hover:bg-white/10 hover:text-white md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
        }
      />

      <SheetContent side="right" className="w-[min(20rem,85vw)] bg-brand-black p-0 text-white">
        <SheetHeader className="border-b border-white/10">
          <SheetTitle className="flex items-center gap-2 pr-8 text-white">
            <ClubLogo className="h-8" />
            <span className="font-heading text-sm">Club Deportivo Independencia</span>
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Navegación principal" className="flex flex-col gap-1 p-4">
          {entradas.map((entry) => {
            if (!hasChildren(entry)) {
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(entry.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-white/10",
                    isActive(entry.href) && "bg-white/10 text-brand-red-soft",
                  )}
                >
                  {entry.label}
                </Link>
              );
            }

            const isExpanded = expanded === entry.label;

            return (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : entry.label)}
                  aria-expanded={isExpanded}
                  aria-controls={`${submenuId}-${entry.label}`}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-white/10"
                >
                  {entry.label}
                  <ChevronDown
                    className={cn("size-4 transition-transform", isExpanded && "rotate-180")}
                    aria-hidden
                  />
                </button>

                {isExpanded && (
                  <div
                    id={`${submenuId}-${entry.label}`}
                    className="mt-1 ml-3 flex flex-col gap-0.5 border-l border-white/15 pl-3"
                  >
                    {entry.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(child.href) ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white",
                          isActive(child.href) && "text-brand-red-soft",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Button
            size="lg"
            className="mt-4 h-11 w-full"
            onClick={() => {
              setOpen(false);
              onLoginClick();
            }}
          >
            <LogIn className="size-4" aria-hidden />
            Iniciar sesión
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
