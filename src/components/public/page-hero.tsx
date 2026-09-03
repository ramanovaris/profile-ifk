import { Breadcrumb } from "@/components/public/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  breadcrumb: { label: string; href?: string }[];
  eyebrow: string;
  /** Bisa string biasa atau JSX (untuk span italic). */
  title: React.ReactNode;
  subtitle: string;
  className?: string;
}

/**
 * Hero shared untuk halaman non-Beranda.
 * Latar mesh + grid halus, hairline vertikal tengah sebagai pemisah visual.
 */
export function PageHero({
  breadcrumb,
  eyebrow,
  title,
  subtitle,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("page-hero relative overflow-hidden text-white", className)}>
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0" />
      {/* Hairline vertikal pemisah zona — hanya di desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 bottom-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block"
      />
      <div className="section-container relative z-10 py-24">
        <div className="max-w-2xl">
          <Breadcrumb items={breadcrumb} variant="dark" />
          <span className="eyebrow mt-6 border border-white/10 bg-white/5 text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden />
            {eyebrow}
          </span>
          <h1 className="mt-4 text-5xl font-bold tracking-tighter sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-zinc-400">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
