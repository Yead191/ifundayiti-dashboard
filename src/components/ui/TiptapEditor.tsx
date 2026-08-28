import { useEffect, type ReactNode } from "react";
import { Button, ColorPicker, Select, Tooltip } from "antd";
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
} from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { FontSize } from "./tiptapFontSize";
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
  "#eef0fb",
  "#ffffff",
  "#b794f6",
  "#f5b544",
  "#5bda8b",
  "#60a5fa",
  "#f87171",
  "#c9cee8",
];

const HIGHLIGHT_COLORS = [
  "#8131F0",
  "#f5b544",
  "#5bda8b",
  "#60a5fa",
  "#f87171",
  "#23274f",
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
  ];
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  disabled,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

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

  if (!editor) return null;

  const textStyle = editor.getAttributes("textStyle");
  const currentFontSize = (textStyle.fontSize as string | undefined) ?? "";
  const currentFontFamily = editor.getAttributes("textStyle").fontFamily ?? "";
  const currentColor = editor.getAttributes("textStyle").color ?? "#eef0fb";
  const currentHighlight = editor.getAttributes("highlight").color ?? "transparent";

  const toolBtn = (
    active: boolean,
    onClick: () => void,
    icon: ReactNode,
    title: string
  ) => (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "h-8! w-8! min-w-8!",
          active
            ? "bg-violet-600/25! text-violet-glow!"
            : "text-mist-400! hover:bg-white/5! hover:text-cloud-100!"
        )}
        icon={icon}
      />
    </Tooltip>
  );

  const selectClass = "tiptap-toolbar-select w-28!";

  return (
    <div
      className={cn(
        "tiptap-editor-dark overflow-hidden rounded-2xl border border-navy-700/70 bg-navy-900/60",
        disabled && "opacity-70",
        className
      )}
    >
      <div className="space-y-1 border-b border-navy-700/60 bg-navy-800/50 px-2 py-2">
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
          <span className="mx-1 h-5 w-px bg-navy-600/80" />
          {toolBtn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <BoldOutlined />, "Bold")}
          {toolBtn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <ItalicOutlined />, "Italic")}
          {toolBtn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineOutlined />, "Underline")}
          {toolBtn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <StrikethroughOutlined />, "Strikethrough")}
          {toolBtn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), <CodeOutlined />, "Inline code")}
          <span className="mx-1 h-5 w-px bg-navy-600/80" />
          <Tooltip title="Text color">
            <ColorPicker
              disabled={disabled}
              value={currentColor}
              presets={[{ label: "Colors", colors: TEXT_COLORS }]}
              onChange={(_: AntColor, hex) => editor.chain().focus().setColor(hex).run()}
            >
              <Button
                type="text"
                size="small"
                disabled={disabled}
                className="h-8! w-8! min-w-8! text-mist-400! hover:bg-white/5! hover:text-cloud-100!"
                icon={<FontColorsOutlined />}
              />
            </ColorPicker>
          </Tooltip>
          <Tooltip title="Highlight color">
            <ColorPicker
              disabled={disabled}
              value={currentHighlight === "transparent" ? "#23274f" : currentHighlight}
              presets={[{ label: "Highlights", colors: HIGHLIGHT_COLORS.filter((c) => c !== "transparent") }]}
              onChange={(_: AntColor, hex) => editor.chain().focus().toggleHighlight({ color: hex }).run()}
            >
              <Button
                type="text"
                size="small"
                disabled={disabled}
                className="h-8! w-8! min-w-8! text-mist-400! hover:bg-white/5! hover:text-cloud-100!"
                icon={<BgColorsOutlined />}
              />
            </ColorPicker>
          </Tooltip>
          <span className="mx-1 h-5 w-px bg-navy-600/80" />
          {toolBtn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <span className="text-xs font-bold">H1</span>, "Heading 1")}
          {toolBtn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span className="text-xs font-bold">H2</span>, "Heading 2")}
          {toolBtn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <span className="text-xs font-bold">H3</span>, "Heading 3")}
        </div>

        <div className="flex flex-wrap items-center gap-0.5">
          {toolBtn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeftOutlined />, "Align left")}
          {toolBtn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenterOutlined />, "Align center")}
          {toolBtn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRightOutlined />, "Align right")}
          {toolBtn(editor.isActive({ textAlign: "justify" }), () => editor.chain().focus().setTextAlign("justify").run(), <MenuOutlined />, "Justify")}
          <span className="mx-1 h-5 w-px bg-navy-600/80" />
          {toolBtn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <UnorderedListOutlined />, "Bullet list")}
          {toolBtn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <OrderedListOutlined />, "Numbered list")}
          {toolBtn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <BlockOutlined />, "Blockquote")}
          {toolBtn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), <CodeOutlined />, "Code block")}
          {toolBtn(false, () => editor.chain().focus().setHorizontalRule().run(), <MinusOutlined />, "Divider")}
          {toolBtn(editor.isActive("link"), setLink, <LinkOutlined />, "Link")}
          <span className="mx-1 h-5 w-px bg-navy-600/80" />
          {toolBtn(false, () => editor.chain().focus().undo().run(), <UndoOutlined />, "Undo")}
          {toolBtn(false, () => editor.chain().focus().redo().run(), <RedoOutlined />, "Redo")}
          {toolBtn(false, () => editor.chain().focus().clearNodes().unsetAllMarks().run(), <ClearOutlined />, "Clear formatting")}
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
