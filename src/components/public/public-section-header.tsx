import type { ReactNode } from "react";
import { Reveal } from "@/components/public/reveal";

export interface PublicSectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  className?: string;
  delay?: number;
}

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  className = "",
  delay = 0,
}: PublicSectionHeaderProps) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="flex flex-col gap-3 pb-8 sm:flex-row sm:items-end sm:justify-between sm:border-b sm:border-border sm:pb-10">
        <div>
          <span className="eyebrow bg-brand-50 text-brand-700">{eyebrow}</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
            {title}
          </h2>
        </div>
        <p className="max-w-[48ch] text-xs sm:text-sm leading-relaxed text-zinc-600">
          {description}
        </p>
      </div>
    </Reveal>
  );
}
