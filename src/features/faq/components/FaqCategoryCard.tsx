import { useState } from "react";
import { Switch, Button, Popconfirm } from "antd";
import {
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  CheckCircleFilled,
  MinusCircleFilled,
} from "@ant-design/icons";
import type { IFAQ } from "@/redux/features/faq/faq.types";
import { useUpdateFaqMutation } from "@/redux/features/faq/faqApi";
import { toast } from "sonner";
import { getErrorMessage } from "../faqHelpers";

interface FaqCategoryCardProps {
  category: IFAQ;
  onEditCategory: (category: IFAQ) => void;
  onDeleteCategory: (id: string) => void;
  onAddQuestion: (category: IFAQ) => void;
  onEditQuestion: (category: IFAQ, index: number) => void;
  onDeleteQuestion: (category: IFAQ, index: number) => void;
  isDeleting?: boolean;
}

export function FaqCategoryCard({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  isDeleting,
}: FaqCategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [updateFaq, { isLoading: isTogglingStatus }] = useUpdateFaqMutation();

  const handleToggleStatus = async (checked: boolean) => {
    try {
      await updateFaq({
        id: category._id,
        body: { isActive: checked },
      }).unwrap();
      toast.success(
        checked
          ? `"${category.title}" is now published on the website`
          : `"${category.title}" moved to draft (hidden from website)`,
      );
    } catch (error) {
      toast.error("Failed to update status", {
        description: getErrorMessage(error),
      });
    }
  };

  const items = category.items || [];

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Category Header */}
      <div className="p-5 sm:p-6 bg-white flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Priority Badge, Category Title, Count, Status */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* Order Priority Pill */}
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 border border-[#0B3D2E]/20 text-xs font-bold text-[#0B3D2E] shadow-2xs"
            title="Display priority (lower appears first on storefront)"
          >
            #{category.order ?? 0}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display text-lg sm:text-xl font-bold text-cloud-100 truncate">
                {category.title}
              </h3>

              {/* Question Count Badge */}
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
                {items.length} {items.length === 1 ? "Question" : "Questions"}
              </span>

              {/* Status Badge */}
              {category.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircleFilled className="text-emerald-600 text-[10px]" />
                  <span>Published</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                  <MinusCircleFilled className="text-amber-600 text-[10px]" />
                  <span>Draft</span>
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-mist-600">
              Order Priority:{" "}
              <span className="font-semibold text-cloud-100">
                #{category.order ?? 0}
              </span>{" "}
              ·{" "}
              {category.isActive ? (
                <span className="text-emerald-700 font-medium">
                  Visible to public visitors
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  Hidden from public storefront
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions, Status Switch, Expand Toggle */}
        <div className="flex items-center gap-2.5 self-end lg:self-center flex-wrap">
          {/* Active Switch */}
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5">
            <span className="text-xs font-medium text-gray-700">
              {category.isActive ? "Active" : "Draft"}
            </span>
            <Switch
              checked={category.isActive}
              loading={isTogglingStatus}
              onChange={handleToggleStatus}
              size="small"
              className="bg-emerald-600!"
            />
          </div>

          {/* Add Question Button */}
          <Button
            size="middle"
            icon={<PlusOutlined />}
            onClick={() => onAddQuestion(category)}
            className="rounded-xl border border-[#0B3D2E]/30 bg-[#0B3D2E]/5 hover:bg-[#0B3D2E]/10 text-[#0B3D2E]! font-semibold text-xs h-9 px-3.5 shadow-2xs"
          >
            Add Q&A
          </Button>

          {/* Edit Category Button */}
          <Button
            size="middle"
            icon={<EditOutlined />}
            onClick={() => onEditCategory(category)}
            className="rounded-xl border-gray-200 hover:border-[#0B3D2E] hover:text-[#0B3D2E] text-gray-700 text-xs h-9 px-3"
            title="Edit Category Details"
          />

          {/* Delete Category Button */}
          <Popconfirm
            title="Delete FAQ Category?"
            description={
              <span className="text-xs text-gray-600">
                Are you sure you want to permanently delete &quot;
                {category.title}&quot; and all {items.length} questions inside
                it?
              </span>
            }
            onConfirm={() => onDeleteCategory(category._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <Button
              size="middle"
              danger
              icon={<DeleteOutlined />}
              className="rounded-xl border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 text-xs h-9 px-3"
              title="Delete Category"
            />
          </Popconfirm>

          {/* Expand / Collapse Toggle Button */}
          <Button
            size="middle"
            onClick={() => setExpanded(!expanded)}
            className="rounded-xl border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs h-9 px-3 flex items-center gap-1 font-medium"
            title={expanded ? "Collapse Questions" : "Expand Questions"}
          >
            <span className="text-xs">{expanded ? "Hide" : "Show"}</span>
            <DownOutlined
              className={`text-[10px] transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Expandable Q&A List Body */}
      {expanded && (
        <div className="border-t border-gray-100 bg-[#FAFBF9]/80 p-5 sm:p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B3D2E]/10 text-[#0B3D2E] text-xl mb-3">
                <QuestionCircleOutlined />
              </div>
              <h4 className="text-sm font-bold text-cloud-100">
                No Questions in this Category Yet
              </h4>
              <p className="mt-1 text-xs text-mist-600 max-w-sm">
                Add common questions and helpful answers that will display
                inside the {category.title} section on your website.
              </p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => onAddQuestion(category)}
                className="mt-4 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-semibold text-xs h-9 px-4 shadow-sm border-0"
              >
                Add First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-2xs hover:border-[#0B3D2E]/40 hover:shadow-xs transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Q&A Content Block */}
                    <div className="flex-1 min-w-0">
                      {/* Question Row */}
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#0B3D2E] text-white text-[11px] font-extrabold shadow-2xs mt-0.5">
                          Q
                        </span>
                        <h4 className="text-[15px] font-bold text-cloud-100 leading-snug tracking-tight">
                          {item.question}
                        </h4>
                      </div>

                      {/* Answer Box (High contrast, clearly legible) */}
                      <div className="mt-3 ml-0 sm:ml-9 rounded-xl bg-[#FAFBF9] border-l-4 border-gray-200/70 border-y border-r border-gray-200/70 p-4">
                        <div className="flex items-start gap-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B3D2E] shrink-0 pt-0.5">
                            Answer:
                          </span>
                          <p className="text-sm text-gray-800 font-normal leading-relaxed whitespace-pre-line flex-1">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start pt-0.5">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEditQuestion(category, idx)}
                        className="rounded-lg text-gray-500 hover:text-[#0B3D2E] hover:bg-gray-100 h-8 w-8"
                        title="Edit Question"
                      />
                      <Popconfirm
                        title="Remove Question?"
                        description="Are you sure you want to remove this question?"
                        onConfirm={() => onDeleteQuestion(category, idx)}
                        okText="Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8"
                          title="Remove Question"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
