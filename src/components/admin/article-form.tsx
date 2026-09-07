"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  ArrowLeft,
  Check,
  Globe,
  FileText,
  Sparkles,
  Tag,
  ImageIcon,
  Type,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Article, Category, ArticleCategory } from "@/lib/dummy-data";
import { initialCategories, ARTICLE_CATEGORIES } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState<Article["category"]>(
    article?.category ?? ARTICLE_CATEGORIES[0]
  );
  const [content, setContent] = useState(
    article?.content.replace(/<[^>]+>/g, "").trim() ?? ""
  );
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [preview, setPreview] = useState<string | null>(null);

  // Combobox State
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Filter kategori yang hanya ACTIVE
  const activeCategories = initialCategories.filter(
    (cat) => cat.status === "ACTIVE"
  );

  const filteredCategories = activeCategories.filter((cat) =>
    cat.name.toLowerCase().includes(comboboxSearch.toLowerCase())
  );

  const selectedCategoryData = activeCategories.find(
    (cat) => cat.name === category
  );

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync scroll to active item
  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current) {
      const activeEl = optionsRef.current.children[activeIndex] as HTMLElement | undefined;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Adjust activeIndex when filter changes
  useEffect(() => {
    if (isComboboxOpen) {
      setActiveIndex((prev) => {
        if (filteredCategories.length === 0) return -1;
        if (prev >= filteredCategories.length) return 0;
        return prev === -1 ? 0 : prev;
      });
    }
  }, [comboboxSearch, isComboboxOpen, filteredCategories.length]);

  const selectCategory = (catName: string) => {
    setCategory(catName as ArticleCategory);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(
      article
        ? "Artikel berhasil diperbarui (dummy mode)"
        : "Artikel berhasil disimpan (dummy mode)"
    );
    router.push("/admin/berita");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action / back link */}
      <div className="pb-2">
        <Link
          href="/admin/berita"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Kelola Berita</span>
        </Link>
      </div>

      {/* Main Form Container Card */}
      <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl sm:p-8 space-y-6">
        {/* Judul Artikel & Slug */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5 text-brand-400" />
            <span>Judul Artikel</span> <span className="text-red-400">*</span>
          </Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Misal: Sosialisasi Pelayanan Kefarmasian Puskesmas Se-Kotabaru"
            className="border-white/10 bg-zinc-950/60 text-white placeholder-zinc-500 focus:border-brand-500/50"
          />
          {title && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1">
              <Globe className="h-3.5 w-3.5 text-brand-400" />
              <span>Preview URL:</span>
              <code className="rounded bg-black/40 px-1.5 py-0.5 text-brand-300 font-mono">
                /berita/{generatedSlug}
              </code>
            </div>
          )}
        </div>

        {/* Kategori & Status Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Combobox Kategori */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-brand-400" />
              <span>Kategori</span>
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
                    const idx = filteredCategories.findIndex((cat) => cat.name === category);
                    setActiveIndex(idx >= 0 ? idx : (filteredCategories.length > 0 ? 0 : -1));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    if (!isComboboxOpen) {
                      setIsComboboxOpen(true);
                      const idx = filteredCategories.findIndex((cat) => cat.name === category);
                      setActiveIndex(idx >= 0 ? idx : (filteredCategories.length > 0 ? 0 : -1));
                    }
                  }
                }}
                aria-expanded={isComboboxOpen}
                aria-haspopup="listbox"
                className={cn(
                  "flex h-10 w-full items-center justify-between rounded-lg border bg-zinc-950/60 px-3.5 text-sm transition-colors",
                  isComboboxOpen
                    ? "border-brand-500/50 ring-1 ring-brand-500/30"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedCategoryData ? (
                    <span className="text-white">{selectedCategoryData.name}</span>
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
                        onChange={(e) => setComboboxSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (filteredCategories.length > 0) {
                              setActiveIndex((prev) => (prev < filteredCategories.length - 1 ? prev + 1 : 0));
                            }
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (filteredCategories.length > 0) {
                              setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredCategories.length - 1));
                            }
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            if (activeIndex >= 0 && activeIndex < filteredCategories.length) {
                              selectCategory(filteredCategories[activeIndex].name);
                            }
                          } else if (e.key === "Tab") {
                            if (activeIndex >= 0 && activeIndex < filteredCategories.length) {
                              e.preventDefault();
                              selectCategory(filteredCategories[activeIndex].name);
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setIsComboboxOpen(false);
                            setComboboxSearch("");
                            setActiveIndex(-1);
                            triggerButtonRef.current?.focus();
                          }
                        }}
                        className="w-full rounded-lg border border-white/5 bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-brand-500/50"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div ref={optionsRef} role="listbox" className="max-h-48 overflow-y-auto p-1.5">
                    {filteredCategories.length === 0 ? (
                      <div className="py-4 text-center text-xs text-zinc-400">
                        Tidak ada kategori ditemukan.
                      </div>
                    ) : (
                      filteredCategories.map((cat, idx) => {
                        const isSelected = category === cat.name;
                        const isActive = activeIndex === idx;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => selectCategory(cat.name)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
                              isActive
                                ? isSelected
                                  ? "bg-brand-500/20 text-brand-200 font-medium"
                                  : "bg-white/10 text-white"
                                : isSelected
                                ? "bg-brand-500/10 text-brand-300 font-medium"
                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <span>{cat.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-brand-400" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publikasi Switch Box */}
          <div className="space-y-2">
            <Label htmlFor="status-publikasi" className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Status Publikasi</span>
            </Label>
            <button
              id="status-publikasi"
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={cn(
                "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border px-3.5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50",
                isPublished
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
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
                    ? "border-emerald-400 bg-emerald-500 text-black"
                    : "border-zinc-600 bg-zinc-800"
                )}
              >
                {isPublished && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>
          </div>
        </div>

        {/* Cover Image Upload Area */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-brand-400" />
            <span>Gambar Sampul (Cover Image)</span>
          </Label>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-zinc-950/40 p-6 text-center hover:border-brand-500/50 hover:bg-zinc-950/70 cursor-pointer transition-colors group">
              <Upload className="h-7 w-7 text-zinc-400 group-hover:text-brand-400 transition-colors" />
              <p className="mt-2 text-xs font-medium text-zinc-300">
                Klik untuk unggah foto artikel
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                PNG, JPG, WebP (Maks. 2MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {/* Preview container */}
            <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80">
              {preview || article?.coverImage ? (
                <Image
                  src={preview ?? article?.coverImage ?? ""}
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
          <div className="flex items-center justify-between">
            <Label
              htmlFor="content"
              className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-brand-400" />
              <span>Isi Konten Artikel</span> <span className="text-red-400">*</span>
            </Label>
            <span className="text-[11px] text-zinc-500">
              Mendukung teks deskriptif
            </span>
          </div>
          <Textarea
            id="content"
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan berita, informasi kegiatan, atau sosialisasi obat dan perbekalan kesehatan di sini..."
            className="border-white/10 bg-zinc-950/60 font-sans text-sm text-white placeholder-zinc-500 focus:border-brand-500/50 leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-5 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition-all hover:brightness-110"
          >
            {article ? "Simpan Perubahan" : "Publikasikan Artikel"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/berita")}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}
