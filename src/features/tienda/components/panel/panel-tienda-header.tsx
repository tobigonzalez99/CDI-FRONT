"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { ClubLogo } from "@/components/shared/club-logo";
import { UserMenu } from "@/features/auth/components/user-menu";
import { useSession } from "@/features/auth/hooks/use-session";

export function PanelTiendaHeader() {
  const { user } = useSession();

  return (
    <header className="bg-brand-black text-white">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link href="/tienda/panel" className="flex items-center gap-2.5">
          <ClubLogo className="h-9" />
          <span className="font-heading leading-none">
            <span className="block text-[11px] tracking-[0.2em] text-white/60 uppercase">Panel</span>
            <span className="block font-bold">Tienda CDI</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/tienda"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white sm:flex"
          >
            Ver la tienda
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          {user && <UserMenu user={user} enLaTienda />}
        </div>
      </div>
    </header>
  );
}
