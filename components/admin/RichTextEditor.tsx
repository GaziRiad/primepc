"use client";

import { useEffect } from "react";
import {
  Bold,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Undo2,
} from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeEditorContent = (value: string) => {
  const raw = value.trim();
  if (!raw || /<\/?[a-z][\s\S]*>/i.test(raw)) return raw;

  return raw
    .split(/\n{2,}/)
    .map((paragraph) => {
      const content = escapeHtml(paragraph.trim()).replace(/\n/g, "<br />");
      return content ? `<p>${content}</p>` : "";
    })
    .filter(Boolean)
    .join("");
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: { levels: [3] },
        horizontalRule: false,
        italic: false,
        strike: false,
      }),
    ],
    content: normalizeEditorContent(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "product-rich-text min-h-44 px-4 py-3 outline-none focus-visible:outline-none",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const normalized = normalizeEditorContent(value);
    if (editor.getHTML() !== normalized) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [editor, value]);

  const toolbar = [
    {
      label: "Normal text",
      icon: Pilcrow,
      active: editor?.isActive("paragraph"),
      disabled: !editor,
      action: () => editor?.chain().focus().setParagraph().run(),
    },
    {
      label: "Large text",
      icon: Heading3,
      active: editor?.isActive("heading", { level: 3 }),
      disabled: !editor,
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bold",
      icon: Bold,
      active: editor?.isActive("bold"),
      disabled: !editor?.can().chain().focus().toggleBold().run(),
      action: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      label: "Bullet list",
      icon: List,
      active: editor?.isActive("bulletList"),
      disabled: !editor?.can().chain().focus().toggleBulletList().run(),
      action: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      active: editor?.isActive("orderedList"),
      disabled: !editor?.can().chain().focus().toggleOrderedList().run(),
      action: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Undo",
      icon: Undo2,
      active: false,
      disabled: !editor?.can().chain().focus().undo().run(),
      action: () => editor?.chain().focus().undo().run(),
    },
    {
      label: "Redo",
      icon: Redo2,
      active: false,
      disabled: !editor?.can().chain().focus().redo().run(),
      action: () => editor?.chain().focus().redo().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border bg-white focus-within:border-primary/60 focus-within:ring-3 focus-within:ring-primary/10">
      <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50 px-2 py-2">
        {toolbar.map(({ label, icon: Icon, active, disabled, action }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={label}
            aria-pressed={active || undefined}
            disabled={disabled}
            onClick={action}
            className={cn(active && "bg-primary/10 text-primary")}
          >
            <Icon />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
