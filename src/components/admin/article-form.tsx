"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Article } from "@/lib/dummy-data";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState<Article["category"]>(article?.category ?? "Kegiatan");
  const [content, setContent] = useState(article?.content.replace(/<[^>]+>/g, "").trim() ?? "");
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [preview, setPreview] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(article ? "Artikel berhasil diperbarui" : "Artikel berhasil disimpan");
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
      {/* Judul */}
      <div>
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul artikel"
          className="mt-1"
        />
        {title && (
          <p className="mt-1 text-xs text-slate-500">
            Slug: {title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}
          </p>
        )}
      </div>

      {/* Kategori */}
      <div>
        <Label>Kategori</Label>
        <Select value={category} onValueChange={(v: string | null) => v && setCategory(v as Article["category"])}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kegiatan">Kegiatan</SelectItem>
            <SelectItem value="Informasi">Informasi</SelectItem>
            <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cover Image */}
      <div>
        <Label>Cover Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1"
        />
        {(preview || article?.coverImage) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview ?? article?.coverImage}
            alt="Preview"
            className="mt-2 h-40 w-full rounded object-cover"
          />
        )}
      </div>

      {/* Konten */}
      <div>
        <Label htmlFor="content">Konten</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis konten artikel di sini..."
          rows={10}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-slate-500">
          Rich text editor akan ditambahkan pada tahap integrasi backend.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          id="published"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <Label htmlFor="published" className="cursor-pointer">
          Terbitkan
        </Label>
      </div>

      {/* Aksi */}
      <div className="flex gap-3">
        <Button type="submit">Simpan</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/berita")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
