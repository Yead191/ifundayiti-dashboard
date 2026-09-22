import { Modal, Button } from "antd";
import { WarningOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ICommunityPost } from "@/redux/features/community/community.types";

interface DeleteCommunityPostModalProps {
  open: boolean;
  post?: ICommunityPost | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteCommunityPostModal({
  open,
  post,
  loading,
  onCancel,
  onConfirm,
}: DeleteCommunityPostModalProps) {
  if (!open) return null;

  const displayTitle = post?.title || "Untitled Announcement";

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={460}
      centered
      destroyOnClose
      className="rounded-3xl"
    >
      <div className="text-center pt-3 pb-2 space-y-3.5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <WarningOutlined className="text-2xl" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 font-display">
            Delete Forum Announcement?
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">
              "{displayTitle}"
            </span>
            ? This action will permanently remove the post and cascade delete all associated member likes, comments, and nested replies.
          </p>
        </div>

        <div className="rounded-xl bg-amber-50/80 border border-amber-200/60 p-3 text-left">
          <p className="text-[11px] text-amber-800 leading-snug">
            <strong>Warning:</strong> This deletion cannot be recovered. Public community members will immediately lose access to this thread.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-xl px-5 font-medium"
          >
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            loading={loading}
            onClick={onConfirm}
            icon={<DeleteOutlined />}
            className="h-10 rounded-xl px-5 font-semibold bg-rose-600! hover:bg-rose-700! border-0 shadow-sm"
          >
            Delete Announcement
          </Button>
        </div>
      </div>
    </Modal>
  );
}
