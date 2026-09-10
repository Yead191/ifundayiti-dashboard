import { useState, useMemo } from "react";
import { Button, Spin } from "antd";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  OrderedListOutlined,
  ReloadOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetFaqsQuery,
  useDeleteFaqMutation,
  useUpdateFaqMutation,
} from "@/redux/features/faq/faqApi";
import type { IFAQ } from "@/redux/features/faq/faq.types";
import { FaqCategoryCard } from "./components/FaqCategoryCard";
import { FaqCategoryModal } from "./components/FaqCategoryModal";
import { FaqItemModal } from "./components/FaqItemModal";
import { toast } from "sonner";
import { getErrorMessage } from "./faqHelpers";

export default function FaqPage() {
  const { data: faqRes, isLoading, isFetching, refetch } = useGetFaqsQuery();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IFAQ | null>(null);

  // Single Question Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<IFAQ | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Raw data & sorted categories
  const categories = useMemo(() => {
    const list = faqRes?.data ? [...faqRes.data] : [];
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [faqRes?.data]);

  // Derived metrics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const draft = total - active;
    const totalQuestions = categories.reduce(
      (acc, c) => acc + (c.items?.length || 0),
      0,
    );
    return { total, active, draft, totalQuestions };
  }, [categories]);

  // Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: IFAQ) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteFaq(id).unwrap();
      toast.success("FAQ category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete FAQ category", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleOpenAddQuestion = (category: IFAQ) => {
    setTargetCategory(category);
    setEditingItemIndex(null);
    setItemModalOpen(true);
  };

  const handleOpenEditQuestion = (category: IFAQ, index: number) => {
    setTargetCategory(category);
    setEditingItemIndex(index);
    setItemModalOpen(true);
  };

  const handleDeleteQuestion = async (category: IFAQ, index: number) => {
    try {
      const updatedItems = [...(category.items || [])];
      updatedItems.splice(index, 1);

      await updateFaq({
        id: category._id,
        body: { items: updatedItems },
      }).unwrap();

      toast.success("Question removed successfully");
    } catch (error) {
      toast.error("Failed to remove question", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
              <QuestionCircleOutlined className="text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Help & Support
                </span>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  Knowledge Base Directory
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cloud-100 font-display">
                  FAQ Management
                </h1>
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined className={isFetching ? "animate-spin" : ""} />}
                  onClick={() => refetch()}
                  className="text-mist-600 hover:text-[#0B3D2E]"
                  title="Refresh FAQs"
                />
              </div>
              <p className="mt-1 max-w-2xl text-sm text-mist-600 leading-relaxed">
                Create, organize, and curate categorized questions and answers displayed across the public storefront.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateCategory}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold shadow-sm px-5 border-0"
            >
              Create FAQ Category
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Top Metrics Cards (Clean, High-contrast, Polished) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Categories */}
        <div className="rounded-2xl border border-gray-100 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <OrderedListOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-cloud-100 font-display">
            {stats.total}
          </p>
          <span className="mt-0.5 block text-xs text-mist-600">
            Grouped question headers
          </span>
        </div>

        {/* Published Categories */}
        <div className="rounded-2xl border border-emerald-100/80 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Published on Site
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <CheckCircleOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-700 font-display">
            {stats.active}
          </p>
          <span className="mt-0.5 block text-xs text-emerald-800/80 font-medium">
            Active on public website
          </span>
        </div>

        {/* Draft Categories */}
        <div className="rounded-2xl border border-amber-100/80 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Draft / Hidden
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50">
              <StopOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-amber-700 font-display">
            {stats.draft}
          </p>
          <span className="mt-0.5 block text-xs text-amber-800/80 font-medium">
            Not visible to public
          </span>
        </div>

        {/* Total Questions */}
        <div className="rounded-2xl border border-gray-100 bg-white/95 p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Q&A Pairs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B3D2E]/10 text-[#0B3D2E]">
              <BookOutlined />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-cloud-100 font-display">
            {stats.totalQuestions}
          </p>
          <span className="mt-0.5 block text-xs text-mist-600">
            Answers across all categories
          </span>
        </div>
      </div>

      {/* Main Categories List Section */}
      {isLoading ? (
        <GlassCard className="flex h-64 items-center justify-center">
          <Spin size="large" />
        </GlassCard>
      ) : categories.length === 0 ? (
        <GlassCard className="p-10">
          <EmptyState
            icon={<QuestionCircleOutlined className="text-4xl text-emerald-800" />}
            title="No FAQ Categories Found"
            description="Create your first FAQ category to organize answers for your website visitors."
            actionLabel="Create FAQ Category"
            onAction={handleOpenCreateCategory}
          />
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <FaqCategoryCard
              key={category._id}
              category={category}
              onEditCategory={handleOpenEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddQuestion={handleOpenAddQuestion}
              onEditQuestion={handleOpenEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      {/* Category Creation / Editing Modal */}
      <FaqCategoryModal
        open={categoryModalOpen}
        category={editingCategory}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
      />

      {/* Single Question Adding / Editing Modal */}
      <FaqItemModal
        open={itemModalOpen}
        category={targetCategory}
        itemIndex={editingItemIndex}
        onClose={() => {
          setItemModalOpen(false);
          setTargetCategory(null);
          setEditingItemIndex(null);
        }}
      />
    </div>
  );
}
