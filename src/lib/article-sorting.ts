export type SortKey = "title" | "category" | "isPublished" | "publishedAt";
export type SortOrder = "asc" | "desc";

export interface SortableArticle {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
  isPublished: boolean;
  publishedAt: Date | string;
  createdAt?: Date | string;
  category: {
    id?: string;
    name: string;
  };
  author?: {
    id?: string;
    name: string;
  };
}

/**
 * Mengurutkan array artikel berdasarkan kunci kolom dan arah pengurutan.
 * Fungsi bersifat murni (tidak mengubah array masukan asli).
 */
export function sortArticles<T extends SortableArticle>(
  articles: T[],
  key: SortKey,
  order: SortOrder
): T[] {
  return [...articles].sort((a, b) => {
    let comparison = 0;

    switch (key) {
      case "title":
        comparison = a.title.localeCompare(b.title, "id", {
          sensitivity: "base",
        });
        break;

      case "category":
        comparison = a.category.name.localeCompare(b.category.name, "id", {
          sensitivity: "base",
        });
        break;

      case "isPublished":
        if (a.isPublished !== b.isPublished) {
          // true (Terbit) prioritas -1 pada asc
          comparison = a.isPublished ? -1 : 1;
        }
        break;

      case "publishedAt": {
        const timeA = new Date(a.publishedAt).getTime();
        const timeB = new Date(b.publishedAt).getTime();
        comparison = timeA - timeB;
        break;
      }
    }

    if (comparison !== 0) {
      return order === "desc" ? -comparison : comparison;
    }

    // Tie-breaker sekunder untuk stabilitas urutan jika nilai komparasi identik
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (createdA !== createdB) {
      return createdB - createdA; // Yang lebih baru dibuat di atas
    }

    return a.id.localeCompare(b.id);
  });
}
