import { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { winnerStorySchema } from "../schemas";
import type { Application } from "../types";

/** Create or edit the public success story shown on the Winners page. */
export function WinnerStoryModal({
  application,
  open,
  onCancel,
  onConfirm,
}: {
  application: Application | null;
  open: boolean;
  onCancel: () => void;
  onConfirm: (story: string) => void;
}) {
  const [story, setStory] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && application) {
      setStory(application.successStory ?? "");
      setError(null);
    }
  }, [open, application]);

  const handleConfirm = () => {
    const result = winnerStorySchema.safeParse({ successStory: story });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid story");
      return;
    }
    onConfirm(result.data.successStory);
  };

  if (!application) return null;

  return (
    <Modal open={open} onCancel={onCancel} footer={null} width={520} title="Winner story" destroyOnHidden>
      <p className="text-sm text-mist-400">
        This story appears publicly on the Winners page for {application.personal.name}.
      </p>
      <div className="mt-4">
        <Input.TextArea
          rows={5}
          value={story}
          status={error ? "error" : undefined}
          onChange={(e) => {
            setStory(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Share the impact of this project and why it stood out."
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t border-navy-700/60 pt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" className="btn-gradient !border-0" icon={<EditOutlined />} onClick={handleConfirm}>
          Save story
        </Button>
      </div>
    </Modal>
  );
}
