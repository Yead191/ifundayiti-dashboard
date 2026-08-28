import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  Select,
  Switch,
  DatePicker,
} from "antd";
import { CalendarOutlined, InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { toFileUrl } from "@/config";
import {
  EVENT_STATUS,
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE,
  EVENT_TYPE_OPTIONS,
  type ApiEvent,
  type EventFormPayload,
  type EventStatus,
  type EventType,
} from "@/redux/features/events/events.types";
import { eventStatusLabelMap, eventTypeLabelMap } from "../statusMaps";

interface FormValues {
  title: string;
  description: string;
  dateRange: [Dayjs, Dayjs];
  location: string;
  type: EventType;
  status: EventStatus;
  organizationName: string;
  organizationDesignation: string;
  organizationEmail: string;
  tags: string[];
  isFeatured: boolean;
}

const { RangePicker } = DatePicker;

export function EventFormModal({
  open,
  initial,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  initial?: ApiEvent | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: EventFormPayload) => void;
}) {
  const [form] = Form.useForm<FormValues>();
  const [coverList, setCoverList] = useState<UploadFile[]>([]);
  const [galleryList, setGalleryList] = useState<UploadFile[]>([]);
  const [coverError, setCoverError] = useState<string | null>(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    setCoverError(null);

    if (initial) {
      form.setFieldsValue({
        title: initial.title,
        description: initial.description,
        dateRange: [dayjs(initial.eventDate), dayjs(initial.endDate)],
        location: initial.location,
        type: (EVENT_TYPE_OPTIONS.includes(initial.type as EventType)
          ? initial.type
          : EVENT_TYPE.OTHER) as EventType,
        status: (EVENT_STATUS_OPTIONS.includes(initial.status as EventStatus)
          ? initial.status
          : EVENT_STATUS.DRAFT) as EventStatus,
        organizationName: initial.organization?.name ?? "",
        organizationDesignation: initial.organization?.designation ?? "",
        organizationEmail: initial.organization?.email ?? "",
        tags: initial.tags ?? [],
        isFeatured: !!initial.isFeatured,
      });
      setCoverList(
        initial.coverImage
          ? [
              {
                uid: "-cover",
                name: "cover-image",
                status: "done",
                url: toFileUrl(initial.coverImage),
              },
            ]
          : []
      );
      setGalleryList(
        (initial.images ?? []).map((src, index) => ({
          uid: `-gallery-${index}`,
          name: `gallery-${index + 1}`,
          status: "done" as const,
          url: toFileUrl(src),
        }))
      );
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: EVENT_TYPE.WORKSHOP,
        status: EVENT_STATUS.DRAFT,
        tags: [],
        isFeatured: false,
        dateRange: [dayjs().add(7, "day").hour(9).minute(0), dayjs().add(7, "day").hour(17).minute(0)],
      });
      setCoverList([]);
      setGalleryList([]);
    }
  }, [open, initial, form]);

  const handleFinish = (values: FormValues) => {
    const coverFile = coverList.find((f) => f.originFileObj)?.originFileObj as File | undefined;
    const imageFiles = galleryList
      .map((f) => f.originFileObj as File | undefined)
      .filter((f): f is File => !!f);

    if (!isEdit && !coverFile) {
      setCoverError("Upload a cover image");
      return;
    }

    const [start, end] = values.dateRange;

    onSubmit({
      title: values.title,
      description: values.description,
      eventDate: start.toISOString(),
      endDate: end.toISOString(),
      location: values.location,
      type: values.type,
      status: values.status,
      organization: {
        name: values.organizationName,
        designation: values.organizationDesignation,
        email: values.organizationEmail,
      },
      tags: values.tags ?? [],
      isFeatured: !!values.isFeatured,
      coverImageFile: coverFile ?? null,
      imageFiles,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={loading ? undefined : onCancel}
      footer={null}
      width={760}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2 font-display text-lg font-semibold text-cloud-100">
          <CalendarOutlined className="text-violet-glow" />
          {isEdit ? "Edit event" : "New event"}
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
          ? "Update schedule, media, organization details, or publication status."
          : "Create an event for the Hubology calendar — cover, gallery, and organizer info included."}
      </p>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="title"
          label={<span className="text-mist-300">Title</span>}
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Event title" />
        </Form.Item>

        <Form.Item
          name="description"
          label={<span className="text-mist-300">Description</span>}
          rules={[
            { required: true, message: "Description is required" },
            { min: 40, message: "Aim for at least 40 characters" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="What this event is about…"
            className="resize-none!"
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label={<span className="text-mist-300">Event schedule</span>}
          rules={[{ required: true, message: "Pick start and end times" }]}
        >
          <RangePicker
            showTime={{ format: "HH:mm" }}
            format="MMM D, YYYY h:mm A"
            className="w-full!"
          />
        </Form.Item>

        <Form.Item
          name="location"
          label={<span className="text-mist-300">Location</span>}
          rules={[{ required: true, message: "Location is required" }]}
        >
          <Input placeholder="Venue or address" />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Form.Item
            name="type"
            label={<span className="text-mist-300">Type</span>}
            rules={[{ required: true, message: "Select a type" }]}
          >
            <Select
              options={EVENT_TYPE_OPTIONS.map((type) => ({
                value: type,
                label: eventTypeLabelMap[type],
              }))}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label={<span className="text-mist-300">Status</span>}
            rules={[{ required: true, message: "Select a status" }]}
          >
            <Select
              options={EVENT_STATUS_OPTIONS.map((status) => ({
                value: status,
                label: eventStatusLabelMap[status],
              }))}
            />
          </Form.Item>
        </div>

        <div className="mb-1 text-sm font-medium text-mist-300">Organization</div>
        <div className="mb-4 grid grid-cols-1 gap-x-3 rounded-xl border border-navy-700/60 bg-navy-900/30 p-3 sm:grid-cols-2">
          <Form.Item
            name="organizationName"
            label={<span className="text-mist-400">Name</span>}
            rules={[{ required: true, message: "Organization name is required" }]}
            className="sm:col-span-2"
          >
            <Input placeholder="Organizer name" />
          </Form.Item>
          <Form.Item
            name="organizationDesignation"
            label={<span className="text-mist-400">Designation</span>}
            rules={[{ required: true, message: "Designation is required" }]}
          >
            <Input placeholder="Role or title" />
          </Form.Item>
          <Form.Item
            name="organizationEmail"
            label={<span className="text-mist-400">Email</span>}
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="contact@example.com" />
          </Form.Item>
        </div>

        <Form.Item name="tags" label={<span className="text-mist-300">Tags</span>}>
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="Add tags"
            open={false}
          />
        </Form.Item>

        <Form.Item
          name="isFeatured"
          label={<span className="text-mist-300">Featured</span>}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div className="mb-6">
          <div className="mb-2 text-sm text-mist-300">
            Cover image{" "}
            {isEdit && (
              <span className="text-mist-600">(optional — leave blank to keep current)</span>
            )}
          </div>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            listType="picture"
            fileList={coverList}
            beforeUpload={() => false}
            onChange={({ fileList }) => {
              setCoverList(fileList.slice(-1));
              setCoverError(null);
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-violet-glow!" />
            </p>
            <p className="text-sm text-cloud-100">Drop a cover image, or click to browse</p>
            <p className="mt-1 text-xs text-mist-500">Wide landscape JPG/PNG works best</p>
          </Upload.Dragger>
          {coverError && <p className="mt-1.5 text-xs text-danger">{coverError}</p>}
        </div>

        <div className="mb-6">
          <div className="mb-2 text-sm text-mist-300">
            Gallery images{" "}
            <span className="text-mist-600">
              {isEdit
                ? "(optional — new files are added; remove local picks before save)"
                : "(optional, multiple)"}
            </span>
          </div>
          <Upload.Dragger
            accept="image/*"
            multiple
            listType="picture"
            fileList={galleryList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setGalleryList(fileList)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-violet-glow!" />
            </p>
            <p className="text-sm text-cloud-100">Drop gallery photos, or click to browse</p>
            <p className="mt-1 text-xs text-mist-500">You can select multiple images</p>
          </Upload.Dragger>
        </div>

        <div className="flex justify-end gap-2 border-t border-navy-700/60 pt-4">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} className="btn-gradient border-0!">
            {isEdit ? "Save changes" : "Create event"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
