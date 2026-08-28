import type { ReactNode } from "react";
import { Button, Image, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FilePdfOutlined,
  ShopOutlined,
  BookOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import { toFileUrl } from "@/config";
import {
  isDigitalDetails,
  isInStock,
  type ApiBook,
} from "@/redux/features/store/store.types";
import { normalizeStockStatus, stockStatusLabelMap, stockStatusToneMap } from "../statusMaps";

export function ProductDetailModal({
  product,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  product: ApiBook | null;
  open: boolean;
  onClose: () => void;
  onEdit: (product: ApiBook) => void;
  onDelete: (product: ApiBook) => void;
}) {
  if (!product) return null;

  const accent = product.accent ?? ["#8131f0", "#4a1c8a"];
  const accentFrom = accent[0] ?? "#8131f0";
  const accentTo = accent[1] ?? "#4a1c8a";
  const stock = normalizeStockStatus(product.details.status, product.details.inStock);
  const inStock = isInStock(product.details);
  const fileUrl = product.file ? toFileUrl(product.file) : undefined;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnHidden
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${accentFrom}55, transparent 55%), radial-gradient(ellipse at 90% 20%, ${accentTo}40, transparent 50%)`,
          }}
        />

        <div className="relative grid gap-0 md:grid-cols-[240px_1fr]">
          <div className="relative p-5 md:p-6">
            <div
              className="overflow-hidden rounded-2xl p-[2px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]"
              style={{ background: `linear-gradient(145deg, ${accentFrom}, ${accentTo})` }}
            >
              <div className="overflow-hidden rounded-[14px] bg-navy-900">
                <Image
                  src={getImageUrl(product.image)}
                  alt={product.title}
                  width="100%"
                  height={280}
                  className="object-cover!"
                  style={{ objectFit: "cover", display: "block" }}
                  preview={{ mask: "Preview" }}
                />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col px-5 pb-5 pt-5 md:pl-0 md:pr-7 md:pt-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusTag tone={product.type === "digital" ? "violet" : "info"} icon={product.type === "digital" ? <BookOutlined /> : <ShopOutlined />}>
                {product.type === "digital" ? "Digital" : "Office"}
              </StatusTag>
              <StatusTag tone={stockStatusToneMap[stock] ?? "neutral"}>
                {stockStatusLabelMap[stock] ?? stock}
              </StatusTag>
            </div>

            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-cloud-100">
              {product.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-mist-400">{product.subtitle}</p>

            <div className="mt-4 flex items-end gap-2">
              <span
                className="font-display text-3xl font-semibold tracking-tight"
                style={{ color: inStock ? "#eef0fb" : "#9ca3c9" }}
              >
                {formatCurrency(product.price)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-mist-300">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-5 py-5 md:px-7">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-mist-600">
          Product details
        </div>

        {isDigitalDetails(product.details) ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Publisher" value={product.details.publisher || "—"} />
            <Metric label="First published" value={product.details.firstPublish || "—"} />
            <Metric label="Edition" value={product.details.edition || "—"} />
            <Metric label="Stock" value={stockStatusLabelMap[stock] ?? stock} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Material" value={product.details.material || "—"} />
            <Metric label="Dimensions" value={product.details.dimensions || "—"} />
            <Metric label="Weight" value={product.details.weight || "—"} />
            <Metric label="Stock" value={stockStatusLabelMap[stock] ?? stock} />
          </div>
        )}

        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-600/25 bg-violet-600/10 px-4 py-3 transition hover:border-violet-600/45 hover:bg-violet-600/15"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 text-violet-glow">
              <FilePdfOutlined className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-cloud-100">Digital file</div>
              <div className="truncate text-xs text-mist-400">{product.file}</div>
            </div>
            <LinkOutlined className="text-mist-500" />
          </a>
        )}

        <div className="mt-4 text-xs text-mist-600">
          Last updated {formatDate(product.updatedAt)}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-navy-700/60 bg-navy-900/50 px-5 py-4 sm:flex-row sm:justify-end md:px-7">
        <Button onClick={onClose}>Close</Button>
        <Button icon={<EditOutlined />} onClick={() => onEdit(product)}>
          Edit product
        </Button>
        <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(product)}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="text-[11px] text-mist-600">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-cloud-100">{value}</div>
    </div>
  );
}
