import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default async function AdminPenggunaBaruRedirectPage() {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  redirect("/admin/pengguna");
}
