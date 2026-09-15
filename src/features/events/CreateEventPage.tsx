import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Button,
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
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCreateEventMutation } from "@/redux/features/events/eventsApi";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createEvent, { isLoading }] = useCreateEventMutation();

  const [pricingType, setPricingType] = useState<"free" | "paid">("paid");
  const [formatType, setFormatType] = useState<"physical" | "virtual" | "hybrid">("physical");

  const handleSubmit = async (values: any) => {
    try {
      const payload: Record<string, any> = {
        title: values.title?.trim(),
        description: values.description?.trim(),
        category: values.category,
        type: values.type,
        pricingType: values.pricingType,
        price: values.pricingType === "free" || values.type === "virtual" ? 0 : Number(values.price || 0),
        capacity: Number(values.capacity || 100),
        startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        location: values.location?.trim(),
        venueAddress: values.venueAddress?.trim() || undefined,
        dressCode: values.dressCode?.trim() || undefined,
        virtualLink: values.virtualLink?.trim() || undefined,
        featured: Boolean(values.featured),
        status: values.status || "published",
        image: values.image?.trim() || undefined,
        speakers: (values.speakers || []).filter((s: any) => s && s.name),
      };

      await createEvent(payload).unwrap();
      toast.success("Event created successfully!", {
        description: "Your gathering has been published to the platform.",
      });
      navigate("/events");
    } catch (err: any) {
      toast.error("Failed to create event", {
        description: err?.data?.message || err?.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/events">
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
              <span className="text-slate-800 font-semibold">New Event</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
              Create New Event
            </h1>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: "gala",
          type: "physical",
          pricingType: "paid",
          price: 100,
          capacity: 200,
          status: "published",
          featured: false,
          speakers: [{ name: "", role: "", avatar: "" }],
        }}
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
                Define the title, category, format and public visibility.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-8">
                <Form.Item
                  label={<span className="font-semibold text-xs">Event Title</span>}
                  name="title"
                  rules={[{ required: true, message: "Event title is required" }]}
                >
                  <Input
                    placeholder="e.g. Annual Hope Gala 2026: Illuminating Future Pathways"
                    className="h-10 rounded-xl"
                  />
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
                  <Input.TextArea
                    rows={4}
                    placeholder="Provide a compelling overview of the gathering, mission objectives, schedule highlights, and impact story..."
                    className="rounded-xl"
                  />
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
                <Input
                  placeholder={formatType === "virtual" ? "e.g. Zoom Webinar" : "e.g. The Park Hotel, Miami Beach"}
                  className="h-10 rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Full Venue Physical Address</span>}
                name="venueAddress"
              >
                <Input
                  placeholder="e.g. 8348 Fairfield Avenue, Port Haron, MI 48060"
                  className="h-10 rounded-xl"
                  disabled={formatType === "virtual"}
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Dress Code Guidelines</span>}
                name="dressCode"
              >
                <Input
                  placeholder="e.g. Formal Attire / Black Tie Optional / Business Casual"
                  className="h-10 rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-xs">Virtual Stream Link (Private)</span>}
                name="virtualLink"
              >
                <Input
                  placeholder="https://zoom.us/j/... or YouTube Live stream URL"
                  className="h-10 rounded-xl"
                  disabled={formatType === "physical"}
                />
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
                High-resolution showcase photograph for public listing cards and ticket stubs.
              </p>
            </div>

            <Form.Item
              label={<span className="font-semibold text-xs">Image URL</span>}
              name="image"
            >
              <Input
                placeholder="https://images.unsplash.com/photo-... or Cloudinary URL"
                className="h-10 rounded-xl"
              />
            </Form.Item>
          </GlassCard>

          {/* Card 5: Distinguished Speakers Dynamic Form */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <UserOutlined className="text-purple-600" />
                <span>Distinguished Speakers & Panelists</span>
              </h2>
              <p className="text-xs text-mist-500">
                Add keynote presenters, industry luminaries, and guest speakers.
              </p>
            </div>

            <Form.List name="speakers">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: "Speaker name is required" }]}
                      >
                        <Input placeholder="Speaker Full Name" className="h-9 rounded-lg" />
                      </Form.Item>

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

                      <Form.Item
                        {...restField}
                        name={[name, "avatar"]}
                        className="mb-0 flex-1"
                      >
                        <Input placeholder="Avatar Photo URL" className="h-9 rounded-lg" />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        className="h-9 w-9 shrink-0 rounded-lg"
                      />
                    </div>
                  ))}

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
              onClick={() => navigate("/events")}
              className="h-11 rounded-xl px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              className="h-11 rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] px-8 font-bold text-white shadow-sm border-0"
            >
              Create & Publish Event
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
