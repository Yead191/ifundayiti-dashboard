import { Modal, Button } from "antd";
import { DownloadOutlined, FilePdfOutlined, FileImageOutlined } from "@ant-design/icons";
import { DOCUMENT_LABELS, type ApplicationDocument } from "../types";
import { formatFileSize } from "@/lib/utils";

/** Renders images in an inline viewer and PDFs in an embedded PDF frame. */
export function DocumentPreviewModal({
  doc,
  open,
  onClose,
}: {
  doc: ApplicationDocument | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!doc) return null;

  const isPdf = doc.mimeType === "application/pdf";
  const isImage = doc.mimeType.startsWith("image/");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={isPdf ? 900 : 720}
      destroyOnHidden
      title={
        <div className="flex items-center gap-2.5">
          <span className="text-mist-400">{isPdf ? <FilePdfOutlined /> : <FileImageOutlined />}</span>
          <div>
            <div className="text-sm font-semibold text-cloud-100">{DOCUMENT_LABELS[doc.type]}</div>
            <div className="text-xs font-normal text-mist-600">
              {doc.fileName} · {formatFileSize(doc.size)}
            </div>
          </div>
        </div>
      }
    >
      <div className="mt-2 overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60">
        {isImage && (
          <img src={doc.url} alt={doc.fileName} className="mx-auto max-h-[70vh] w-full object-contain" />
        )}
        {isPdf && (
          <iframe title={doc.fileName} src={doc.url} className="h-[70vh] w-full" />
        )}
        {!isImage && !isPdf && (
          <div className="p-10 text-center text-sm text-mist-400">
            Preview isn't available for this file type. Use download to view it.
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <a href={doc.url} download={doc.fileName} target="_blank" rel="noreferrer">
          <Button icon={<DownloadOutlined />}>Download</Button>
        </a>
      </div>
    </Modal>
  );
}
