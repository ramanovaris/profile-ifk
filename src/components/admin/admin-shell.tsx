"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  UserCog,
  Settings,
  LogOut,
  Menu,
  Tags,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, getAssetUrl } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { logoutAction, getCurrentUserAction, type AuthUserInfo } from "@/actions/auth";
import { ThemeDropdown, type ThemeSetting } from "@/components/admin/theme-dropdown";
import type { Role } from "@prisma/client";

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
};

const sidebarLinks: SidebarItem[] = [
  { href: "/admin/dashboard/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/berita/", label: "Berita", icon: Newspaper },
  { href: "/admin/kategori/", label: "Kategori", icon: Tags },
  { href: "/admin/stok/", label: "Stok Obat", icon: Package },
  { href: "/admin/pengguna/", label: "Pengguna", icon: Users, superAdminOnly: true },
  { href: "/admin/profil/", label: "Profil", icon: UserCog },
  { href: "/admin/pengaturan/", label: "Pengaturan", icon: Settings },
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
          ? "border border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-xs shadow-brand-500/10 font-semibold"
          : "text-[var(--admin-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active
            ? "text-brand-600 dark:text-brand-400"
            : "text-[var(--admin-muted)] group-hover:text-[var(--admin-text-main)]"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({
  pathname,
  user,
}: {
  pathname: string;
  user: AuthUserInfo | null;
}) {
  const visibleLinks = sidebarLinks.filter(
    (link) => !link.superAdminOnly || user?.role === "SUPER_ADMIN"
  );

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
            className="h-8 w-8 rounded-full ring-1 ring-[var(--admin-border)]"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-[var(--admin-text-main)]">
            Admin IFK
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-muted)]">
            Kotabaru
          </span>
        </div>
      </div>

      <Separator className="bg-[var(--admin-border)]" />

      {/* Navigation */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {visibleLinks.map((link) => (
          <SidebarLink
            key={link.href}
            {...link}
            active={pathname.startsWith(link.href)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 pb-4">
        <Separator className="mb-4 bg-[var(--admin-border)]" />
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-[var(--admin-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar Sesi
          </Button>
        </form>
      </div>
    </div>
  );
}

export type AdminShellProps = {
  children: React.ReactNode;
  currentUser?: {
    id?: string;
    name: string;
    username: string;
    role: Role;
    email?: string | null;
    avatar?: string | null;
  };
};

export function AdminShell({ children, currentUser }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<AuthUserInfo | null>(null);

  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("admin-theme") as ThemeSetting | null;
        if (stored === "light" || stored === "dark" || stored === "system") {
          return stored;
        }
      } catch {
        // ignore
      }
    }
    return "light";
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleThemeChange = (newTheme: ThemeSetting) => {
    setThemeSetting(newTheme);
    try {
      localStorage.setItem("admin-theme", newTheme);
    } catch {
      // ignore
    }
  };

  const resolvedTheme: "light" | "dark" =
    themeSetting === "system"
      ? systemIsDark
        ? "dark"
        : "light"
      : themeSetting;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-admin-theme", resolvedTheme);
    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, [resolvedTheme]);

  const user: AuthUserInfo | null = currentUser
    ? {
        id: currentUser.id || "",
        name: currentUser.name,
        username: currentUser.username,
        role: currentUser.role,
        email: currentUser.email,
        avatar: currentUser.avatar,
      }
    : fetchedUser;

  useEffect(() => {
    if (!currentUser) {
      getCurrentUserAction().then((u) => {
        if (u) setFetchedUser(u);
      });
    }
  }, [currentUser]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const displayName = user?.name || (user?.username ? `@${user.username}` : "Admin");
  const initials = user?.name ? getInitials(user.name) : "AD";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div
      data-admin-theme={resolvedTheme}
      className="admin-root relative flex h-dvh min-h-dvh overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text-main)] selection:bg-brand-500/30 transition-colors duration-200"
    >
      {/* Subtle Ambient Background Mesh Glows */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full blur-3xl opacity-70 transition-opacity"
        style={{ background: "var(--admin-ambient-glow-1)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full blur-3xl opacity-70 transition-opacity"
        style={{ background: "var(--admin-ambient-glow-2)" }}
        aria-hidden="true"
      />

      {/* Desktop sidebar */}
      <aside className="relative z-10 hidden w-64 shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-sidebar-bg)] backdrop-blur-xl md:flex md:flex-col transition-colors duration-200">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-header-bg)] px-4 backdrop-blur-xl sm:px-6 transition-colors duration-200">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] md:hidden transition-colors"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-r border-[var(--admin-border)] bg-[var(--admin-sheet-bg)] p-0 text-[var(--admin-text-main)] backdrop-blur-2xl"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
              </SheetHeader>
              <SidebarContent pathname={pathname} user={user} />
            </SheetContent>
          </Sheet>

          {/* Right Header Admin Info */}
          <div className="ml-auto flex items-center gap-3">
            <ThemeDropdown
              themeSetting={themeSetting}
              onThemeChange={handleThemeChange}
            />

            {user && (
              <span
                className={cn(
                  "hidden items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium sm:inline-flex",
                  isSuperAdmin
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                )}
              >
                {isSuperAdmin ? "Super Admin" : "Staff"}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--admin-text-main)] max-w-[150px] truncate sm:max-w-xs">
                {displayName}
              </span>
              <Avatar className="h-8 w-8 ring-1 ring-brand-500/30">
                {user?.avatar ? (
                  <AvatarImage src={getAssetUrl(user.avatar)} alt={displayName} />
                ) : null}
                <AvatarFallback className="bg-brand-500/20 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
