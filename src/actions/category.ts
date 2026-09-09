"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { slugify } from "../lib/utils";
import type { Category, CategoryStatus } from "@prisma/client";

export type CategoryActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Server Action: Menambahkan kategori artikel baru ke PostgreSQL.
 */
export async function createCategoryAction(data: {
  name: string;
  status?: CategoryStatus;
}): Promise<CategoryActionResult<Category>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return {
      success: false,
      error: "Nama kategori tidak boleh kosong.",
    };
  }

  if (trimmedName.length > 100) {
    return {
      success: false,
      error: "Nama kategori maksimal 100 karakter.",
    };
  }

  try {
    // Cek duplikasi nama secara case-insensitive
    const existing = await db.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Nama kategori sudah ada. Gunakan nama yang berbeda.",
      };
    }

    const slug = slugify(trimmedName);

    // Cek duplikasi slug
    const existingSlug = await db.category.findUnique({
      where: { slug },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const newCategory = await db.category.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
        status: data.status ?? "ACTIVE",
      },
    });

    try {
      revalidatePath("/admin/kategori");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: newCategory,
    };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return {
        success: false,
        error: "Nama atau slug kategori sudah digunakan di sistem.",
      };
    }
    return {
      success: false,
      error: "Gagal menambahkan kategori. Silakan coba lagi.",
    };
  }
}

/**
 * Server Action: Memperbarui nama dan status kategori artikel.
 */
export async function updateCategoryAction(
  id: string,
  data: {
    name: string;
    status: CategoryStatus;
  }
): Promise<CategoryActionResult<Category>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  const trimmedName = data.name?.trim();
  if (!trimmedName) {
    return {
      success: false,
      error: "Nama kategori tidak boleh kosong.",
    };
  }

  try {
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return {
        success: false,
        error: "Kategori tidak ditemukan.",
      };
    }

    // Cek duplikasi nama kategori lain
    const duplicate = await db.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
        NOT: { id },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Nama kategori sudah ada. Gunakan nama yang berbeda.",
      };
    }

    const slug = slugify(trimmedName);

    // Cek slug jika berubah
    let finalSlug = category.slug;
    if (slug !== category.slug) {
      const existingSlug = await db.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        name: trimmedName,
        slug: finalSlug,
        status: data.status,
      },
    });

    try {
      revalidatePath("/admin/kategori");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return {
        success: false,
        error: "Nama atau slug kategori sudah digunakan di sistem.",
      };
    }
    return {
      success: false,
      error: "Gagal memperbarui kategori. Silakan coba lagi.",
    };
  }
}

/**
 * Server Action: Mengubah status aktif/non-aktif kategori secara cepat (toggle).
 */
export async function toggleCategoryStatusAction(
  id: string
): Promise<CategoryActionResult<{ id: string; status: CategoryStatus; name: string }>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  try {
    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      return {
        success: false,
        error: "Kategori tidak ditemukan.",
      };
    }

    const nextStatus: CategoryStatus =
      category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const updated = await db.category.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true, status: true, name: true },
    });

    try {
      revalidatePath("/admin/kategori");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: updated,
    };
  } catch {
    return {
      success: false,
      error: "Gagal memperbarui status kategori.",
    };
  }
}

/**
 * Server Action: Menghapus kategori artikel dari PostgreSQL dengan proteksi relasi artikel.
 */
export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult<{ id: string }>> {
  const auth = await getCurrentSession();
  if (!auth) {
    return {
      success: false,
      error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
    };
  }

  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Kategori tidak ditemukan.",
      };
    }

    if (category._count.articles > 0) {
      return {
        success: false,
        error: `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${category._count.articles} artikel.`,
      };
    }

    await db.category.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/kategori");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: { id },
    };
  } catch {
    return {
      success: false,
      error: "Gagal menghapus kategori.",
    };
  }
}
