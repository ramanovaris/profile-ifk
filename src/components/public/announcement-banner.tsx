import { Megaphone, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSetting } from "@prisma/client";

interface AnnouncementBannerProps {
  settings?: SiteSetting | null;
}

export function AnnouncementBanner({ settings }: AnnouncementBannerProps) {
  if (!settings?.announcementEnabled || !settings?.announcementText?.trim()) {
    return null;
  }

  const type = settings.announcementType || "info";

  return (
    <div
      className={cn(
        "w-full border-b px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-xl",
        type === "important"
          ? "border-rose-500/25 bg-rose-950/85 text-rose-200"
          : type === "warning"
          ? "border-amber-500/25 bg-amber-950/85 text-amber-200"
          : "border-sky-500/25 bg-sky-950/85 text-sky-200"
      )}
    >
      <div className="section-container flex items-center justify-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            type === "important"
              ? "bg-rose-500/30 text-rose-300"
              : type === "warning"
              ? "bg-amber-500/30 text-amber-300"
              : "bg-sky-500/30 text-sky-300"
          )}
        >
          {type === "important" ? (
            <AlertTriangle className="h-3 w-3" />
          ) : type === "warning" ? (
            <Megaphone className="h-3 w-3" />
          ) : (
            <Info className="h-3 w-3" />
          )}
          {type === "important"
            ? "Penting"
            : type === "warning"
            ? "Peringatan"
            : "Info"}
        </span>
        <span className="truncate">{settings.announcementText}</span>
      </div>
    </div>
  );
}
