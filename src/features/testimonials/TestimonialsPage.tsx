import { useEffect, useState } from "react";
import { Avatar, Button, Pagination, Skeleton, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import {
  useCreateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetTestimonialsQuery,
  useUpdateTestimonialMutation,
} from "@/redux/features/testimonials/testimonialsApi";
import { buildTestimonialFormData } from "@/redux/features/testimonials/buildTestimonialFormData";
import type {
  ApiTestimonial,
  TestimonialFormPayload,
} from "@/redux/features/testimonials/testimonials.types";
import { TestimonialFormModal } from "./components/TestimonialFormModal";
import { TestimonialDetailModal } from "./components/TestimonialDetailModal";
import { Quote } from "lucide-react";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function TestimonialsPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiTestimonial | null>(null);
  const [viewing, setViewing] = useState<ApiTestimonial | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const { data, isFetching, isLoading } = useGetTestimonialsQuery({
    page,
    limit,
    searchTerm,
  });

  const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  const testimonials = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiTestimonial>(async (record) => {
    const promise = deleteTestimonial(record._id)
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: `Removing ${record.name}'s testimonial…`,
      success: `Testimonial from ${record.name} was removed.`,
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: ApiTestimonial) => {
    setEditing(item);
    setFormOpen(true);
    setViewing(null);
  };

  const handleSubmit = async (payload: TestimonialFormPayload) => {
    const body = buildTestimonialFormData(payload);
    try {
      if (editing) {
        await updateTestimonial({ id: editing._id, body }).unwrap();
        toast.success("Testimonial updated", {
          description: `${payload.name}'s quote has been saved.`,
        });
      } else {
        await createTestimonial(body).unwrap();
        toast.success("Testimonial published", {
          description: `${payload.name}'s story is now live on the site.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update testimonial" : "Couldn't create testimonial", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <CommentOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Client testimonials</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Curate the quotes that appear on the Hubology website — real voices, clear attribution,
              and polished portraits.
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New testimonial
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search by name, company, or quote…"
          value={search}
          onChange={setSearch}
          className="sm:w-80!"
        />
        <div className="text-xs text-mist-600">
          {pagination?.total ?? 0} testimonial{(pagination?.total ?? 0) === 1 ? "" : "s"}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-navy-700/60 bg-navy-800/30 p-5">
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
              <div className="mt-4 flex items-center gap-3">
                <Skeleton.Avatar active size={44} shape="square" />
                <Skeleton active paragraph={false} title={{ width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : !isFetching && testimonials.length === 0 ? (
        <EmptyState
          icon={<Quote />}
          title="No testimonials yet"
          description="Publish your first client quote to build trust on the marketing site."
          actionLabel="New testimonial"
          onAction={openCreate}
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
              isFetching && "opacity-70 transition-opacity"
            )}
          >
            {testimonials.map((item) => (
              <TestimonialCard
                key={item._id}
                testimonial={item}
                onView={() => setViewing(item)}
                onEdit={() => openEdit(item)}
                onDelete={() => deleteFlow.request(item)}
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

      <TestimonialFormModal
        open={formOpen}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <TestimonialDetailModal
        testimonial={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={(item) => {
          setViewing(null);
          deleteFlow.request(item);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete ${deleteFlow.target?.name}'s testimonial?`}
        description="This removes the quote from the website immediately. This can't be undone."
        confirmLabel="Delete testimonial"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}

function TestimonialCard({
  testimonial,
  onView,
  onEdit,
  onDelete,
}: {
  testimonial: ApiTestimonial;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-700/70 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_16px_40px_-28px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-600/35 hover:shadow-[0_24px_50px_-24px_rgba(129,49,240,0.45)]">
      <button type="button" onClick={onView} className="relative flex flex-1 flex-col p-5 text-left">
        <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-violet-600/15 blur-2xl transition group-hover:bg-violet-600/25" />

        <div className="relative mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/15 text-violet-glow">
          <Quote />
        </div>

        <p className="relative line-clamp-5 flex-1 text-sm leading-relaxed text-mist-300">
          <span className="text-violet-glow/70">“</span>
          {testimonial.quote}
          <span className="text-violet-glow/70">”</span>
        </p>

        <div className="relative mt-5 flex items-center gap-3 border-t border-navy-700/50 pt-4">
          <div className="rounded-xl bg-linear-to-br from-violet-600/40 to-violet-900/30 p-[1.5px]">
            <Avatar
              src={getImageUrl(testimonial.image)}
              icon={<UserOutlined />}
              size={44}
              className="rounded-[10px]! bg-navy-800!"
              shape="square"
            />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-semibold text-cloud-100 transition group-hover:text-violet-glow">
              {testimonial.name}
            </div>
            <div className="truncate text-xs text-mist-500">
              {testimonial.role}
              {testimonial.company ? ` · ${testimonial.company}` : ""}
            </div>
          </div>
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
