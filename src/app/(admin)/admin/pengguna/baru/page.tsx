"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPenggunaBaruRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/pengguna");
  }, [router]);

  return (
    <AdminShell>
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
        <p className="text-xs text-zinc-400">
          Mengalihkan ke formulir pengguna...
        </p>
      </div>
    </AdminShell>
  );
}
