import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-heading">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
