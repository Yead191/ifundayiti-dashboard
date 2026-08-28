import { Button, Modal } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import type { ApiFaq } from "@/redux/features/faq/faq.types";

export function FaqDetailModal({
  faq,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  faq: ApiFaq | null;
  open: boolean;
  onClose: () => void;
  onEdit: (faq: ApiFaq) => void;
  onDelete: (faq: ApiFaq) => void;
}) {
  if (!faq) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      destroyOnHidden
      closeIcon={<CloseOutlined className="text-mist-400" />}
      styles={{
        body: { padding: 0 },
        container: {
          overflow: "hidden",
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
        },
      }}
    >
      <div className="relative overflow-hidden px-6 pb-5 pt-7 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-violet-600/25 blur-[80px]" />
          <div className="absolute -bottom-16 right-0 h-44 w-44 rounded-full bg-[#f5b544]/10 blur-[70px]" />
        </div>

        <div className="relative">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0]/40 to-[#4A1C8A]/50 text-lg text-violet-glow shadow-[0_8px_24px_-10px_rgba(129,49,240,0.7)]">
            <QuestionCircleOutlined />
          </div>
          <StatusTag tone={faq.audience === "USER" ? "info" : "violet"}>
            {faq.audience === "USER" ? "User FAQ" : "Vendor FAQ"}
          </StatusTag>
          <h2 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight text-cloud-100">
            {faq.question}
          </h2>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-600">Answer</div>
        <p className="text-sm leading-relaxed text-mist-300">{faq.answer}</p>
      </div>

      <div className="flex flex-col gap-2 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Button onClick={onClose}>Close</Button>
        <div className="flex gap-2">
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(faq)}>
            Delete
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="btn-gradient border-0!"
            onClick={() => onEdit(faq)}
          >
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}
