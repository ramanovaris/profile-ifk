import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({
  items,
  variant = "default",
}: {
  items: BreadcrumbItem[];
  variant?: "default" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <nav
      aria-label="breadcrumb"
      className={
        isDark
          ? "mb-6 flex items-center gap-1.5 text-sm text-zinc-400"
          : "mb-6 flex items-center gap-1.5 text-sm text-muted"
      }
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight
              className={isDark ? "h-3 w-3 text-zinc-400" : "h-3 w-3 text-muted"}
            />
          )}
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className={isDark ? "text-zinc-300 hover:text-white" : "hover:text-brand-600"}
            >
              {item.label}
            </Link>
          ) : (
            <span className={isDark ? "font-medium text-white" : "text-heading"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
