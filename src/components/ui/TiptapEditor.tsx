import { useState, useEffect, type ReactNode } from "react";
import { Button, ColorPicker, Input, Modal, Select, Tooltip } from "antd";
import type { Color as AntColor } from "antd/es/color-picker";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color as TextColor } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  LinkOutlined,
  UndoOutlined,
  RedoOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  FontColorsOutlined,
  BgColorsOutlined,
  CodeOutlined,
  BlockOutlined,
  MinusOutlined,
  ClearOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { FontSize } from "./tiptapFontSize";
import { ImageExtension } from "./tiptapImage";
import "./tiptap-editor.css";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

const FONT_SIZES = [
  { label: "Default", value: "" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
];

const TEXT_COLORS = [
  "#000000",
  "#1f2937",
  "#4b5563",
  "#0b3d2e",
  "#16a34a",
  "#2563eb",
  "#dc2626",
  "#d97706",
];

const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#fed7aa",
  "#e9d5ff",
  "transparent",
];

function buildExtensions(placeholder: string) {
  return [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Underline,
    TextStyle,
    FontSize,
    TextColor,
    Highlight.configure({ multicolor: true }),
    FontFamily,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-violet-glow underline" },
    }),
    Placeholder.configure({ placeholder }),
    ImageExtension,
  ];
}

export function TiptapEditor({
  value = "",
  onChange,
  placeholder = "Start writing…",
  disabled,
  className,
  minHeight,
}: {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number | string;
}) {
  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange?.(current.getHTML()),
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const target = value ?? "";
    if (
      currentHtml !== target &&
      !(target === "" && (currentHtml === "<p></p>" || currentHtml === ""))
    ) {
      editor.commands.setContent(target);
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const handleInsertImage = () => {
    if (!editor || !imageUrl.trim()) return;
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined })
      .run();
    setImageUrl("");
    setImageAlt("");
    setImageModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        if (!imageAlt) {
          setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const [savedSelection, setSavedSelection] = useState<{
    from: number;
    to: number;
  } | null>(null);

  const saveCurrentSelection = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    setSavedSelection({ from, to });
  };

  const handleColorChange = (color: any, css?: string) => {
    if (!editor) return;
    const hex =
      typeof color === "string"
        ? color
        : color?.toHexString?.() || (typeof css === "string" ? css : "");
    if (!hex) return;

    if (savedSelection && savedSelection.from !== savedSelection.to) {
      editor
        .chain()
        .setTextSelection(savedSelection)
        .setColor(hex)
        .run();
    } else {
      editor.chain().focus().setColor(hex).run();
    }
  };

  const handleHighlightChange = (color: any, css?: string) => {
    if (!editor) return;
    const hex =
      typeof color === "string"
        ? color
        : color?.toHexString?.() || (typeof css === "string" ? css : "");
    if (!hex) return;

    if (savedSelection && savedSelection.from !== savedSelection.to) {
      editor
        .chain()
        .setTextSelection(savedSelection)
        .toggleHighlight({ color: hex })
        .run();
    } else {
      editor.chain().focus().toggleHighlight({ color: hex }).run();
    }
  };

  if (!editor) return null;

  const textStyle = editor.getAttributes("textStyle");
  const currentFontSize = (textStyle.fontSize as string | undefined) ?? "";
  const currentFontFamily = editor.getAttributes("textStyle").fontFamily ?? "";
  const currentColor = editor.getAttributes("textStyle").color ?? "#000000";
  const currentHighlight =
    editor.getAttributes("highlight").color ?? "transparent";

  const toolBtn = (
    active: boolean,
    onClick: () => void,
    icon: ReactNode,
    title: string,
  ) => (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "h-8! w-8! min-w-8! rounded-lg! text-mist-600! hover:bg-black/5! hover:text-cloud-100!",
          active && "bg-violet-600/10! text-violet-600! font-semibold",
        )}
        icon={icon}
      />
    </Tooltip>
  );

  const selectClass = "tiptap-toolbar-select w-28!";

  return (
    <div
      style={
        minHeight
          ? ({
              "--tiptap-min-height":
                typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            } as React.CSSProperties)
          : undefined
      }
      className={cn(
        "tiptap-editor-dark overflow-hidden rounded-2xl border border-navy-700/70 bg-white",
        disabled && "opacity-70",
        className,
      )}
    >
      <div className="space-y-1 border-b border-navy-700/60 bg-navy-950/60 px-2 py-2">
        <div className="flex flex-wrap items-center gap-0.5">
          <Select
            size="small"
            disabled={disabled}
            className={selectClass}
            placeholder="Font"
            value={currentFontFamily || undefined}
            options={FONT_FAMILIES}
            onChange={(family) => {
              if (!family) {
                editor.chain().focus().unsetFontFamily().run();
                return;
              }
              editor.chain().focus().setFontFamily(family).run();
            }}
          />
          <Select
            size="small"
            disabled={disabled}
            className="tiptap-toolbar-select w-24!"
            placeholder="Size"
            value={currentFontSize || undefined}
            options={FONT_SIZES}
            onChange={(size) => {
              if (!size) {
                editor.chain().focus().unsetFontSize().run();
                return;
              }
              editor.chain().focus().setFontSize(size).run();
            }}
          />
          <span className="mx-1 h-5 w-px bg-navy-700/80" />
          {toolBtn(
            editor.isActive("bold"),
            () => editor.chain().focus().toggleBold().run(),
            <BoldOutlined />,
            "Bold",
          )}
          {toolBtn(
            editor.isActive("italic"),
            () => editor.chain().focus().toggleItalic().run(),
            <ItalicOutlined />,
            "Italic",
          )}
          {toolBtn(
            editor.isActive("underline"),
            () => editor.chain().focus().toggleUnderline().run(),
            <UnderlineOutlined />,
            "Underline",
          )}
          {toolBtn(
            editor.isActive("strike"),
            () => editor.chain().focus().toggleStrike().run(),
            <StrikethroughOutlined />,
            "Strikethrough",
          )}
          {toolBtn(
            editor.isActive("code"),
            () => editor.chain().focus().toggleCode().run(),
            <CodeOutlined />,
            "Inline code",
          )}
          <span className="mx-1 h-5 w-px bg-navy-700/80" />
          <Tooltip title="Text color">
            <ColorPicker
              disabled={disabled}
              value={currentColor}
              format="hex"
              allowClear
              presets={[{ label: "Colors", colors: TEXT_COLORS }]}
              onOpenChange={(open) => {
                if (open) saveCurrentSelection();
              }}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
              onClear={() => {
                if (savedSelection && savedSelection.from !== savedSelection.to) {
                  editor.chain().setTextSelection(savedSelection).unsetColor().run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
              }}
            >
              <Button
                type="text"
                size="small"
                disabled={disabled}
                onMouseDown={saveCurrentSelection}
                className="h-8! w-8! min-w-8! text-mist-600! hover:bg-black/5! hover:text-cloud-100!"
                icon={<FontColorsOutlined />}
              />
            </ColorPicker>
          </Tooltip>
          <Tooltip title="Highlight color">
            <ColorPicker
              disabled={disabled}
              value={
                currentHighlight === "transparent"
                  ? "#fef08a"
                  : currentHighlight
              }
              format="hex"
              allowClear
              presets={[
                {
                  label: "Highlights",
                  colors: HIGHLIGHT_COLORS.filter((c) => c !== "transparent"),
                },
              ]}
              onOpenChange={(open) => {
                if (open) saveCurrentSelection();
              }}
              onChange={handleHighlightChange}
              onChangeComplete={handleHighlightChange}
              onClear={() => {
                if (savedSelection && savedSelection.from !== savedSelection.to) {
                  editor.chain().setTextSelection(savedSelection).unsetHighlight().run();
                } else {
                  editor.chain().focus().unsetHighlight().run();
                }
              }}
            >
              <Button
                type="text"
                size="small"
                disabled={disabled}
                onMouseDown={saveCurrentSelection}
                className="h-8! w-8! min-w-8! text-mist-600! hover:bg-black/5! hover:text-cloud-100!"
                icon={<BgColorsOutlined />}
              />
            </ColorPicker>
          </Tooltip>
          <span className="mx-1 h-5 w-px bg-navy-700/80" />
          {toolBtn(
            editor.isActive("heading", { level: 1 }),
            () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            <span className="text-xs font-bold">H1</span>,
            "Heading 1",
          )}
          {toolBtn(
            editor.isActive("heading", { level: 2 }),
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            <span className="text-xs font-bold">H2</span>,
            "Heading 2",
          )}
          {toolBtn(
            editor.isActive("heading", { level: 3 }),
            () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            <span className="text-xs font-bold">H3</span>,
            "Heading 3",
          )}
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          {toolBtn(
            editor.isActive({ textAlign: "left" }),
            () => editor.chain().focus().setTextAlign("left").run(),
            <AlignLeftOutlined />,
            "Align left",
          )}
          {toolBtn(
            editor.isActive({ textAlign: "center" }),
            () => editor.chain().focus().setTextAlign("center").run(),
            <AlignCenterOutlined />,
            "Align center",
          )}
          {toolBtn(
            editor.isActive({ textAlign: "right" }),
            () => editor.chain().focus().setTextAlign("right").run(),
            <AlignRightOutlined />,
            "Align right",
          )}
          {toolBtn(
            editor.isActive({ textAlign: "justify" }),
            () => editor.chain().focus().setTextAlign("justify").run(),
            <MenuOutlined />,
            "Justify",
          )}
          <span className="mx-1 h-5 w-px bg-navy-700/80" />
          {toolBtn(
            editor.isActive("bulletList"),
            () => editor.chain().focus().toggleBulletList().run(),
            <UnorderedListOutlined />,
            "Bullet list",
          )}
          {toolBtn(
            editor.isActive("orderedList"),
            () => editor.chain().focus().toggleOrderedList().run(),
            <OrderedListOutlined />,
            "Numbered list",
          )}
          {toolBtn(
            editor.isActive("blockquote"),
            () => editor.chain().focus().toggleBlockquote().run(),
            <BlockOutlined />,
            "Blockquote",
          )}
          {toolBtn(
            editor.isActive("codeBlock"),
            () => editor.chain().focus().toggleCodeBlock().run(),
            <CodeOutlined />,
            "Code block",
          )}
          {toolBtn(
            false,
            () => editor.chain().focus().setHorizontalRule().run(),
            <MinusOutlined />,
            "Divider",
          )}
          {toolBtn(editor.isActive("link"), setLink, <LinkOutlined />, "Link")}
          {toolBtn(
            editor.isActive("image"),
            () => setImageModalOpen(true),
            <PictureOutlined />,
            "Insert image",
          )}
          <span className="mx-1 h-5 w-px bg-navy-700/80" />
          {toolBtn(
            false,
            () => editor.chain().focus().undo().run(),
            <UndoOutlined />,
            "Undo",
          )}
          {toolBtn(
            false,
            () => editor.chain().focus().redo().run(),
            <RedoOutlined />,
            "Redo",
          )}
          {toolBtn(
            false,
            () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
            <ClearOutlined />,
            "Clear formatting",
          )}
        </div>
      </div>

      <EditorContent editor={editor} />

      <Modal
        open={imageModalOpen}
        onCancel={() => {
          setImageModalOpen(false);
          setImageUrl("");
          setImageAlt("");
        }}
        onOk={handleInsertImage}
        okText="Insert Image"
        cancelText="Cancel"
        okButtonProps={{
          disabled: !imageUrl.trim(),
          className: "bg-emerald-600! font-medium",
        }}
        title="Insert Image into Content"
        width={460}
        destroyOnClose
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Upload from Computer
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1.5 block w-full text-xs text-mist-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] uppercase tracking-wider text-mist-400">
              or Web URL
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Image Web URL
            </label>
            <Input
              placeholder="https://example.com/photo.jpg or /uploads/..."
              value={
                imageUrl.startsWith("data:")
                  ? "(Local file selected)"
                  : imageUrl
              }
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 h-9 rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-cloud-100">
              Alt Text / Caption (Optional)
            </label>
            <Input
              placeholder="e.g. Product fabric texture or model view"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="mt-1 h-9 rounded-xl"
            />
          </div>

          {imageUrl && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-center">
              <img
                src={imageUrl}
                alt="Preview"
                className="mx-auto max-h-40 rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
