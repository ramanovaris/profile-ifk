import { getSiteSettings } from "@/actions/setting";
import { Megaphone, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export async function AnnouncementBanner() {
  const settings = await getSiteSettings();

  if (!settings.announcementEnabled || !settings.announcementText) {
    return null;
  }

  const type = settings.announcementType || "info";

  return (
    <div
      className={cn(
        "relative border-b px-4 py-2.5 text-xs font-medium backdrop-blur-xl",
        type === "important"
          ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
          : type === "warning"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
          : "border-sky-500/20 bg-sky-500/10 text-sky-200"
      )}
    >
      <div className="section-container flex items-center justify-center gap-2.5">
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
