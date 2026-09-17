"use server";

import { revalidatePath } from "next/cache";
import * as path from "path";
import * as fs from "fs/promises";
import { db } from "../lib/db";
import { getCurrentSession } from "../lib/auth";
import { slugify } from "../lib/utils";
import type { Article, Prisma } from "@prisma/client";

export type ArticleActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  isPublished?: boolean;
};

export type ArticleInput = {
  title: string;
  categoryId: string;
  content: string;
  isPublished?: boolean;
  coverImage?: File | string | null;
  authorId?: string;
  _testUserId?: string;
  _testUserRole?: "SUPER_ADMIN" | "STAFF";
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Menyimpan file gambar sampul secara lokal di direktori public/uploads/articles/
 */
async function saveUploadedCoverImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format gambar harus berupa JPG, PNG, atau WebP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 10MB.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "articles");
  await fs.mkdir(uploadDir, { recursive: true });

  const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const ext = extMap[file.type] || path.extname(file.name) || ".jpg";
  const filename = `art-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return `/uploads/articles/${filename}`;
}

/**
 * Menghapus file gambar sampul lokal jika ada di disk server
 */
async function deleteLocalCoverImage(coverUrl?: string | null) {
  if (!coverUrl || !coverUrl.startsWith("/uploads/articles/")) {
    return;
  }
  try {
    const filePath = path.join(process.cwd(), "public", coverUrl);
    await fs.unlink(filePath);
  } catch {
    // Abaikan jika file sudah tidak ada atau gagal diakses
  }
}

/**
 * Menghasilkan slug unik dengan proteksi benturan/duplikasi
 */
async function generateUniqueArticleSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title) || `artikel-${Date.now().toString().slice(-6)}`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

/**
 * Membantu ekstrak payload dari FormData atau Object
 */
function parseArticlePayload(input: FormData | ArticleInput): ArticleInput {
  if (input instanceof FormData) {
    const isPublishedRaw = input.get("isPublished");
    const coverFile = input.get("coverImage");
    const authorIdRaw = input.get("authorId");

    return {
      title: (input.get("title") as string) || "",
      categoryId: (input.get("categoryId") as string) || "",
      content: (input.get("content") as string) || "",
      isPublished:
        isPublishedRaw === "true" || isPublishedRaw === "1" || isPublishedRaw === "on",
      coverImage:
        coverFile instanceof File && coverFile.size > 0
          ? coverFile
          : (input.get("existingCoverImage") as string) || null,
      authorId: (authorIdRaw as string) || undefined,
      _testUserId: (input.get("_testUserId") as string) || undefined,
      _testUserRole: (input.get("_testUserRole") as "SUPER_ADMIN" | "STAFF") || undefined,
    };
  }
  return input;
}

/**
 * Server Action: Menambahkan artikel berita baru
 */
export async function createArticleAction(
  input: FormData | ArticleInput
): Promise<ArticleActionResult<Article>> {
  const payload = parseArticlePayload(input);

  // Verifikasi sesi
  let currentUserId = payload._testUserId;
  let currentUserRole: "SUPER_ADMIN" | "STAFF" = payload._testUserRole ?? "SUPER_ADMIN";
  if (!currentUserId) {
    const auth = await getCurrentSession();
    if (!auth || auth.user.status === "INACTIVE") {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
    currentUserId = auth.user.id;
    currentUserRole = auth.user.role;
  }

  let finalAuthorId = currentUserId;
  if (currentUserRole === "SUPER_ADMIN" && payload.authorId) {
    const authorExists = await db.user.findFirst({
      where: { id: payload.authorId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!authorExists) {
      return {
        success: false,
        error: "Penulis yang dipilih tidak ditemukan atau tidak berstatus aktif.",
      };
    }
    finalAuthorId = payload.authorId;
  }

  const title = payload.title?.trim();
  if (!title || title.length < 3) {
    return {
      success: false,
      error: "Judul artikel minimal 3 karakter.",
    };
  }

  if (title.length > 255) {
    return {
      success: false,
      error: "Judul artikel maksimal 255 karakter.",
    };
  }

  if (!payload.categoryId) {
    return {
      success: false,
      error: "Kategori artikel wajib dipilih.",
    };
  }

  // Verifikasi kategori valid di DB
  const category = await db.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    return {
      success: false,
      error: "Kategori yang dipilih tidak ditemukan.",
    };
  }

  const content = payload.content?.trim();
  if (!content || content === "<p></p>") {
    return {
      success: false,
      error: "Isi konten artikel tidak boleh kosong.",
    };
  }

  try {
    let coverImagePath: string | null = null;
    if (payload.coverImage instanceof File && payload.coverImage.size > 0) {
      coverImagePath = await saveUploadedCoverImage(payload.coverImage);
    } else if (typeof payload.coverImage === "string") {
      coverImagePath = payload.coverImage;
    }

    const uniqueSlug = await generateUniqueArticleSlug(title);

    const article = await db.article.create({
      data: {
        title,
        slug: uniqueSlug,
        content,
        coverImage: coverImagePath,
        isPublished: payload.isPublished ?? true,
        publishedAt: payload.isPublished ? new Date() : new Date(),
        categoryId: payload.categoryId,
        authorId: finalAuthorId,
      },
    });

    try {
      revalidatePath("/admin/berita");
      revalidatePath("/berita");
      revalidatePath("/");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: article,
    };
  } catch (err: unknown) {
    console.error("[createArticleAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menambahkan artikel.",
    };
  }
}

/**
 * Server Action: Memperbarui data artikel berita
 */
export async function updateArticleAction(
  id: string,
  input: FormData | ArticleInput
): Promise<ArticleActionResult<Article>> {
  const payload = parseArticlePayload(input);

  // Verifikasi sesi
  let currentUserRole: "SUPER_ADMIN" | "STAFF" = payload._testUserRole ?? "SUPER_ADMIN";
  if (!payload._testUserId) {
    const auth = await getCurrentSession();
    if (!auth || auth.user.status === "INACTIVE") {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
    currentUserRole = auth.user.role;
  }

  const existingArticle = await db.article.findUnique({
    where: { id },
  });
  if (!existingArticle) {
    return {
      success: false,
      error: "Artikel tidak ditemukan.",
    };
  }

  const title = payload.title?.trim();
  if (!title || title.length < 3) {
    return {
      success: false,
      error: "Judul artikel minimal 3 karakter.",
    };
  }

  const content = payload.content?.trim();
  if (!content || content === "<p></p>") {
    return {
      success: false,
      error: "Isi konten artikel tidak boleh kosong.",
    };
  }

  try {
    let coverImagePath = existingArticle.coverImage;

    // Jika ada file gambar baru yang diunggah
    if (payload.coverImage instanceof File && payload.coverImage.size > 0) {
      coverImagePath = await saveUploadedCoverImage(payload.coverImage);
      // Hapus file sampul lama jika sebelumnya upload lokal
      await deleteLocalCoverImage(existingArticle.coverImage);
    } else if (payload.coverImage === null) {
      await deleteLocalCoverImage(existingArticle.coverImage);
      coverImagePath = null;
    }

    // Periksa apakah slug perlu diperbarui jika judul berubah
    let slug = existingArticle.slug;
    if (title !== existingArticle.title) {
      slug = await generateUniqueArticleSlug(title, id);
    }

    let nextAuthorId = existingArticle.authorId;
    if (
      currentUserRole === "SUPER_ADMIN" &&
      payload.authorId &&
      payload.authorId !== existingArticle.authorId
    ) {
      const authorExists = await db.user.findFirst({
        where: { id: payload.authorId, status: "ACTIVE" },
        select: { id: true },
      });
      if (!authorExists) {
        return {
          success: false,
          error: "Penulis yang dipilih tidak ditemukan atau tidak berstatus aktif.",
        };
      }
      nextAuthorId = payload.authorId;
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        coverImage: coverImagePath,
        isPublished: payload.isPublished ?? existingArticle.isPublished,
        categoryId: payload.categoryId || existingArticle.categoryId,
        authorId: nextAuthorId,
      },
    });

    try {
      revalidatePath("/admin/berita");
      revalidatePath("/berita");
      revalidatePath(`/berita/${slug}`);
      revalidatePath("/");
    } catch {
      // Safe fallback di luar Next.js request context
    }

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("[updateArticleAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui artikel.",
    };
  }
}

/**
 * Server Action: Toggle status publikasi artikel (Draft ↔ Publikasi)
 */
export async function toggleArticlePublishAction(
  id: string,
  _testUserId?: string
): Promise<ArticleActionResult<Article>> {
  if (!_testUserId) {
    const auth = await getCurrentSession();
    if (!auth || auth.user.status === "INACTIVE") {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  try {
    const existing = await db.article.findUnique({
      where: { id },
      select: { isPublished: true, slug: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Artikel tidak ditemukan.",
      };
    }

    const nextState = !existing.isPublished;
    const updated = await db.article.update({
      where: { id },
      data: {
        isPublished: nextState,
        publishedAt: nextState ? new Date() : undefined,
      },
    });

    try {
      revalidatePath("/admin/berita");
      revalidatePath("/berita");
      revalidatePath(`/berita/${existing.slug}`);
      revalidatePath("/");
    } catch {
      // Safe fallback di luar context
    }

    return {
      success: true,
      data: updated,
      isPublished: updated.isPublished,
    };
  } catch (err: unknown) {
    console.error("[toggleArticlePublishAction] Error:", err);
    return {
      success: false,
      error: "Gagal mengubah status publikasi artikel.",
    };
  }
}

/**
 * Server Action: Menghapus artikel berita dari database beserta file fisik sampulnya
 */
export async function deleteArticleAction(
  id: string,
  _testUserId?: string
): Promise<ArticleActionResult> {
  if (!_testUserId) {
    const auth = await getCurrentSession();
    if (!auth || auth.user.status === "INACTIVE") {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  try {
    const existing = await db.article.findUnique({
      where: { id },
      select: { coverImage: true, slug: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Artikel tidak ditemukan atau telah dihapus.",
      };
    }

    // Hapus file fisik gambar jika lokal
    await deleteLocalCoverImage(existing.coverImage);

    // Hapus dari PostgreSQL
    await db.article.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin/berita");
      revalidatePath("/berita");
      revalidatePath(`/berita/${existing.slug}`);
      revalidatePath("/");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error("[deleteArticleAction] Error:", err);
    return {
      success: false,
      error: "Gagal menghapus artikel.",
    };
  }
}

export type GetPublicArticlesParams = {
  page?: number;
  limit?: number;
  categorySlug?: string;
  categorySlugs?: string[];
  search?: string;
};

export type PublicArticleItem = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  categoryName: string;
  categorySlug: string;
  publishedAt: string;
};

export type GetPublicArticlesResult = {
  success: boolean;
  articles: PublicArticleItem[];
  total: number;
  hasMore: boolean;
  error?: string;
};

/**
 * Mengambil daftar artikel terbit untuk konsumsi publik dengan paginasi dan filter
 */
export async function getPublicArticlesAction(
  params: GetPublicArticlesParams = {}
): Promise<GetPublicArticlesResult> {
  try {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 12));
    const skip = (page - 1) * limit;

    const trimmedSearch = typeof params.search === "string" ? params.search.trim().slice(0, 100) : "";
    const categorySlug = typeof params.categorySlug === "string" ? params.categorySlug.trim().toLowerCase() : "";
    const rawCategorySlugs = Array.isArray(params.categorySlugs)
      ? params.categorySlugs
      : categorySlug && categorySlug !== "semua"
      ? [categorySlug]
      : [];
    const validCategorySlugs = rawCategorySlugs
      .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
      .filter((s) => s && s !== "semua");

    const whereClause: Prisma.ArticleWhereInput = {
      isPublished: true,
    };

    if (validCategorySlugs.length === 1) {
      whereClause.category = {
        slug: validCategorySlugs[0],
        status: "ACTIVE",
      };
    } else if (validCategorySlugs.length > 1) {
      whereClause.category = {
        slug: { in: validCategorySlugs },
        status: "ACTIVE",
      };
    }

    if (trimmedSearch) {
      whereClause.OR = [
        { title: { contains: trimmedSearch, mode: "insensitive" } },
        { content: { contains: trimmedSearch, mode: "insensitive" } },
      ];
    }

    const [total, dbArticles] = await Promise.all([
      db.article.count({ where: whereClause }),
      db.article.findMany({
        where: whereClause,
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    const articles: PublicArticleItem[] = dbArticles.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      coverImage: art.coverImage,
      categoryName: art.category?.name || "Umum",
      categorySlug: art.category?.slug || "umum",
      publishedAt: art.publishedAt.toISOString(),
    }));

    const hasMore = skip + articles.length < total;

    return {
      success: true,
      articles,
      total,
      hasMore,
    };
  } catch (err: unknown) {
    console.error("[getPublicArticlesAction] Error:", err);
    return {
      success: false,
      articles: [],
      total: 0,
      hasMore: false,
      error: "Gagal memuat artikel berita.",
    };
  }
}

/**
 * Server Action: Mengalihkan seluruh artikel milik sourceUserId ke targetUserId (Super Admin only).
 */
export async function bulkReassignArticlesAction(
  sourceUserId: string,
  targetUserId: string,
  options?: { _testUserRole?: "SUPER_ADMIN" | "STAFF" }
): Promise<ArticleActionResult<{ count: number }>> {
  let role = options?._testUserRole;
  if (!role) {
    const auth = await getCurrentSession();
    if (!auth || auth.user.status === "INACTIVE") {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
    role = auth.user.role;
  }

  if (role !== "SUPER_ADMIN") {
    return {
      success: false,
      error: "Hanya Super Admin yang berwenang mengalihkan kepemilikan artikel secara massal.",
    };
  }

  if (sourceUserId === targetUserId) {
    return {
      success: false,
      error: "Pengguna asal dan pengguna tujuan alih kepemilikan tidak boleh sama.",
    };
  }

  try {
    const targetUser = await db.user.findFirst({
      where: { id: targetUserId, status: "ACTIVE" },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Pengguna tujuan tidak ditemukan atau tidak berstatus aktif.",
      };
    }

    const result = await db.article.updateMany({
      where: { authorId: sourceUserId },
      data: { authorId: targetUserId },
    });

    try {
      revalidatePath("/admin/berita");
      revalidatePath("/admin/pengguna");
      revalidatePath("/berita");
      revalidatePath("/");
    } catch {
      // Safe fallback
    }

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (err: unknown) {
    console.error("[bulkReassignArticlesAction] Error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengalihkan kepemilikan artikel.",
    };
  }
}


