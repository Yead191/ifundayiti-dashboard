import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Button, Skeleton } from "antd";
import { SaveOutlined, FileTextOutlined } from "@ant-design/icons";
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
  type DisclaimerPageConfig,
} from "./disclaimerConfig";

const EMPTY_CONTENT = "<p></p>";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

function DisclaimerEditor({
  type,
  config,
}: {
  type: DisclaimerType;
  config: DisclaimerPageConfig;
}) {
  const { data, isLoading, isFetching, isError } = useGetDisclaimerQuery({ type });
  const [upsertDisclaimer, { isLoading: isSaving }] = useUpsertDisclaimerMutation();
  const [draft, setDraft] = useState<string | null>(null);

  const loading = isLoading || isFetching;
  const savedContent = loading
    ? null
    : isError
      ? EMPTY_CONTENT
      : data?.data?.trim() || EMPTY_CONTENT;

  const content = draft ?? savedContent ?? EMPTY_CONTENT;
  const dirty = draft !== null;
  const Icon = config.icon;

  const handleSave = async () => {
    try {
      await upsertDisclaimer({ type, content }).unwrap();
      setDraft(null);
      toast.success("Content saved", {
        description: `${config.title} has been updated on the website.`,
      });
    } catch (error) {
      toast.error("Couldn't save content", { description: getErrorMessage(error) });
    }
  };

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
            <Icon className="text-lg text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-cloud-100">{config.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-mist-400">{config.subtitle}</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          disabled={!dirty || loading}
          className="btn-gradient border-0!"
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>

      <GlassCard flat>
        {savedContent === null ? (
          <div className="space-y-3">
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
            <Skeleton.Node active className="h-96! w-full! rounded-2xl!" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-mist-600">
              <FileTextOutlined className="text-violet-glow/80" />
              Page content
              {isError && !dirty && (
                <span className="text-mist-500">· No content yet — start writing below</span>
              )}
            </div>
            <TiptapEditor
              key={type}
              value={content}
              onChange={setDraft}
              placeholder={`Write the ${config.title.toLowerCase()} content here…`}
              disabled={isSaving}
            />
          </>
        )}
      </GlassCard>
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
