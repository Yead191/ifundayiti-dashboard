import { useEffect, useState } from "react";
import { Button, Pagination, Skeleton, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BookOutlined,
  ShopOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusTag } from "@/components/ui/StatusTag";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn, formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useCreateBookMutation,
  useDeleteBookMutation,
  useGetBooksQuery,
  useUpdateBookMutation,
} from "@/redux/features/store/storeApi";
import { buildBookFormData } from "@/redux/features/store/buildBookFormData";
import {
  isInStock,
  type ApiBook,
  type BookFormPayload,
  type BookType,
} from "@/redux/features/store/store.types";
import { normalizeStockStatus, stockStatusLabelMap, stockStatusToneMap } from "../statusMaps";
import { ProductFormModal } from "./ProductFormModal";
import { ProductDetailModal } from "./ProductDetailModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export function ProductsCatalog({ type }: { type: BookType }) {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiBook | null>(null);
  const [viewing, setViewing] = useState<ApiBook | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, type]);

  const { data, isFetching, isLoading } = useGetBooksQuery({
    page,
    limit,
    searchTerm,
    type,
  });

  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook] = useDeleteBookMutation();

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const isDigital = type === "digital";

  const deleteFlow = useConfirmDelete<ApiBook>(async (record) => {
    const promise = deleteBook(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Removing ${record.title}…`,
      success: `"${record.title}" was removed from the store.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: ApiBook) => {
    setEditing(product);
    setFormOpen(true);
    setViewing(null);
  };

  const handleSubmit = async (payload: BookFormPayload) => {
    const body = buildBookFormData(payload);
    try {
      if (editing) {
        await updateBook({ id: editing._id, body }).unwrap();
        toast.success("Product updated", { description: `"${payload.title}" has been saved.` });
      } else {
        await createBook(body).unwrap();
        toast.success("Product created", {
          description: `"${payload.title}" is now live in the ${isDigital ? "digital" : "office"} store.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update product" : "Couldn't create product", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder={`Search ${isDigital ? "digital" : "office"} products…`}
          value={search}
          onChange={setSearch}
          className="sm:w-72!"
        />
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-800/30 p-3">
              <Skeleton.Image active className="h-44! w-full! rounded-xl!" />
              <Skeleton active className="mt-3" paragraph={{ rows: 2 }} title={{ width: "60%" }} />
            </div>
          ))}
        </div>
      ) : !isFetching && products.length === 0 ? (
        <EmptyState
          icon={isDigital ? <BookOutlined /> : <ShopOutlined />}
          title={isDigital ? "No digital products yet" : "No office supplies yet"}
          description={
            isDigital
              ? "Add e-books, checklists, or templates for the digital store."
              : "Add premium physical supplies, stationery, or accessories."
          }
          actionLabel="New product"
          onAction={openCreate}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
              isFetching && "opacity-70 transition-opacity"
            )}
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onView={() => setViewing(product)}
                onEdit={() => openEdit(product)}
                onDelete={() => deleteFlow.request(product)}
              />
            ))}
          </div>

          {(pagination?.totalPage ?? 1) > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                current={pagination?.page ?? page}
                pageSize={pagination?.limit ?? limit}
                total={pagination?.total ?? 0}
                showSizeChanger
                pageSizeOptions={["9", "12", "18", "24"]}
                onChange={(nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setLimit(nextPageSize);
                }}
              />
            </div>
          )}
        </>
      )}

      <ProductFormModal
        open={formOpen}
        type={type}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ProductDetailModal
        product={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={(product) => {
          setViewing(null);
          deleteFlow.request(product);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete "${deleteFlow.target?.title}"?`}
        description={`This removes the product from the ${isDigital ? "digital" : "office"} store immediately. This can't be undone.`}
        confirmLabel="Delete product"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: {
  product: ApiBook;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = product.accent ?? ["#8131f0", "#4a1c8a"];
  const accentFrom = accent[0] ?? "#8131f0";
  const accentTo = accent[1] ?? "#4a1c8a";
  const stock = normalizeStockStatus(product.details.status, product.details.inStock);
  const inStock = isInStock(product.details);
  const isDigital = product.type === "digital";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-600/35 hover:shadow-[0_24px_50px_-24px_rgba(129,49,240,0.45)]">
      <button type="button" onClick={onView} className="relative block w-full text-left">
        <div
          className="absolute inset-x-0 top-0 h-28 opacity-50 blur-2xl transition group-hover:opacity-70"
          style={{
            background: `linear-gradient(120deg, ${accentFrom}55, transparent 60%)`,
          }}
        />
        <div className="relative p-3 pb-0">
          <div
            className="overflow-hidden rounded-xl p-[1.5px]"
            style={{
              background: isDigital
                ? `linear-gradient(145deg, ${accentFrom}, ${accentTo})`
                : "linear-gradient(145deg, rgba(129,49,240,0.45), rgba(35,39,79,0.8))",
            }}
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-[10px] bg-navy-900">
              <img
                src={getImageUrl(product.image)}
                alt={product.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#10132c]/90 via-transparent to-transparent" />
              <div className="absolute left-2.5 top-2.5">
                <StatusTag tone={stockStatusToneMap[stock] ?? "neutral"}>
                  {stockStatusLabelMap[stock] ?? stock}
                </StatusTag>
              </div>
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
                <span className="font-display text-lg font-semibold text-white drop-shadow">
                  {formatCurrency(product.price)}
                </span>
                {isDigital && product.file && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2 py-0.5 text-[10px] text-mist-200 backdrop-blur">
                    <FilePdfOutlined /> File
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-3 pt-3.5">
          <h3 className="line-clamp-1 font-display text-[15px] font-semibold text-cloud-100 transition group-hover:text-violet-glow">
            {product.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mist-400">{product.subtitle}</p>
          {!inStock && (
            <p className="mt-2 text-[11px] font-medium text-danger/90">Currently unavailable</p>
          )}
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between border-t border-navy-700/60 px-2 py-1.5">
        <Button
          type="text"
          size="small"
          className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
          icon={<EyeOutlined />}
          onClick={onView}
        >
          Details
        </Button>
        <div className="flex items-center">
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={onEdit} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={onDelete} />
          </Tooltip>
        </div>
      </div>
    </article>
  );
}
