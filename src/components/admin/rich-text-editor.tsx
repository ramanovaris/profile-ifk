"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Extension } from "@tiptap/core";
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
  Indent as IndentIcon,
  Outdent as OutdentIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

// Ekstensi Indentasi Paragraf, Heading, & Blockquote dengan dukungan Tab, Shift+Tab, dan Backspace
const IndentExtension = Extension.create({
  name: "indent",

  addOptions() {
    return {
      types: ["paragraph", "heading", "blockquote"],
      minLevel: 0,
      maxLevel: 6,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const level = Number(element.getAttribute("data-indent")) || 0;
              return level;
            },
            renderHTML: (attributes) => {
              const level = Number(attributes.indent) || 0;
              if (level <= 0) {
                return {};
              }
              return {
                "data-indent": level,
                style: `margin-left: min(${level * 1.25}rem, 45%);`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          tr = tr.setSelection(selection);
          const { from, to } = selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentLevel = Number(node.attrs.indent) || 0;
              if (currentLevel < this.options.maxLevel) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentLevel + 1,
                });
                changed = true;
              }
            }
          });
          if (changed && dispatch) {
            dispatch(tr);
          }
          return true;
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          tr = tr.setSelection(selection);
          const { from, to } = selection;
          let changed = false;
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentLevel = Number(node.attrs.indent) || 0;
              if (currentLevel > this.options.minLevel) {
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: currentLevel - 1,
                });
                changed = true;
              }
            }
          });
          if (changed && dispatch) {
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.can().sinkListItem("listItem")) {
          this.editor.chain().sinkListItem("listItem").run();
          return true;
        }
        this.editor.chain().indent().run();
        return true;
      },
      "Shift-Tab": () => {
        if (this.editor.can().liftListItem("listItem")) {
          this.editor.chain().liftListItem("listItem").run();
          return true;
        }
        this.editor.chain().outdent().run();
        return true;
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, empty } = selection;
        if (empty && $from.parentOffset === 0) {
          const currentIndent = Number($from.parent.attrs.indent) || 0;
          if (currentIndent > 0) {
            return editor.chain().outdent().run();
          }
        }
        return false;
      },
    };
  },
});

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
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-medium transition-colors outline-none",
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
  return <div className="h-4 w-px shrink-0 bg-white/10 mx-0.5" aria-hidden="true" />;
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
      IndentExtension,
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

  const handleIndent = React.useCallback(() => {
    if (!editor) return;
    if (editor.can().sinkListItem("listItem")) {
      editor.chain().focus().sinkListItem("listItem").run();
    } else {
      editor.chain().focus().indent().run();
    }
  }, [editor]);

  const handleOutdent = React.useCallback(() => {
    if (!editor) return;
    if (editor.can().liftListItem("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();
    } else {
      editor.chain().focus().outdent().run();
    }
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
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-white/10 bg-zinc-900/90 p-1.5 rounded-t-xl backdrop-blur-md overflow-x-auto sm:flex-wrap">
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

        {/* Grup 3: Lists & Indentation */}
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
        <ToolbarButton
          icon={OutdentIcon}
          label="Geser Kiri / Outdent (Shift+Tab)"
          onClick={handleOutdent}
          disabled={!editor || disabled}
        />
        <ToolbarButton
          icon={IndentIcon}
          label="Menjorok ke Dalam / Indent (Tab)"
          onClick={handleIndent}
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
