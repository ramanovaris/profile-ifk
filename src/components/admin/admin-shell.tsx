"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  UserCog,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/berita", label: "Berita", icon: Newspaper },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/profil", label: "Profil", icon: UserCog },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border border-brand-500/20 bg-brand-500/10 text-brand-400 shadow-sm shadow-brand-500/10"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-brand-400" : "text-zinc-400 group-hover:text-zinc-200"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  const router = useRouter();
  return (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="relative">
          <Image
            src="/images/logo-ifk.jpg"
            alt="Logo IFK Kotabaru"
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded-full ring-1 ring-white/15"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-white">Admin IFK</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Kotabaru
          </span>
        </div>
      </div>

      <Separator className="bg-white/5" />

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {sidebarLinks.map((link) => (
          <SidebarLink
            key={link.href}
            {...link}
            active={pathname.startsWith(link.href)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 pb-4">
        <Separator className="mb-4 bg-white/5" />
        <Button
          variant="ghost"
          className="w-full justify-start text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          onClick={() => router.push("/")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar ke Web
        </Button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex h-dvh min-h-dvh overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-brand-500/30">
      {/* Subtle Ambient Background Mesh Glows */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-white/5 bg-zinc-900/60 backdrop-blur-xl md:flex md:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-900/60 px-4 backdrop-blur-xl sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:bg-white/5 hover:text-white md:hidden transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-r border-white/10 bg-zinc-950/95 p-0 text-white backdrop-blur-2xl"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
              </SheetHeader>
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          <div className="md:hidden" />

          {/* Right Header Admin Info */}
          <div className="flex items-center gap-3">
            <span className="hidden items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 sm:inline-flex">
              Super Admin
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-200">Admin</span>
              <Avatar className="h-8 w-8 ring-1 ring-brand-500/30">
                <AvatarFallback className="bg-brand-500/20 text-xs font-semibold text-brand-300">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
