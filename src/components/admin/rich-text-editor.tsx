"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Unlink,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors outline-none",
        isActive
          ? "bg-brand-500/20 text-brand-400 border border-brand-500/40 shadow-xs"
          : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent",
        disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-zinc-400"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-4 w-px bg-white/10 mx-0.5" aria-hidden="true" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tuliskan isi artikel secara lengkap di sini...",
  onKeyDown,
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-400 underline underline-offset-4 hover:text-brand-300",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    immediatelyRender: false,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] p-4 text-sm leading-relaxed text-zinc-200 outline-none focus:outline-none max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500/60 [&_blockquote]:pl-3.5 [&_blockquote]:italic [&_blockquote]:text-zinc-400 [&_blockquote]:my-3 [&_hr]:border-white/10 [&_hr]:my-4",
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          if (onKeyDown) {
            onKeyDown(event as unknown as React.KeyboardEvent);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const isContentEmpty = currentEditor.isEmpty;
      const html = isContentEmpty ? "" : currentEditor.getHTML();
      onChange(html);
    },
  });

  // Sinkronisasi value dari luar (jika berbeda dari editor content saat ini)
  React.useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  const handleSetLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan tautan URL (misal: https://...):", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const validUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: validUrl }).run();
  }, [editor]);

  return (
    <div
      onKeyDown={onKeyDown}
      className={cn(
        "group relative flex flex-col rounded-xl border border-white/10 bg-zinc-950/60 backdrop-blur-md transition-all",
        "focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/40",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-white/10 bg-zinc-900/90 p-1.5 rounded-t-xl backdrop-blur-md">
        {/* Grup 1: Text Style */}
        <ToolbarButton
          icon={Bold}
          label="Tebal (Ctrl+B)"
          isActive={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Italic}
          label="Miring (Ctrl+I)"
          isActive={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Coret (Strikethrough)"
          isActive={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor || disabled}
        />

        <ToolbarDivider />

        {/* Grup 2: Headings & Paragraph */}
        <ToolbarButton
          icon={Pilcrow}
          label="Paragraf Normal"
          isActive={editor?.isActive("paragraph") && !editor?.isActive("heading")}
          onClick={() => editor?.chain().focus().setParagraph().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Heading2}
          label="Judul Bab 2 (H2)"
          isActive={editor?.isActive("heading", { level: 2 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Heading3}
          label="Sub-judul 3 (H3)"
          isActive={editor?.isActive("heading", { level: 3 })}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!editor || disabled}
        />

        <ToolbarDivider />

        {/* Grup 3: Lists */}
        <ToolbarButton
          icon={List}
          label="Daftar Poin (Bullet List)"
          isActive={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Daftar Berurutan (Numbered List)"
          isActive={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor || disabled}
        />

        <ToolbarDivider />

        {/* Grup 4: Blocks & Links */}
        <ToolbarButton
          icon={Quote}
          label="Kutipan (Blockquote)"
          isActive={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Minus}
          label="Garis Pemisah (Horizontal Rule)"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={Link2}
          label="Tambah / Ubah Tautan Link"
          isActive={editor?.isActive("link")}
          onClick={handleSetLink}
          disabled={!editor || disabled}
        />
        {editor?.isActive("link") && (
          <ToolbarButton
            icon={Unlink}
            label="Hapus Tautan Link"
            onClick={() => editor?.chain().focus().unsetLink().run()}
            disabled={!editor || disabled}
          />
        )}

        <ToolbarDivider />

        {/* Grup 5: Undo / Redo */}
        <ToolbarButton
          icon={Undo2}
          label="Urungkan (Undo)"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo() || disabled}
        />
        <ToolbarButton
          icon={Redo2}
          label="Ulangi (Redo)"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo() || disabled}
        />
      </div>

      {/* Editor Content Area */}
      <div className="relative flex-1">
        <EditorContent editor={editor} />
      </div>

      {/* Global CSS tipografi placeholder untuk Tiptap */}
      <style jsx global>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgb(113 113 122); /* zinc-500 */
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
