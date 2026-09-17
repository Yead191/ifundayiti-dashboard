import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Button,
  Spin,
  Upload,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  PictureOutlined,
  UserOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  UploadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { GlassCard } from "@/components/ui/GlassCard";
import { toFileUrl } from "@/config";
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
} from "@/redux/features/events/eventsApi";

export default function EditEventPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: eventRes, isLoading: isFetching, isError } = useGetEventByIdQuery(id, {
    skip: !id,
  });
  const [updateEvent, { isLoading: isSaving }] = useUpdateEventMutation();

  const event = eventRes?.data;
  const [pricingType, setPricingType] = useState<"free" | "paid">("paid");
  const [formatType, setFormatType] = useState<"physical" | "virtual" | "hybrid">("physical");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const watchedSpeakers = Form.useWatch("speakers", form);

  useEffect(() => {
    if (event) {
      setPricingType(event.pricingType === "free" ? "free" : "paid");
      setFormatType((event.type as any) || "physical");

      if (event.image) {
        setCoverPreviewUrl(toFileUrl(event.image) || event.image);
      } else {
        setCoverPreviewUrl(null);
      }
      setCoverFile(null);

      form.setFieldsValue({
        title: event.title,
        description: event.description,
        category: (event.category || "gala").toLowerCase(),
        type: (event.type || "physical").toLowerCase(),
        pricingType: (event.pricingType || "paid").toLowerCase(),
        price: event.price,
        capacity: event.capacity,
        startDate: event.startDate ? dayjs(event.startDate) : undefined,
        endDate: event.endDate ? dayjs(event.endDate) : undefined,
        location: event.location,
        venueAddress: event.venueAddress,
        dressCode: event.dressCode,
        virtualLink: event.virtualLink,
        featured: Boolean(event.featured),
        status: (event.status || "published").toLowerCase(),
        speakers:
          event.speakers && event.speakers.length > 0
            ? event.speakers.map((sp) => ({
                name: sp.name || "",
                role: sp.role || "",
                avatar: sp.avatar || "",
                existingAvatarUrl: sp.avatar || "",
                avatarPreviewUrl: sp.avatar ? toFileUrl(sp.avatar) || sp.avatar : null,
                avatarFile: null,
              }))
            : [{ name: "", role: "", avatar: "", existingAvatarUrl: "", avatarPreviewUrl: null, avatarFile: null }],
      });
    }
  }, [event, form]);

  const handleSpeakerAvatarChange = (file: File, index: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP)");
      return Upload.LIST_IGNORE;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image size must be less than 5MB");
      return Upload.LIST_IGNORE;
    }

    const previewUrl = URL.createObjectURL(file);
    const currentSpeakers = form.getFieldValue("speakers") || [];
    const updated = [...currentSpeakers];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        avatarFile: file,
        avatarPreviewUrl: previewUrl,
        existingAvatarUrl: "",
        avatar: "",
      };
      form.setFieldsValue({ speakers: updated });
    }
    return false;
  };

  const handleRemoveSpeakerAvatar = (index: number) => {
    const currentSpeakers = form.getFieldValue("speakers") || [];
    const updated = [...currentSpeakers];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        avatarFile: null,
        avatarPreviewUrl: null,
        existingAvatarUrl: "",
        avatar: "",
      };
      form.setFieldsValue({ speakers: updated });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();

      const resolvedPrice =
        values.pricingType === "free" || values.type === "virtual"
          ? 0
          : Number(values.price || 0);

      const startDateIso = values.startDate
        ? (typeof values.startDate.toISOString === "function"
            ? values.startDate.toISOString()
            : new Date(values.startDate).toISOString())
        : (event?.startDate || new Date().toISOString());

      const endDateIso = values.endDate
        ? (typeof values.endDate.toISOString === "function"
            ? values.endDate.toISOString()
            : new Date(values.endDate).toISOString())
        : undefined;

      const rawSpeakers = values.speakers || [];
      const validSpeakers = rawSpeakers.filter(
        (sp: any) => sp && sp.name && sp.name.trim()
      );

      const eventData: Record<string, any> = {
        title: values.title?.trim() || "",
        description: values.description?.trim() || "",
        category: values.category || "gala",
        type: values.type || "physical",
        pricingType: values.pricingType || "paid",
        price: resolvedPrice,
        capacity: Number(values.capacity || 100),
        startDate: startDateIso,
        location: values.location?.trim() || "",
        featured: Boolean(values.featured),
        status: values.status || "published",
        speakers: validSpeakers.map((sp: any) => ({
          name: sp.name?.trim(),
          role: sp.role?.trim() || "Keynote Speaker",
          // If editing an event and keeping an existing avatar URL:
          ...(sp.existingAvatarUrl && !sp.avatarFile ? { avatar: sp.existingAvatarUrl } : {}),
        })),
      };

      if (endDateIso) {
        eventData.endDate = endDateIso;
      }
      if (values.venueAddress?.trim()) {
        eventData.venueAddress = values.venueAddress.trim();
      }
      if (values.dressCode?.trim()) {
        eventData.dressCode = values.dressCode.trim();
      }
      if (values.virtualLink?.trim()) {
        eventData.virtualLink = values.virtualLink.trim();
      }

      formData.append("data", JSON.stringify(eventData));

      // Event Banner Image
      if (coverFile) {
        formData.append("image", coverFile);
      }

      // Append each speaker's avatar in the same order as the speakers array
      validSpeakers.forEach((sp: any) => {
        if (sp.avatarFile) {
          formData.append("avatar", sp.avatarFile);
        }
      });

      await updateEvent({ id, body: formData }).unwrap();
      toast.success("Event updated successfully!");
      navigate(`/events/${id}`);
    } catch (err: any) {
      toast.error("Failed to update event", {
        description: err?.data?.message || err?.message || "An error occurred.",
      });
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip="Loading event for editing..." />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The event you are attempting to edit could not be loaded.
        </p>
        <Button onClick={() => navigate("/events")} className="mt-4 rounded-xl">
          Back to Events List
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/events/${id}`}>
            <Button
              icon={<ArrowLeftOutlined />}
              className="h-10 w-10 rounded-xl border-slate-200"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-mist-500">
              <Link to="/events" className="hover:text-emerald-700 hover:underline">
                Events
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Edit Event</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
              Edit Event: {event.title}
            </h1>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="space-y-6">
          {/* Card 1: Core Information */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarOutlined className="text-emerald-700" />
                <span>Basic Event Information</span>
              </h2>
              <p className="text-xs text-mist-500">
                Update the title, category, format and public status.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-8">
                <Form.Item
                  label={<span className="font-semibold text-xs">Event Title</span>}
                  name="title"
                  rules={[{ required: true, message: "Event title is required" }]}
                >
                  <Input className="h-10 rounded-xl" />
                </Form.Item>
              </div>

              <div className="sm:col-span-4">
                <Form.Item
                  label={<span className="font-semibold text-xs">Category</span>}
                  name="category"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="h-10"
                    options={[
                      { value: "gala", label: "Gala & Banquet" },
                      { value: "fundraiser", label: "Fundraiser" },
                      { value: "pitch-night", label: "Pitch Night" },
                      { value: "workshop", label: "Workshop" },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="sm:col-span-4">
                <Form.Item
                  label={<span className="font-semibold text-xs">Event Format</span>}
                  name="type"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="h-10"
                    onChange={(val) => setFormatType(val)}
                    options={[
                      { value: "physical", label: "In-Person (Physical)" },
                      { value: "virtual", label: "Virtual Stream" },
                      { value: "hybrid", label: "Hybrid Experience" },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="sm:col-span-4">
                <Form.Item
                  label={<span className="font-semibold text-xs">Publishing Status</span>}
                  name="status"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="h-10"
                    options={[
                      { value: "published", label: "Published (Live on Portal)" },
                      { value: "draft", label: "Draft (Hidden from Public)" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                  />
                </Form.Item>
              </div>

              <div className="sm:col-span-4 flex items-center pt-2">
                <Form.Item
                  label={<span className="font-semibold text-xs">Spotlight as Featured</span>}
                  name="featured"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch checkedChildren="Featured" unCheckedChildren="Standard" />
                </Form.Item>
              </div>

              <div className="sm:col-span-12">
                <Form.Item
                  label={<span className="font-semibold text-xs">Event Description</span>}
                  name="description"
                  rules={[{ required: true, message: "Please provide event description" }]}
                >
                  <Input.TextArea rows={4} className="rounded-xl" />
                </Form.Item>
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Pricing & Capacity */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarOutlined className="text-amber-600" />
                <span>Ticketing, Pricing & Capacity</span>
              </h2>
              <p className="text-xs text-mist-500">
                Configure seat reservation limits and pricing rules.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Form.Item
                  label={<span className="font-semibold text-xs">Pricing Type</span>}
                  name="pricingType"
                  rules={[{ required: true }]}
                >
                  <Select
                    className="h-10"
                    onChange={(val) => setPricingType(val)}
                    disabled={formatType === "virtual"}
                    options={[
                      { value: "paid", label: "Paid Ticket ($ USD)" },
                      { value: "free", label: "Complimentary (Free RSVP)" },
                    ]}
                  />
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  label={<span className="font-semibold text-xs">Ticket Price ($ USD)</span>}
                  name="price"
                  rules={[
                    {
                      required: pricingType === "paid" && formatType !== "virtual",
                      message: "Please enter price",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={1}
                    className="h-10 w-full rounded-xl"
                    disabled={pricingType === "free" || formatType === "virtual"}
                    formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(val) => val!.replace(/\$\s?|(,*)/g, "") as any}
                  />
                </Form.Item>
              </div>

              <div>
                <Form.Item
                  label={<span className="font-semibold text-xs">Maximum Seat Capacity</span>}
                  name="capacity"
                  rules={[{ required: true, message: "Seat capacity is required" }]}
                >
                  <InputNumber min={1} max={10000} className="h-10 w-full rounded-xl" />
                </Form.Item>
              </div>
            </div>
          </GlassCard>

          {/* Card 3: Date, Time & Venue */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <EnvironmentOutlined className="text-indigo-600" />
                <span>Date, Schedule & Venue</span>
              </h2>
              <p className="text-xs text-mist-500">
                Specify scheduling and location coordinates for physical or virtual attendees.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Form.Item
                label={<span className="font-semibold text-xs">Start Date & Time</span>}
                name="startDate"
                rules={[{ required: true, message: "Start date is required" }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  className="h-10 w-full rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">End Date & Time</span>}
                name="endDate"
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  className="h-10 w-full rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Venue / Location Name</span>}
                name="location"
                rules={[{ required: true, message: "Location name is required" }]}
              >
                <Input className="h-10 rounded-xl" />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Full Venue Physical Address</span>}
                name="venueAddress"
              >
                <Input className="h-10 rounded-xl" disabled={formatType === "virtual"} />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Dress Code Guidelines</span>}
                name="dressCode"
              >
                <Input className="h-10 rounded-xl" />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Virtual Stream Link (Private)</span>}
                name="virtualLink"
              >
                <Input className="h-10 rounded-xl" disabled={formatType === "physical"} />
              </Form.Item>
            </div>
          </GlassCard>

          {/* Card 4: Media Banner */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <PictureOutlined className="text-teal-600" />
                <span>Cover Banner Image</span>
              </h2>
              <p className="text-xs text-mist-500">
                Upload a high-resolution showcase photograph for public listing cards and ticket stubs.
              </p>
            </div>

            {coverPreviewUrl ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 max-h-72 aspect-video sm:aspect-21/9">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Upload
                    beforeUpload={(file) => {
                      if (!file.type.startsWith("image/")) {
                        toast.error("Please select an image file (PNG, JPG, WebP)");
                        return Upload.LIST_IGNORE;
                      }
                      setCoverFile(file);
                      setCoverPreviewUrl(URL.createObjectURL(file));
                      return false;
                    }}
                    showUploadList={false}
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />} className="rounded-xl">
                      Replace Image
                    </Button>
                  </Upload>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreviewUrl(null);
                    }}
                    className="rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Upload.Dragger
                accept="image/*"
                beforeUpload={(file) => {
                  if (!file.type.startsWith("image/")) {
                    toast.error("Please select an image file (PNG, JPG, WebP)");
                    return Upload.LIST_IGNORE;
                  }
                  setCoverFile(file);
                  setCoverPreviewUrl(URL.createObjectURL(file));
                  return false;
                }}
                showUploadList={false}
                maxCount={1}
                className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-600 bg-slate-50/50"
              >
                <div className="flex flex-col items-center py-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-2xl mb-3">
                    <InboxOutlined />
                  </div>
                  <p className="font-semibold text-sm text-slate-800">
                    Click or drag an image file here to upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, WebP up to 5MB (16:9 widescreen recommended)
                  </p>
                </div>
              </Upload.Dragger>
            )}
          </GlassCard>

          {/* Card 5: Distinguished Speakers Dynamic Form */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <UserOutlined className="text-purple-600" />
                <span>Distinguished Speakers & Panelists</span>
              </h2>
              <p className="text-xs text-mist-500">
                Add keynote presenters, industry luminaries, and guest speakers with photo uploads.
              </p>
            </div>

            <Form.List name="speakers">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map(({ key, name, ...restField }, index) => {
                    const sp = watchedSpeakers?.[index];
                    const speakerAvatar =
                      sp?.avatarPreviewUrl ||
                      (sp?.existingAvatarUrl ? toFileUrl(sp.existingAvatarUrl) || sp.existingAvatarUrl : null) ||
                      (sp?.avatar ? toFileUrl(sp.avatar) || sp.avatar : null);

                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5"
                      >
                        {/* Speaker Avatar Upload Section */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <Avatar
                            size={44}
                            src={speakerAvatar || undefined}
                            icon={<UserOutlined />}
                            className="shrink-0 bg-slate-200 ring-2 ring-emerald-600/20 text-slate-600 font-bold"
                          />
                          <div className="flex flex-col gap-1">
                            <Upload
                              beforeUpload={(file) => handleSpeakerAvatarChange(file, index)}
                              showUploadList={false}
                              accept="image/*"
                              maxCount={1}
                            >
                              <Button
                                size="small"
                                icon={<UploadOutlined />}
                                className="h-7 text-xs rounded-lg"
                              >
                                {speakerAvatar ? "Change Photo" : "Upload Avatar"}
                              </Button>
                            </Upload>
                            {speakerAvatar && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSpeakerAvatar(index)}
                                className="text-[11px] text-red-500 hover:text-red-700 text-left font-medium cursor-pointer"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Hidden form items to track avatar files and URLs */}
                        <Form.Item
                          {...restField}
                          name={[name, "avatar"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "avatarFile"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "avatarPreviewUrl"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "existingAvatarUrl"]}
                          hidden
                        >
                          <Input />
                        </Form.Item>

                        {/* Speaker Name */}
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          className="mb-0 flex-1"
                          rules={[{ required: true, message: "Speaker name is required" }]}
                        >
                          <Input placeholder="Speaker Full Name" className="h-9 rounded-lg" />
                        </Form.Item>

                        {/* Speaker Role */}
                        <Form.Item
                          {...restField}
                          name={[name, "role"]}
                          className="mb-0 flex-1"
                        >
                          <Input
                            placeholder="Role (e.g. Keynote Speaker / Founder)"
                            className="h-9 rounded-lg"
                          />
                        </Form.Item>

                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          className="h-9 w-9 shrink-0 rounded-lg"
                        />
                      </div>
                    );
                  })}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="w-full h-10 rounded-xl font-medium"
                  >
                    + Add Another Speaker
                  </Button>
                </div>
              )}
            </Form.List>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={() => navigate(`/events/${id}`)}
              className="h-11 rounded-xl px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSaving}
              className="h-11 rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] px-8 font-bold text-white shadow-sm border-0"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
