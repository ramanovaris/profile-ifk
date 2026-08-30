"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  UserCog,
  LogOut,
  Menu,
  Pill,
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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center gap-2 px-3 py-4">
        <Pill className="h-5 w-5 text-blue-700" />
        <span className="text-sm font-bold text-slate-900">Admin IFK</span>
      </div>
      <Separator />
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {sidebarLinks.map((link) => (
          <SidebarLink
            key={link.href}
            {...link}
            active={pathname.startsWith(link.href)}
          />
        ))}
      </nav>
      <div className="mt-auto px-2 pb-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600"
          onClick={() => router.push("/")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-white md:flex md:flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
              </SheetHeader>
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          <div className="md:hidden" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Admin</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-xs text-blue-700">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
