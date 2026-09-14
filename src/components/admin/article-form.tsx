"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  ArrowLeft,
  Check,
  Globe,
  FileText,
  Tag,
  ImageIcon,
  Type,
  Search,
  ChevronDown,
  Loader2,
  Eye,
  Users,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ArticlePreviewModal } from "@/components/admin/article-preview-modal";
import { cn, getAssetUrl } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createArticleAction, updateArticleAction } from "@/actions/article";

export interface FormAuthorOption {
  id: string;
  name: string;
  username: string;
  role: "SUPER_ADMIN" | "STAFF";
}

export interface FormCategoryOption {
  id: string;
  name: string;
  slug?: string;
  status?: string;
}

export interface FormArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  categoryId: string;
  authorId?: string;
}

interface ArticleFormProps {
  article?: FormArticleData;
  categories: FormCategoryOption[];
  authorName?: string;
  currentUserRole?: "SUPER_ADMIN" | "STAFF";
  currentUserId?: string;
  currentAuthorId?: string;
  currentAuthorName?: string;
  availableAuthors?: FormAuthorOption[];
}

export function ArticleForm({
  article,
  categories,
  authorName,
  currentUserRole,
  currentUserId,
  currentAuthorId,
  currentAuthorName,
  availableAuthors,
}: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(article?.title ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    article?.categoryId ?? categories[0]?.id ?? ""
  );
  const [content, setContent] = useState(article?.content ?? "");
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Combobox State
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Author State
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(
    currentAuthorId ?? currentUserId ?? availableAuthors?.[0]?.id ?? ""
  );
  const [isAuthorComboboxOpen, setIsAuthorComboboxOpen] = useState(false);
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorActiveIndex, setAuthorActiveIndex] = useState<number>(-1);
  const authorComboboxRef = useRef<HTMLDivElement>(null);
  const authorOptionsRef = useRef<HTMLDivElement>(null);
  const authorTriggerButtonRef = useRef<HTMLButtonElement>(null);

  // Filter kategori aktif
  const activeCategories = categories.filter(
    (cat) => !cat.status || cat.status === "ACTIVE"
  );

  const filteredCategories = activeCategories.filter((cat) =>
    cat.name.toLowerCase().includes(comboboxSearch.toLowerCase())
  );

  const selectedCategoryData = activeCategories.find(
    (cat) => cat.id === selectedCategoryId
  );

  // Filter penulis aktif
  const filteredAuthors = (availableAuthors || []).filter(
    (author) =>
      author.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
      author.username.toLowerCase().includes(authorSearch.toLowerCase())
  );

  const selectedAuthorData = (availableAuthors || []).find(
    (author) => author.id === selectedAuthorId
  );

  const displayAuthorName =
    selectedAuthorData?.name || currentAuthorName || authorName || "Admin IFK";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsComboboxOpen(false);
        setComboboxSearch("");
        setActiveIndex(-1);
      }
      if (
        authorComboboxRef.current &&
        !authorComboboxRef.current.contains(event.target as Node)
      ) {
        setIsAuthorComboboxOpen(false);
        setAuthorSearch("");
        setAuthorActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeActiveIndex =
    filteredCategories.length === 0
      ? -1
      : activeIndex >= filteredCategories.length
      ? 0
      : activeIndex;

  const safeAuthorActiveIndex =
    filteredAuthors.length === 0
      ? -1
      : authorActiveIndex >= filteredAuthors.length
      ? 0
      : authorActiveIndex;

  // Sync scroll to active item
  useEffect(() => {
    if (safeActiveIndex >= 0 && optionsRef.current) {
      const activeEl = optionsRef.current.children[safeActiveIndex] as
        | HTMLElement
        | undefined;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [safeActiveIndex]);

  useEffect(() => {
    if (safeAuthorActiveIndex >= 0 && authorOptionsRef.current) {
      const activeEl = authorOptionsRef.current.children[safeAuthorActiveIndex] as
        | HTMLElement
        | undefined;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [safeAuthorActiveIndex]);

  const selectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setIsComboboxOpen(false);
    setComboboxSearch("");
    setActiveIndex(-1);
    setTimeout(() => {
      document.getElementById("status-publikasi")?.focus();
    }, 0);
  };

  const generatedSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
        toast.error("Format berkas harus berupa JPG, PNG, atau WebP.");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          `Ukuran foto maksimal 10MB. Foto yang dipilih berukuran ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
        );
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Judul artikel minimal 3 karakter.");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Kategori artikel wajib dipilih.");
      return;
    }

    if (!content || content.trim() === "" || content === "<p></p>") {
      toast.error("Isi konten artikel wajib diisi.");
      return;
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("categoryId", selectedCategoryId);
    formData.append("content", content);
    formData.append("isPublished", isPublished ? "true" : "false");

    if (selectedAuthorId && currentUserRole === "SUPER_ADMIN") {
      formData.append("authorId", selectedAuthorId);
    }

    if (selectedFile) {
      formData.append("coverImage", selectedFile);
    } else if (article?.coverImage) {
      formData.append("existingCoverImage", article.coverImage);
    }

    startTransition(async () => {
      try {
        const res = article
          ? await updateArticleAction(article.id, formData)
          : await createArticleAction(formData);

        if (res.success) {
          toast.success(
            article
              ? "Artikel berhasil diperbarui."
              : "Artikel berhasil disimpan dan dipublikasikan."
          );
          router.push("/admin/berita/");
        } else {
          toast.error(res.error || "Gagal menyimpan artikel.");
        }
      } catch (err: unknown) {
        console.error("[ArticleForm] Gagal menyimpan artikel:", err);
        const errMsg = err instanceof Error ? err.message : "";
        if (
          errMsg.includes("Entity Too Large") ||
          errMsg.includes("413") ||
          errMsg.includes("bodySizeLimit") ||
          errMsg.includes("exceeded")
        ) {
          toast.error(
            "Ukuran berkas melebihi batas maksimal server. Silakan gunakan foto yang lebih kecil (maksimal 10MB)."
          );
        } else {
          toast.error(
            "Gagal menghubungi server. Pastikan koneksi stabil atau coba gunakan foto berukuran lebih kecil."
          );
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full min-w-0">
      {/* Top action / back link */}
      <div className="pb-2">
        <Link
          href="/admin/berita/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Kelola Berita</span>
        </Link>
      </div>

      {/* Main Form Container Card */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-xl space-y-6 w-full min-w-0 max-w-full overflow-hidden">
        {/* Judul Artikel & Slug */}
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"
          >
            <Type className="h-3.5 w-3.5 text-brand-400" />
            <span>Judul Artikel</span> <span className="text-red-400">*</span>
          </Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setIsComboboxOpen(true);
                const idx = filteredCategories.findIndex(
                  (c) => c.id === selectedCategoryId
                );
                setActiveIndex(
                  idx >= 0
                    ? idx
                    : filteredCategories.length > 0
                    ? 0
                    : -1
                );
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                triggerButtonRef.current?.focus();
              }
            }}
            placeholder="Misal: Sosialisasi Pelayanan Kefarmasian Puskesmas Se-Kotabaru"
            className="border-white/10 bg-zinc-950/60 text-white placeholder-zinc-500 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40"
          />
          {title && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1 min-w-0 max-w-full">
              <Globe className="h-3.5 w-3.5 text-brand-400 shrink-0" />
              <span className="shrink-0">Preview URL:</span>
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-brand-300 font-mono break-all">
                /berita/{generatedSlug}
              </code>
            </div>
          )}
        </div>

        {/* Kategori & Status Grid */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 w-full min-w-0">
          {/* Combobox Kategori */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-brand-400" />
              <span>Kategori</span> <span className="text-red-400">*</span>
            </Label>
            <div ref={comboboxRef} className="relative">
              <button
                ref={triggerButtonRef}
                type="button"
                onClick={() => {
                  if (isComboboxOpen) {
                    setIsComboboxOpen(false);
                    setComboboxSearch("");
                    setActiveIndex(-1);
                  } else {
                    setIsComboboxOpen(true);
                    const idx = filteredCategories.findIndex(
                      (cat) => cat.id === selectedCategoryId
                    );
                    setActiveIndex(
                      idx >= 0
                        ? idx
                        : filteredCategories.length > 0
                        ? 0
                        : -1
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "ArrowDown" ||
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    if (!isComboboxOpen) {
                      setIsComboboxOpen(true);
                      const idx = filteredCategories.findIndex(
                        (cat) => cat.id === selectedCategoryId
                      );
                      setActiveIndex(
                        idx >= 0
                          ? idx
                          : filteredCategories.length > 0
                          ? 0
                          : -1
                      );
                    }
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    document.getElementById("title")?.focus();
                  }
                }}
                aria-expanded={isComboboxOpen}
                aria-haspopup="listbox"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-lg border bg-zinc-950/60 px-3.5 text-sm transition-colors outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40",
                  isComboboxOpen
                    ? "border-brand-500/60 ring-2 ring-brand-500/40"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedCategoryData ? (
                    <span className="text-white">
                      {selectedCategoryData.name}
                    </span>
                  ) : (
                    <span className="text-zinc-500">Pilih kategori...</span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-zinc-400 transition-transform",
                    isComboboxOpen && "rotate-180"
                  )}
                />
              </button>

              {isComboboxOpen && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl backdrop-blur-2xl">
                  {/* Search Input inside Dropdown */}
                  <div className="border-b border-white/5 p-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={comboboxSearch}
                        onChange={(e) => {
                          setComboboxSearch(e.target.value);
                          setActiveIndex(0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (filteredCategories.length > 0) {
                              setActiveIndex((prev) =>
                                prev < filteredCategories.length - 1
                                  ? prev + 1
                                  : 0
                              );
                            }
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (filteredCategories.length > 0) {
                              setActiveIndex((prev) =>
                                prev > 0
                                  ? prev - 1
                                  : filteredCategories.length - 1
                              );
                            }
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            if (
                              safeActiveIndex >= 0 &&
                              safeActiveIndex < filteredCategories.length
                            ) {
                              selectCategory(
                                filteredCategories[safeActiveIndex].id
                              );
                            }
                          } else if (e.key === "Tab") {
                            if (
                              safeActiveIndex >= 0 &&
                              safeActiveIndex < filteredCategories.length
                            ) {
                              selectCategory(
                                filteredCategories[safeActiveIndex].id
                              );
                            } else {
                              setIsComboboxOpen(false);
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setIsComboboxOpen(false);
                            triggerButtonRef.current?.focus();
                          }
                        }}
                        className="w-full rounded-lg border border-white/10 bg-zinc-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-500/50"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div
                    ref={optionsRef}
                    role="listbox"
                    className="max-h-48 overflow-y-auto p-1.5 focus:outline-none"
                  >
                    {filteredCategories.length === 0 ? (
                      <div className="p-3 text-center text-xs text-zinc-500">
                        Tidak ada kategori yang cocok.
                      </div>
                    ) : (
                      filteredCategories.map((cat, idx) => {
                        const isSelected = selectedCategoryId === cat.id;
                        const isHighlighted = safeActiveIndex === idx;

                        return (
                          <div
                            key={cat.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => selectCategory(cat.id)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={cn(
                              "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                              isHighlighted
                                ? "bg-brand-500/20 text-white"
                                : isSelected
                                ? "bg-white/5 text-brand-300"
                                : "text-zinc-300 hover:bg-white/5"
                            )}
                          >
                            <span className="font-medium">{cat.name}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-brand-400" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Publikasi Switch Button */}
          <div className="space-y-2">
            <Label
              htmlFor="status-publikasi"
              className="text-sm font-medium text-zinc-200"
            >
              Status Publikasi
            </Label>
            <button
              id="status-publikasi"
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const editorEl =
                    document.querySelector<HTMLElement>(".ProseMirror");
                  editorEl?.focus();
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  triggerButtonRef.current?.focus();
                }
              }}
              className={cn(
                "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border px-3.5 text-left transition-colors outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40",
                isPublished
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-300"
                  : "border-white/10 bg-zinc-950/60 text-zinc-400"
              )}
            >
              <span className="text-sm font-medium">
                {isPublished ? "Langsung Terbitkan" : "Simpan Sebagai Draft"}
              </span>
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                  isPublished
                    ? "border-brand-400 bg-brand-500 text-black"
                    : "border-zinc-600 bg-zinc-800"
                )}
              >
                {isPublished && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Penulis Naskah (Author Selector) */}
          {currentUserRole === "SUPER_ADMIN" ? (
            <div className="sm:col-span-2 space-y-2 min-w-0">
              <Label className="text-sm font-medium text-zinc-200 flex flex-wrap items-center justify-between gap-1">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-brand-400" />
                  <span>Penulis Naskah (Author)</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">
                  Khusus Super Admin
                </span>
              </Label>
              <div ref={authorComboboxRef} className="relative w-full min-w-0">
                <button
                  ref={authorTriggerButtonRef}
                  type="button"
                  onClick={() => {
                    if (isAuthorComboboxOpen) {
                      setIsAuthorComboboxOpen(false);
                      setAuthorSearch("");
                      setAuthorActiveIndex(-1);
                    } else {
                      setIsAuthorComboboxOpen(true);
                      const idx = filteredAuthors.findIndex(
                        (a) => a.id === selectedAuthorId
                      );
                      setAuthorActiveIndex(
                        idx >= 0
                          ? idx
                          : filteredAuthors.length > 0
                          ? 0
                          : -1
                      );
                    }
                  }}
                  aria-expanded={isAuthorComboboxOpen}
                  aria-haspopup="listbox"
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between rounded-xl border bg-zinc-950/60 px-3.5 py-2 text-sm transition-colors outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40",
                    isAuthorComboboxOpen
                      ? "border-brand-500/60 ring-2 ring-brand-500/40"
                      : "border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-300 ring-1 ring-brand-500/30">
                      {getInitials(displayAuthorName)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0 flex-1 overflow-hidden text-left">
                      <span className="font-medium text-white text-xs sm:text-sm truncate block">
                        {displayAuthorName}
                      </span>
                      {selectedAuthorData && (
                        <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                          <span className="font-mono text-[11px] text-zinc-400 truncate max-w-[110px] sm:max-w-[150px]">
                            @{selectedAuthorData.username}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-semibold shrink-0",
                              selectedAuthorData.role === "SUPER_ADMIN"
                                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : "border border-brand-500/30 bg-brand-500/10 text-brand-300"
                            )}
                          >
                            {selectedAuthorData.role === "SUPER_ADMIN"
                              ? "Super Admin"
                              : "Staf"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-zinc-400 transition-transform ml-2",
                      isAuthorComboboxOpen && "rotate-180"
                    )}
                  />
                </button>

                {isAuthorComboboxOpen && (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl backdrop-blur-2xl">
                    {/* Search Input inside Dropdown */}
                    <div className="border-b border-white/5 p-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Cari nama atau username staf..."
                          value={authorSearch}
                          onChange={(e) => {
                            setAuthorSearch(e.target.value);
                            setAuthorActiveIndex(0);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              if (filteredAuthors.length > 0) {
                                setAuthorActiveIndex((prev) =>
                                  prev < filteredAuthors.length - 1
                                    ? prev + 1
                                    : 0
                                );
                              }
                            } else if (e.key === "ArrowUp") {
                              e.preventDefault();
                              if (filteredAuthors.length > 0) {
                                setAuthorActiveIndex((prev) =>
                                  prev > 0
                                    ? prev - 1
                                    : filteredAuthors.length - 1
                                );
                              }
                            } else if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                safeAuthorActiveIndex >= 0 &&
                                safeAuthorActiveIndex < filteredAuthors.length
                              ) {
                                setSelectedAuthorId(
                                  filteredAuthors[safeAuthorActiveIndex].id
                                );
                                setIsAuthorComboboxOpen(false);
                                setAuthorSearch("");
                              }
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setIsAuthorComboboxOpen(false);
                              authorTriggerButtonRef.current?.focus();
                            }
                          }}
                          className="w-full rounded-lg border border-white/10 bg-zinc-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-500/50"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Authors List */}
                    <div
                      ref={authorOptionsRef}
                      role="listbox"
                      className="max-h-48 overflow-y-auto p-1.5 focus:outline-none"
                    >
                      {filteredAuthors.length === 0 ? (
                        <div className="p-3 text-center text-xs text-zinc-500">
                          Tidak ada staf aktif yang cocok.
                        </div>
                      ) : (
                        filteredAuthors.map((author, idx) => {
                          const isSelected = selectedAuthorId === author.id;
                          const isHighlighted = safeAuthorActiveIndex === idx;

                          return (
                            <div
                              key={author.id}
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setSelectedAuthorId(author.id);
                                setIsAuthorComboboxOpen(false);
                                setAuthorSearch("");
                              }}
                              onMouseEnter={() => setAuthorActiveIndex(idx)}
                              className={cn(
                                "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                                isHighlighted
                                  ? "bg-brand-500/20 text-white"
                                  : isSelected
                                  ? "bg-white/5 text-brand-300"
                                  : "text-zinc-300 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-white ring-1 ring-white/10">
                                  {getInitials(author.name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-white truncate">
                                    {author.name}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                                    @{author.username} &bull;{" "}
                                    <span
                                      className={
                                        author.role === "SUPER_ADMIN"
                                          ? "text-amber-400"
                                          : "text-zinc-400"
                                      }
                                    >
                                      {author.role === "SUPER_ADMIN"
                                        ? "Super Admin"
                                        : "Staf"}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 shrink-0 text-brand-400 ml-2" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="sm:col-span-2 space-y-2 min-w-0">
              <Label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-brand-400" />
                <span>Penulis Naskah (Author)</span>
              </Label>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/40 p-3 w-full min-w-0 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white ring-1 ring-white/10">
                    {getInitials(displayAuthorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {displayAuthorName}
                    </p>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                      <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span className="truncate">
                        Penulis naskah hanya dapat dialihkan oleh Super Admin.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cover Image Upload Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-brand-400" />
            <span>Gambar Sampul (Cover Image)</span>
          </Label>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
            <label
              htmlFor="cover-image"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-zinc-950/40 p-6 text-center hover:border-brand-500/50 hover:bg-zinc-950/70 cursor-pointer transition-colors group focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/40 focus-within:bg-zinc-950/70"
            >
              <Upload className="h-7 w-7 text-zinc-400 group-hover:text-brand-400 group-focus-within:text-brand-400 transition-colors" />
              <p className="mt-2 text-xs font-medium text-zinc-300">
                Klik untuk unggah foto artikel
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                PNG, JPG, WebP (Maks. 10MB)
              </p>
              <input
                id="cover-image"
                type="file"
                accept="image/*"
                tabIndex={-1}
                onChange={handleFileChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const editorEl =
                      document.querySelector<HTMLElement>(".ProseMirror");
                    editorEl?.focus();
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    document.getElementById("status-publikasi")?.focus();
                  }
                }}
                className="sr-only"
              />
            </label>

            {/* Preview container */}
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80">
              {preview || article?.coverImage ? (
                <Image
                  src={preview ?? getAssetUrl(article?.coverImage)}
                  alt="Preview Sampul"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-xs text-zinc-500">
                  <ImageIcon className="h-6 w-6 text-zinc-600 mb-1" />
                  <span>Belum ada gambar sampul</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Konten Artikel */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-brand-400" />
              <span>Isi Konten Artikel</span> <span className="text-red-400">*</span>
            </Label>
            <span className="text-[11px] text-zinc-500">
              Mendukung formatting visual &amp; shortcut (Ctrl+B, Ctrl+I, Ctrl+Enter)
            </span>
          </div>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Tuliskan berita, informasi kegiatan, atau sosialisasi obat dan perbekalan kesehatan di sini..."
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-brand-500 px-5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isPending
                ? "Menyimpan..."
                : article
                ? "Simpan Perubahan"
                : "Publikasikan Artikel"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition-colors outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/40"
            title="Lihat Pratinjau Tampilan Artikel"
          >
            <Eye className="h-4 w-4" />
            <span>Pratinjau</span>
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push("/admin/berita/")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>

      <ArticlePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={{
          title,
          categoryName:
            categories.find((c) => c.id === selectedCategoryId)?.name || "Umum",
          content,
          coverPreviewUrl: preview || getAssetUrl(article?.coverImage) || null,
          authorName: displayAuthorName,
          isPublished,
        }}
      />
    </form>
  );
}
