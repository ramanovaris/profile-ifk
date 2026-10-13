import { ExternalLink } from "lucide-react";

export interface PublicModalActionFooterProps {
  externalHref: string;
  onClose: () => void;
  externalLabel?: string;
  closeLabel?: string;
  className?: string;
}

export function PublicModalActionFooter({
  externalHref,
  onClose,
  externalLabel = "Buka Penuh",
  closeLabel = "Tutup",
  className = "",
}: PublicModalActionFooterProps) {
  return (
    <div className={`shrink-0 border-t border-border bg-surface/50 p-4 sm:px-6 ${className}`.trim()}>
      <div className="grid grid-cols-2 gap-3">
        <a
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 active:scale-[0.98]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>{externalLabel}</span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-semibold text-heading shadow-xs transition-colors hover:bg-surface active:scale-[0.98] cursor-pointer"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
