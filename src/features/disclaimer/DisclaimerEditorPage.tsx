import { useState, useMemo } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { Button, Skeleton, Modal, Tag } from "antd";
import {
  SaveOutlined,
  FileTextOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import type { DisclaimerType } from "@/redux/features/disclaimer/disclaimer.types";
import {
  useGetDisclaimerQuery,
  useUpsertDisclaimerMutation,
} from "@/redux/features/disclaimer/disclaimerApi";
import {
  getDisclaimerConfig,
  isDisclaimerType,
  DISCLAIMER_PAGES,
  type DisclaimerPageConfig,
} from "./disclaimerConfig";

const EMPTY_CONTENT = "<p></p>";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return (
      err.data?.message ??
      err.message ??
      "Something went wrong. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function DisclaimerEditor({
  type,
  config,
}: {
  type: DisclaimerType;
  config: DisclaimerPageConfig;
}) {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useGetDisclaimerQuery({
    type,
  });
  const [upsertDisclaimer, { isLoading: isSaving }] =
    useUpsertDisclaimerMutation();
  const [draft, setDraft] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loading = isLoading || isFetching;
  const savedContent = loading
    ? null
    : isError
      ? EMPTY_CONTENT
      : data?.data?.trim() || EMPTY_CONTENT;

  const content = draft ?? savedContent ?? EMPTY_CONTENT;
  const dirty = draft !== null;
  const Icon = config.icon;

  const wordCount = useMemo(() => getWordCount(content), [content]);
  const readingTime = useMemo(
    () => `${Math.max(1, Math.ceil(wordCount / 200))} min read`,
    [wordCount],
  );

  const handleSave = async () => {
    try {
      await upsertDisclaimer({ type, content }).unwrap();
      setDraft(null);
      toast.success("Document published successfully", {
        description: `${config.title} is now updated and live on the public website.`,
      });
    } catch (error) {
      toast.error("Couldn't save document", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#0B3D2E] to-[#062118] text-white shadow-md shadow-[#0B3D2E]/20 ring-1 ring-white/20">
              <Icon className="text-2xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Legal & Platform Compliance
                </span>
                <span className="text-mist-400">/</span>
                <span className="text-xs font-medium text-mist-600">
                  {config.label}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-cloud-100">
                {config.title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-mist-600">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Preview Button */}
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => setPreviewOpen(true)}
              className="h-10 rounded-xl font-medium hover:border-[#0B3D2E] hover:text-[#0B3D2E]"
            >
              Public Preview
            </Button>

            {/* Primary Save Button */}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isSaving}
              disabled={!dirty || loading}
              onClick={handleSave}
              className="h-10 rounded-xl bg-[#0B3D2E]! hover:bg-[#082e23]! text-white! font-medium shadow-sm px-5"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Quick Navigation Tabs between Disclaimers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DISCLAIMER_PAGES.map((page) => {
          const isActive = page.type === type;
          const PageIcon = page.icon;
          return (
            <button
              key={page.type}
              onClick={() => navigate(page.path)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#0B3D2E] text-white shadow-sm"
                  : "bg-white/80 text-mist-700 hover:bg-white hover:text-cloud-100 border border-gray-200/80 shadow-2xs"
              }`}
            >
              <PageIcon className={isActive ? "text-white" : "text-mist-500"} />
              <span>{page.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Main Card */}
      <GlassCard className="p-6">
        {loading ? (
          <div className="space-y-4 py-6">
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton.Node active className="h-120! w-full! rounded-2xl!" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Editor Meta Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <Tag className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <FileTextOutlined className="mr-1" />
                  Legal Content
                </Tag>
                <div className="flex items-center gap-1.5 text-xs text-mist-500">
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-[11px]" />
                    {readingTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-mist-500">
                <GlobalOutlined className="text-emerald-700" />
                <span>
                  Synchronizes with public website:{" "}
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-cloud-100">
                    /{type === "user-terms" ? "terms" : type}
                  </code>
                </span>
              </div>
            </div>

            {/* Error notice if no content exists yet */}
            {isError && !dirty && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                <ExclamationCircleOutlined className="text-base text-amber-600 shrink-0" />
                <span>
                  No published version exists yet for this document. Use the
                  rich text editor below to draft and publish the official text.
                </span>
              </div>
            )}

            {/* TipTap Rich Text Editor */}
            <TiptapEditor
              key={type}
              value={content}
              onChange={setDraft}
              placeholder={`Write the official ${config.title.toLowerCase()} for IFundAyiti here…`}
              disabled={isSaving}
              minHeight={520}
            />
          </div>
        )}
      </GlassCard>

      {/* Public Preview Modal */}
      <Modal
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewOpen(false)}>
            Close Preview
          </Button>,
          dirty && (
            <Button
              key="save"
              type="primary"
              icon={<SaveOutlined />}
              loading={isSaving}
              onClick={async () => {
                await handleSave();
                setPreviewOpen(false);
              }}
              className="bg-[#0B3D2E]! hover:bg-[#082e23]! text-white!"
            >
              Publish Now
            </Button>
          ),
        ]}
        width={800}
        destroyOnClose
        title={
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon className="text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold text-cloud-100">
                {config.title}
              </h3>
              <p className="text-xs text-mist-500">
                Live Storefront / Website Preview Mode ({readingTime})
              </p>
            </div>
          </div>
        }
      >
        <div className="max-h-[65vh] overflow-y-auto py-4 px-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                IFundAyiti Official Legal Document
              </span>
              <h2 className="mt-2 text-2xl font-bold text-cloud-100">
                {config.title}
              </h2>
              <p className="mt-1 text-xs text-mist-500">
                Last updated: {new Date().toLocaleDateString()} · {wordCount}{" "}
                words
              </p>
            </div>

            <div
              className="prose prose-sm max-w-none text-mist-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DisclaimerEditorPage() {
  const { type } = useParams<{ type: string }>();
  const config = getDisclaimerConfig(type);

  if (!isDisclaimerType(type) || !config) {
    return <Navigate to="/disclaimer/user-terms" replace />;
  }

  return <DisclaimerEditor key={type} type={type} config={config} />;
}
