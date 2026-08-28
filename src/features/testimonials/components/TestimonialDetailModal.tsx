import type { ReactNode } from "react";
import { Avatar, Button, Modal } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  BankOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { formatDate } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";
import type { ApiTestimonial } from "@/redux/features/testimonials/testimonials.types";
import { Quote } from "lucide-react";

export function TestimonialDetailModal({
  testimonial,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  testimonial: ApiTestimonial | null;
  open: boolean;
  onClose: () => void;
  onEdit: (testimonial: ApiTestimonial) => void;
  onDelete: (testimonial: ApiTestimonial) => void;
}) {
  if (!testimonial) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      destroyOnHidden
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
      <div className="relative overflow-hidden px-6 pb-6 pt-8 md:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/3 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" />
          <div className="absolute -bottom-24 right-0 h-48 w-48 rounded-full bg-warning/10 blur-[80px]" />
        </div>

        <div className="relative">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0]/40 to-[#4A1C8A]/50 text-lg text-violet-glow shadow-[0_8px_24px_-10px_rgba(129,49,240,0.7)]">
            <Quote />
          </div>

          <blockquote className="font-display text-xl font-medium leading-relaxed tracking-tight text-cloud-100 md:text-[22px]">
            <span className="text-violet-glow/80">“</span>
            {testimonial.quote}
            <span className="text-violet-glow/80">”</span>
          </blockquote>

          <div className="mt-7 flex items-center gap-4">
            <div className="rounded-2xl bg-linear-to-br from-violet-600/50 to-violet-900/40 p-0.5 shadow-[0_12px_40px_-14px_rgba(129,49,240,0.55)]">
              <Avatar
                src={getImageUrl(testimonial.image)}
                icon={<UserOutlined />}
                size={72}
                className="rounded-[14px]! bg-navy-800!"
                shape="square"
              />
            </div>
            <div className="min-w-0">
              <div className="font-display text-lg font-semibold text-cloud-100">{testimonial.name}</div>
              <div className="mt-0.5 text-sm text-mist-400">
                {testimonial.role}
                {testimonial.company ? (
                  <>
                    <span className="mx-1.5 text-mist-700">·</span>
                    {testimonial.company}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-700/60 px-6 py-5 md:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetaCard
            icon={<IdcardOutlined />}
            label="Role"
            value={testimonial.role || "—"}
          />
          <MetaCard
            icon={<BankOutlined />}
            label="Company"
            value={testimonial.company || "—"}
          />
          <MetaCard
            icon={<CalendarOutlined />}
            label="Added"
            value={testimonial.createdAt ? formatDate(testimonial.createdAt) : "—"}
          />
        </div>

        {testimonial.updatedAt && (
          <p className="mt-4 text-xs text-mist-600">
            Last updated {formatDate(testimonial.updatedAt)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-navy-700/60 bg-navy-900/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Button onClick={onClose}>Close</Button>
        <div className="flex gap-2">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(testimonial)}
          >
            Delete
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="btn-gradient border-0!"
            onClick={() => onEdit(testimonial)}
          >
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-mist-600">
        <span className="text-violet-glow/80">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 truncate font-display text-sm font-semibold text-cloud-100">{value}</div>
    </div>
  );
}
