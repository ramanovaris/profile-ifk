import { AlertTriangle } from "lucide-react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface AdminDeleteDialogHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function AdminDeleteDialogHeader({
  title,
  description,
  className = "",
}: AdminDeleteDialogHeaderProps) {
  return (
    <DialogHeader className={`space-y-3 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <DialogTitle className="text-lg font-bold text-[var(--admin-text-main)] tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--admin-muted)] mt-0.5">
            {description}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
