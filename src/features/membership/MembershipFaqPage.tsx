import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Skeleton, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { cn } from "@/lib/utils";
import {
  useCreateFaqMutation,
  useDeleteFaqMutation,
  useGetFaqsQuery,
  useUpdateFaqMutation,
} from "@/redux/features/faq/faqApi";
import type { ApiFaq, FaqAudience, FaqPayload } from "@/redux/features/faq/faq.types";
import { FaqFormModal } from "./components/FaqFormModal";
import { FaqDetailModal } from "./components/FaqDetailModal";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function useAudienceCount(audience: FaqAudience) {
  const { data } = useGetFaqsQuery({ audience });
  return data?.data?.length ?? 0;
}

export default function MembershipFaqPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [audience, setAudience] = useState<FaqAudience>("USER");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiFaq | null>(null);
  const [viewing, setViewing] = useState<ApiFaq | null>(null);

  const userCount = useAudienceCount("USER");
  const vendorCount = useAudienceCount("VENDOR");

  const { data, isFetching, isLoading } = useGetFaqsQuery({ audience });

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const faqs = data?.data ?? [];

  const filteredFaqs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)
    );
  }, [faqs, searchTerm]);

  useEffect(() => {
    setExpandedId(null);
    setViewing(null);
    setEditing(null);
    setFormOpen(false);
  }, [audience]);

  const deleteFlow = useConfirmDelete<ApiFaq>(async (record) => {
    const promise = deleteFaq({ id: record._id, audience: record.audience })
      .unwrap()
      .then(() => {
        setViewing((prev) => (prev?._id === record._id ? null : prev));
        setExpandedId((prev) => (prev === record._id ? null : prev));
      });

    toast.promise(promise, {
      loading: "Removing FAQ…",
      success: "FAQ deleted.",
      error: (err) => getErrorMessage(err),
    });

    await promise.catch(() => undefined);
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (faq: ApiFaq) => {
    setEditing(faq);
    setFormOpen(true);
    setViewing(null);
  };

  const handleSubmit = async (payload: FaqPayload) => {
    try {
      if (editing) {
        await updateFaq({ id: editing._id, body: payload }).unwrap();
        toast.success("FAQ updated", { description: "Your changes have been saved." });
      } else {
        await createFaq(payload).unwrap();
        toast.success("FAQ added", { description: "The new question is live for this audience." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update FAQ" : "Couldn't create FAQ", {
        description: getErrorMessage(error),
      });
    }
  };

  const tabItems = [
    { key: "USER", label: "User", count: userCount, icon: UserOutlined },
    { key: "VENDOR", label: "Vendor", count: vendorCount, icon: TeamOutlined },
  ] as const;

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <QuestionCircleOutlined className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">Membership FAQ</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">
              Manage the questions and answers shown on membership pages — separate sets for users
              and vendors.
            </p>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New FAQ
        </Button>
      </div>

      <GlassCard flat className="mb-4" padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs
            activeKey={audience}
            onChange={(key) => setAudience(key as FaqAudience)}
            items={tabItems.map((tab) => ({
              key: tab.key,
              label: (
                <span className="flex items-center gap-2">
                  <tab.icon />
                  {tab.label}
                  <Badge
                    count={tab.count}
                    showZero
                    overflowCount={999}
                    style={{
                      backgroundColor: audience === tab.key ? "#8131F0" : "#23274f",
                      color: audience === tab.key ? "#fff" : "#9ca3c9",
                      boxShadow: "none",
                    }}
                  />
                </span>
              ),
            }))}
          />
        </div>

        <div className="border-t border-navy-700/60 p-4 md:px-5">
          <SearchInput
            placeholder="Search questions or answers…"
            value={search}
            onChange={setSearch}
            className="sm:w-80!"
          />
        </div>
      </GlassCard>

      <GlassCard flat>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 2 }} title={{ width: "70%" }} />
            ))}
          </div>
        ) : !isFetching && filteredFaqs.length === 0 ? (
          <EmptyState
            icon={<QuestionCircleOutlined />}
            title={`No ${audience === "USER" ? "user" : "vendor"} FAQs yet`}
            description={
              searchTerm
                ? "No matches for your search. Try different keywords."
                : "Add the first question to help members understand your plans."
            }
            actionLabel="New FAQ"
            onAction={openCreate}
          />
        ) : (
          <div className={cn("space-y-3", isFetching && "opacity-70 transition-opacity")}>
            {filteredFaqs.map((faq, index) => {
              const expanded = expandedId === faq._id;
              return (
                <article
                  key={faq._id}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition duration-300",
                    expanded
                      ? "border-violet-600/35 bg-linear-to-b from-[#171b3a] to-[#10132c] shadow-[0_16px_40px_-28px_rgba(129,49,240,0.45)]"
                      : "border-navy-700/70 bg-navy-800/25 hover:border-violet-600/25"
                  )}
                >
                  <div className="flex items-start gap-3 p-4 md:p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 font-display text-sm font-semibold text-violet-glow">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setExpandedId(expanded ? null : faq._id)}
                    >
                      <h3 className="font-display text-[15px] font-semibold text-cloud-100 transition group-hover:text-violet-glow">
                        {faq.question}
                      </h3>
                      {!expanded && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-mist-500">{faq.answer}</p>
                      )}
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Tooltip title="View details">
                        <Button
                          type="text"
                          size="small"
                          className="text-mist-400! hover:bg-violet-600/15! hover:text-violet-glow!"
                          icon={<EyeOutlined />}
                          onClick={() => setViewing(faq)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEdit(faq)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteFlow.request(faq)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                  {expanded && (
                    <div className="border-t border-navy-700/60 px-4 pb-4 pt-3 md:px-5 md:pb-5">
                      <p className="text-sm leading-relaxed text-mist-300">{faq.answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </GlassCard>

      <FaqFormModal
        open={formOpen}
        audience={audience}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <FaqDetailModal
        faq={viewing}
        open={!!viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={(faq) => {
          setViewing(null);
          deleteFlow.request(faq);
        }}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title="Delete this FAQ?"
        description="This removes the question from the membership page immediately. This can't be undone."
        confirmLabel="Delete FAQ"
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
