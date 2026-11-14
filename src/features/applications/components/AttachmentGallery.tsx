import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  CloseOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { toFileUrl } from "@/config";
import type { APIApplicationDocument } from "@/redux/features/applications/applicationsApi";

type FileKind = "image" | "pdf" | "file";
type SectionName = "Documents" | "Project gallery";

type Attachment = {
  key: string;
  index: number;
  label: string;
  filename: string;
  src?: string;
  kind: FileKind;
  section: SectionName;
};

const DOCUMENT_LABELS: Record<string, string> = {
  nid_card: "National ID Card",
  government_id: "Government ID",
  proof_of_address: "Proof of Address",
  business_plan: "Business Plan Proposal",
  supporting_image: "Supporting Project Photo",
  supporting_document: "Supporting Attachment",
  supporting_documents: "Supporting Document",
};

function documentLabel(type: string) {
  return (
    DOCUMENT_LABELS[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function fileKind(url: string): FileKind {
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp)$/.test(clean)) return "image";
  if (clean.endsWith(".pdf")) return "pdf";
  return "file";
}

function filenameOf(url: string) {
  const raw = url.split("?")[0].split("/").pop() || "file";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function buildAttachments(
  documents: APIApplicationDocument[] | undefined,
  gallery: string[] | undefined,
): Attachment[] {
  const docs = (documents ?? []).map((doc, index) => ({
    key: doc._id || `doc-${index}`,
    index: 0,
    label: documentLabel(doc.type),
    filename: filenameOf(doc.url),
    src: toFileUrl(doc.url),
    kind: fileKind(doc.url),
    section: "Documents" as const,
  }));

  const photos = (gallery ?? []).map((url, index) => ({
    key: `gallery-${index}`,
    index: 0,
    label: `Project photo ${index + 1}`,
    filename: filenameOf(url),
    src: toFileUrl(url),
    kind: fileKind(url) === "pdf" ? ("pdf" as const) : ("image" as const),
    section: "Project gallery" as const,
  }));

  return [...docs, ...photos].map((item, index) => ({ ...item, index }));
}

export function AttachmentGallery({
  documents,
  gallery,
}: {
  documents?: APIApplicationDocument[];
  gallery?: string[];
}) {
  const items = useMemo(
    () => buildAttachments(documents, gallery),
    [documents, gallery],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeViewer = useCallback(() => setActiveIndex(null), []);
  const documentItems = items.filter((item) => item.section === "Documents");
  const galleryItems = items.filter((item) => item.section === "Project gallery");

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-3 border-b border-navy-700/40 pb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-violet-600">
            Application Materials & Attachments
          </h3>
          <p className="mt-1 text-xs text-mist-500">
            Previews stay visible. Open any file for a full-screen review.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-violet-600/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600">
          {items.length} {items.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="space-y-6">
        <AttachmentSection
          title="Documents"
          items={documentItems}
          empty="No documents attached"
          onOpen={setActiveIndex}
        />
        <AttachmentSection
          title="Project gallery"
          items={galleryItems}
          empty="No gallery images uploaded"
          onOpen={setActiveIndex}
        />
      </div>

      {activeIndex !== null && items[activeIndex] && (
        <AttachmentLightbox
          items={items}
          index={activeIndex}
          onIndex={setActiveIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
}

function AttachmentSection({
  title,
  items,
  empty,
  onOpen,
}: {
  title: string;
  items: Attachment[];
  empty: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-wider text-mist-500">
          {title}
        </div>
        <span className="text-[10px] font-medium text-mist-400">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy-700/80 bg-white/40 px-4 py-6 text-center text-xs text-mist-400">
          {empty}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {items.map((item) => (
            <PreviewTile key={item.key} item={item} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewTile({
  item,
  onOpen,
}: {
  item: Attachment;
  onOpen: (index: number) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.index)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item.index);
        }
      }}
      className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-2xl border border-navy-700/70 bg-[#f4f7f5] text-left shadow-xs outline-none transition duration-300 hover:-translate-y-0.5 hover:border-violet-600/35 hover:shadow-[0_16px_40px_-24px_rgba(11,61,46,0.65)] focus-visible:ring-2 focus-visible:ring-violet-600"
    >
      <TileMedia item={item} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/80 to-transparent" />
      <div className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
        {item.kind === "pdf" ? "PDF" : item.kind === "image" ? "Photo" : "File"}
      </div>
      <div className="pointer-events-none absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-violet-600 opacity-0 shadow-sm transition duration-200 group-hover:opacity-100">
        <span className="text-[11px] font-bold leading-none">↗</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <div className="truncate text-[13px] font-semibold text-white">
          {item.label}
        </div>
        <div className="truncate font-mono text-[10px] text-white/70">
          {item.filename}
        </div>
      </div>
    </div>
  );
}

function TileMedia({ item }: { item: Attachment }) {
  if (item.kind === "image") {
    const cover = item.section === "Project gallery";
    return (
      <PreviewImage
        src={item.src}
        alt={item.label}
        className={
          cover
            ? "h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
            : "h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
        }
      />
    );
  }

  if (item.kind === "pdf" && item.src) {
    return (
      <iframe
        src={`${item.src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        title={item.label}
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none h-full w-full border-0 bg-white"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#eef3f0] text-mist-400">
      <FileOutlined className="text-4xl" />
    </div>
  );
}

function PreviewImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#eef3f0] text-mist-400">
        <FileImageOutlined className="text-4xl" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function AttachmentLightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: Attachment[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const total = items.length;
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    frameRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (total < 2) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        onIndex((indexRef.current + step + total) % total);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onIndex, total]);

  useEffect(() => {
    const active = railRef.current?.querySelector<HTMLElement>(
      "[data-active='true']",
    );
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [index]);

  if (!item) return null;

  return createPortal(
    <div
      ref={frameRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex flex-col bg-[#04110c]/92 text-white outline-none backdrop-blur-md"
    >
      <header
        className="relative z-20 flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            {item.section}
          </div>
          <h4 className="truncate font-display text-base font-semibold text-white sm:text-lg">
            {item.label}
          </h4>
          <p className="truncate font-mono text-[11px] text-white/45">
            {item.filename}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 sm:inline">
            {index + 1} / {total}
          </span>
          {item.src && (
            <a
              href={item.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <DownloadOutlined />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
          <button
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <CloseOutlined />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-4 sm:px-20">
        {total > 1 && (
          <>
            <LightboxArrow
              label="Previous attachment"
              className="left-3 sm:left-6"
              onClick={() => onIndex((index + total - 1) % total)}
            >
              <LeftOutlined />
            </LightboxArrow>
            <LightboxArrow
              label="Next attachment"
              className="right-3 sm:right-6"
              onClick={() => onIndex((index + 1) % total)}
            >
              <RightOutlined />
            </LightboxArrow>
          </>
        )}

        <div
          className="flex max-h-full max-w-full items-center justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <LightboxStage item={item} />
        </div>
      </div>

      <footer
        className="relative z-20 px-4 pb-4 sm:px-6 sm:pb-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-2.5 flex items-center justify-between text-[11px] text-white/40">
          <span className="sm:hidden">
            {index + 1} / {total}
          </span>
          <span className="hidden sm:inline">
            Click outside to close · arrows to move between files
          </span>
          <span className="hidden sm:inline">{item.kind.toUpperCase()}</span>
        </div>
        {total > 1 && (
          <div
            ref={railRef}
            className="flex gap-2 overflow-x-auto pb-1"
          >
            {items.map((thumb) => {
              const active = thumb.index === index;
              return (
                <button
                  key={thumb.key}
                  type="button"
                  data-active={active ? "true" : "false"}
                  aria-label={thumb.label}
                  onClick={() => onIndex(thumb.index)}
                  className={`relative h-14 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border transition ${
                    active
                      ? "border-white ring-2 ring-white/80"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <RailThumb item={thumb} />
                </button>
              );
            })}
          </div>
        )}
      </footer>
    </div>,
    document.body,
  );
}

function LightboxArrow({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-black/40 text-base text-white shadow-lg backdrop-blur-md transition hover:bg-white hover:text-[#04110c] ${className}`}
    >
      {children}
    </button>
  );
}

function LightboxStage({ item }: { item: Attachment }) {
  if (item.kind === "image") {
    return (
      <PreviewImage
        src={item.src}
        alt={item.label}
        className="max-h-[calc(100vh-210px)] max-w-[min(1180px,calc(100vw-8rem))] rounded-2xl object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10"
      />
    );
  }

  if (item.kind === "pdf" && item.src) {
    return (
      <iframe
        key={item.src}
        src={item.src}
        title={item.label}
        className="h-[calc(100vh-210px)] w-[min(980px,calc(100vw-8.5rem))] rounded-2xl border-0 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]"
      />
    );
  }

  return (
    <div className="flex w-[min(420px,calc(100vw-4rem))] flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center">
      {item.kind === "pdf" ? (
        <FilePdfOutlined className="text-5xl text-red-300" />
      ) : (
        <FileOutlined className="text-5xl text-white/70" />
      )}
      <h5 className="mt-4 font-display text-lg font-semibold">{item.label}</h5>
      <p className="mt-2 text-sm text-white/55">
        This file format does not render inline. Download it to review the
        original.
      </p>
      {item.src && (
        <a
          href={item.src}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#04110c]"
        >
          <DownloadOutlined />
          Download file
        </a>
      )}
    </div>
  );
}

function RailThumb({ item }: { item: Attachment }) {
  if (item.kind === "image") {
    return (
      <PreviewImage
        src={item.src}
        alt=""
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#10241c] text-white/80">
      {item.kind === "pdf" ? <FilePdfOutlined /> : <FileOutlined />}
    </div>
  );
}
