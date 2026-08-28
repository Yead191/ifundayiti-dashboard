import { useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Switch,
} from "antd";
import { InboxOutlined, ApartmentOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toFileUrl } from "@/config";
import { parseBoolean } from "@/lib/utils";
import { normalizeOffers } from "@/redux/features/partners/buildPartnerFormData";
import {
  PARTNER_STATUS,
  PARTNER_STATUS_OPTIONS,
  type ApiPartner,
  type PartnerFormPayload,
  type PartnerStatus,
  type PartnerUser,
} from "@/redux/features/partners/partners.types";
import { partnerStatusLabelMap } from "../statusMaps";
import { UserSearchSelect } from "./UserSearchSelect";

function resolveUploadFile(fileList: UploadFile[]): File | undefined {
  const entry = fileList.at(-1);
  if (!entry) return undefined;
  if (entry.originFileObj instanceof File) return entry.originFileObj;
  return undefined;
}

interface FormValues {
  name: string;
  description: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  status: PartnerStatus;
  offers: string[];
  featured: boolean;
}

export function PartnerFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initial?: ApiPartner | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: PartnerFormPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [linkedUser, setLinkedUser] = useState<PartnerUser | null>(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setImageError(null);

    if (initial) {
      form.setFieldsValue({
        name: initial.name,
        description: initial.description,
        website: initial.website,
        contactEmail: initial.contactEmail,
        contactPhone: initial.contactPhone,
        status: (PARTNER_STATUS_OPTIONS.includes(initial.status as PartnerStatus)
          ? initial.status
          : PARTNER_STATUS.PENDING) as PartnerStatus,
        offers: normalizeOffers(initial.offers),
        featured: parseBoolean(initial.featured),
      });
      setUserId(initial.user?._id ?? null);
      setLinkedUser(initial.user ?? null);
      setImageList(
        initial.image
          ? [{ uid: "-1", name: "logo", status: "done", url: toFileUrl(initial.image) }]
          : []
      );
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: PARTNER_STATUS.APPROVED,
        offers: [],
        featured: false,
      });
      setUserId(null);
      setLinkedUser(null);
      setImageList([]);
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    const image = resolveUploadFile(imageList);

    if (!isEdit && !image) {
      setImageError("Upload a partner logo");
      return;
    }

    onSubmit({
      name: values.name,
      description: values.description,
      offers: normalizeOffers(values.offers),
      website: values.website,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      status: values.status,
      featured: parseBoolean(values.featured),
      image: image ?? null,
      userId,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={720}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          <ApartmentOutlined className="text-violet-glow" />
          {isEdit ? "Edit partner" : "New partner"}
        </span>
      }
      styles={{
        container: {
          background: "linear-gradient(180deg, #151935 0%, #10132c 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          maxHeight: "90vh",
          overflow: "auto",
        },
      }}
    >
      <p className="mb-5 text-sm text-mist-400">
        {isEdit
          ? "Update partner profile, offers, contact details, or publication status."
          : "Add a partner manually — approved partners can be featured on the site."}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label={<span className="text-mist-300">Partner name</span>}
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="Company or organization name" />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-mist-300">Description</span>}
          rules={[
            { required: true, message: "Description is required" },
            { min: 20, message: "Aim for at least 20 characters" },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Brief overview of what this partner offers…"
            className="resize-none!"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item name="offers" label={<span className="text-mist-300">Offers</span>}>
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Add services or perks"
            open={false}
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="website"
            label={<span className="text-mist-300">Website</span>}
            rules={[
              { required: true, message: "Website is required" },
              { type: "url", message: "Enter a valid URL" },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="contactPhone"
            label={<span className="text-mist-300">Contact phone</span>}
            rules={[{ required: true, message: "Phone is required" }]}
          >
            <Input placeholder="+1 000 000 0000" />
          </Form.Item>
        </div>

        <Form.Item
          name="contactEmail"
          label={<span className="text-mist-300">Contact email</span>}
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Enter a valid email" },
          ]}
        >
          <Input placeholder="contact@example.com" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="status"
            label={<span className="text-mist-300">Status</span>}
            rules={[{ required: true, message: "Select a status" }]}
          >
            <Select
              options={PARTNER_STATUS_OPTIONS.map((status) => ({
                value: status,
                label: partnerStatusLabelMap[status],
              }))}
            />
          </Form.Item>
          <Form.Item
            name="featured"
            label={<span className="text-mist-300">Featured</span>}
            valuePropName="checked"
            getValueFromEvent={(checked) => Boolean(checked)}
            normalize={(value) => parseBoolean(value)}
          >
            <Switch />
          </Form.Item>
        </div>

        <FormField label="Linked user" hint="Optional — tie this partner to an existing account">
          <UserSearchSelect
            value={userId}
            initialUser={linkedUser}
            onChange={(id, user) => {
              setUserId(id);
              setLinkedUser(user ?? null);
            }}
          />
        </FormField>

        <div className="mb-6">
          <div className="mb-2 text-sm text-mist-300">
            Logo{" "}
            {isEdit && (
              <span className="text-mist-600">(optional — leave blank to keep current)</span>
            )}
          </div>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            listType="picture"
            fileList={imageList}
            beforeUpload={() => false}
            onChange={({ fileList }) => {
              setImageList(fileList.slice(-1).map((file) => ({ ...file, status: "done" as const })));
              setImageError(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-violet-glow!" />
            </p>
            <p className="text-sm text-cloud-100">Drop a logo, or click to browse</p>
            <p className="mt-1 text-xs text-mist-500">Square PNG or SVG works best</p>
          </Upload.Dragger>
          {imageError && <p className="mt-1.5 text-xs text-danger">{imageError}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create partner"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1 text-sm text-mist-300">{label}</div>
      {hint && <p className="mb-2 text-xs text-mist-600">{hint}</p>}
      {children}
    </div>
  );
}
