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
  Globe,
  ExternalLink,
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
import { getAdminSupportWhatsAppAction } from "@/actions/setting";
import { siteConfig } from "@/lib/dummy-data";
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
          ? "bg-[#455a26] text-white shadow-xs font-semibold"
          : "text-[var(--admin-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active
            ? "text-white"
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
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--admin-muted)] transition-all duration-200 hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
        >
          <Globe className="h-4 w-4 text-[var(--admin-muted)] group-hover:text-[var(--admin-text-main)] transition-colors shrink-0" />
          <span className="flex-1">Lihat Website</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>
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
  whatsappLink?: string;
};

function formatWhatsAppSupportUrl(rawUrl?: string): string {
  const base = (rawUrl || siteConfig.whatsappLink || "https://wa.me/6281234567890").trim();
  const defaultText =
    "Halo Tim Bantuan IFK Kotabaru, saya memerlukan bantuan teknis operasional panel admin.";

  if (!base) {
    return `https://wa.me/6281234567890?text=${encodeURIComponent(defaultText)}`;
  }

  if (base.includes("text=")) {
    return base;
  }

  if (/^\+?\d+$/.test(base)) {
    const cleanNumber = base.replace(/^\+/, "");
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultText)}`;
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}text=${encodeURIComponent(defaultText)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// Module-level persistent cache across route navigations
let activeClientTheme: ThemeSetting | null = null;
let activeSystemIsDark: boolean | null = null;

function getInitialAdminTheme(): ThemeSetting {
  if (activeClientTheme) return activeClientTheme;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("admin-theme") as ThemeSetting | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        activeClientTheme = stored;
        return stored;
      }
    } catch {
      // ignore
    }
  }
  return "light";
}

function getInitialSystemDark(): boolean {
  if (activeSystemIsDark !== null) return activeSystemIsDark;
  if (typeof window !== "undefined") {
    try {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      activeSystemIsDark = isDark;
      return isDark;
    } catch {
      // ignore
    }
  }
  return false;
}

export function AdminShell({ children, currentUser, whatsappLink }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [fetchedUser, setFetchedUser] = useState<AuthUserInfo | null>(null);
  const [asyncSupportUrl, setAsyncSupportUrl] = useState<string | null>(null);

  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(getInitialAdminTheme);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(getInitialSystemDark);

  useEffect(() => {
    if (whatsappLink) return;
    let mounted = true;
    getAdminSupportWhatsAppAction()
      .then((link) => {
        if (mounted && link) setAsyncSupportUrl(formatWhatsAppSupportUrl(link));
      })
      .catch(() => {
        // Fallback default
      });
    return () => {
      mounted = false;
    };
  }, [whatsappLink]);

  const supportWhatsAppUrl = whatsappLink
    ? formatWhatsAppSupportUrl(whatsappLink)
    : asyncSupportUrl || formatWhatsAppSupportUrl(siteConfig.whatsappLink);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = (e: MediaQueryListEvent) => {
      activeSystemIsDark = e.matches;
      setSystemIsDark(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const handleThemeChange = (newTheme: ThemeSetting) => {
    activeClientTheme = newTheme;
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
      suppressHydrationWarning
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
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center gap-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] shadow-xs transition-all hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              title="Lihat Website Publik (Buka di tab baru)"
              aria-label="Lihat Website Publik"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline text-xs sm:text-sm font-medium">Lihat Website</span>
              <ExternalLink className="hidden sm:inline h-3 w-3 shrink-0 opacity-60" />
            </Link>

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

        {/* Main scrollable content area with footer */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <div className="mx-auto max-w-7xl w-full min-w-0">{children}</div>
          </div>

          {/* Admin Footer */}
          <footer className="mt-auto border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 sm:px-6 transition-colors duration-200">
            <div className="mx-auto flex max-w-7xl w-full flex-col items-center justify-between gap-3 text-xs text-[var(--admin-muted)] sm:flex-row sm:gap-4">
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-center sm:justify-start sm:text-left">
                <span>&copy; {new Date().getFullYear()} UPTD Instalasi Farmasi Kabupaten Kotabaru.</span>
                <span className="hidden sm:inline">&bull;</span>
                <span>Panel Pengelola Sistem Informasi</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={supportWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text-main)] shadow-2xs transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  title="Hubungi Bantuan Teknis via WhatsApp (Buka di tab baru)"
                  aria-label="Hubungi Bantuan Teknis via WhatsApp"
                >
                  <WhatsAppIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110" />
                  <span>Bantuan Teknis WhatsApp</span>
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
