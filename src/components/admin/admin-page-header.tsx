import type { ReactNode } from "react";

export interface AdminPageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  action,
  className = "",
}: AdminPageHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text-main)] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          {description}
        </p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
