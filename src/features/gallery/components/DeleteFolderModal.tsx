import { Modal, Button } from "antd";
import { ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import type { IFolder } from "@/redux/features/gallery/gallery.types";

interface DeleteFolderModalProps {
  open: boolean;
  folder: IFolder | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteFolderModal({
  open,
  folder,
  loading = false,
  onCancel,
  onConfirm,
}: DeleteFolderModalProps) {
  if (!folder) return null;

  const count = folder.galleryCount ?? 0;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={460}
      title={null}
      closable={!loading}
      maskClosable={!loading}
    >
      <div className="pt-2">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ExclamationCircleFilled className="text-2xl" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-cloud-100">
              Delete Folder & All Assigned Photos?
            </h3>
            <p className="mt-1 text-sm text-mist-600 font-medium">
              You are about to delete <span className="font-bold text-cloud-100">"{folder.name}"</span>.
            </p>
          </div>
        </div>

        <div className="my-4 rounded-xl border border-rose-200/80 bg-rose-50/70 p-3.5 text-xs text-rose-900 leading-relaxed space-y-1.5">
          <p className="font-bold text-rose-950 flex items-center gap-1.5">
            <DeleteOutlined />
            Permanent Cascade Deletion:
          </p>
          <p>
            All <strong className="font-semibold text-rose-950">{count} {count === 1 ? "photo" : "photos"}</strong> currently assigned to this album will be permanently deleted from the database and disk storage. This action cannot be reversed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
          <Button onClick={onCancel} disabled={loading} className="rounded-xl h-9">
            Cancel
          </Button>
          <Button
            danger
            type="primary"
            onClick={onConfirm}
            loading={loading}
            className="rounded-xl h-9 px-5 font-semibold"
          >
            Delete Folder & Photos
          </Button>
        </div>
      </div>
    </Modal>
  );
}
