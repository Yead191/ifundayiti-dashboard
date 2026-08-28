import { useState, useMemo } from "react";
import {
  Tabs,
  Button,
  Input,
  Select,
  Tag,
  Avatar,
  Modal,
  Form,
  Space,
  Popconfirm,
  Badge,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  UserOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useIFundAyiti } from "@/features/core/IFundAyitiContext";
import { GlassCard } from "@/components/ui/GlassCard";
import type { TeamMember, TeamMemberStatus } from "@/features/core/types";
import { toast } from "sonner";

export default function TeamPage() {
  const { team, addTeamMember, updateTeamMember, deleteTeamMember, changeTeamStatus } =
    useIFundAyiti();

  const [activeTab, setActiveTab] = useState("core");
  const [searchText, setSearchText] = useState("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // Filters
  const coreTeam = useMemo(() => {
    return team.filter(
      (m) =>
        (m.category === "director" || m.category === "member") &&
        m.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [team, searchText]);

  const volunteers = useMemo(() => {
    return team.filter(
      (m) =>
        m.category === "volunteer" &&
        m.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [team, searchText]);

  const pendingVolunteersCount = useMemo(() => {
    return team.filter((m) => m.category === "volunteer" && m.status === "pending").length;
  }, [team]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingMember(null);
    form.resetFields();
    setMemberModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    form.setFieldsValue({
      ...member,
      focusAreas: member.focusAreas.join(", "),
    });
    setMemberModalOpen(true);
  };

  const handleSaveMember = () => {
    form
      .validateFields()
      .then((values) => {
        const focusAreasArray = values.focusAreas
          ? values.focusAreas.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

        const payload = {
          ...values,
          focusAreas: focusAreasArray,
        };

        if (editingMember) {
          updateTeamMember(editingMember.id, payload);
          toast.success("Profile updated", {
            description: `${values.name}'s details have been saved successfully.`,
          });
        } else {
          addTeamMember({
            ...payload,
            status: "active", // Directors and Members start as active
          });
          toast.success("Team member added", {
            description: `${values.name} has been added to the Core Team.`,
          });
        }
        setMemberModalOpen(false);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleDeleteMember = (id: string) => {
    deleteTeamMember(id);
    toast.success("Member removed", {
      description: "The team member profile has been deleted.",
    });
  };

  // Volunteer Moderation Handlers
  const handleApproveVolunteer = (id: string, name: string) => {
    changeTeamStatus(id, "active");
    toast.success("Volunteer approved", {
      description: `${name} is now an active volunteer.`,
    });
  };

  const handleOpenRejectModal = (id: string) => {
    setRejectingId(id);
    rejectForm.resetFields();
    setRejectModalOpen(true);
  };

  const handleRejectVolunteer = () => {
    rejectForm
      .validateFields()
      .then((values) => {
        if (rejectingId) {
          changeTeamStatus(rejectingId, "rejected", values.reason);
          const name = team.find((t) => t.id === rejectingId)?.name ?? "Volunteer";
          toast.success("Application rejected", {
            description: `${name} has been notified of the rejection reason.`,
          });
        }
        setRejectModalOpen(false);
      })
      .catch((info) => {
        console.log("Validation Failed:", info);
      });
  };

  const handleBlockVolunteer = (id: string, name: string) => {
    changeTeamStatus(id, "blocked");
    toast.success("Volunteer blocked", {
      description: `${name}'s volunteer status is now blocked.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Input
            prefix={<SearchOutlined className="text-mist-500" />}
            placeholder="Search by name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
            className="w-full bg-white"
          />
        </div>
        {activeTab === "core" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto"
          >
            Add Team Member
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: "core",
            label: (
              <span className="px-1 py-0.5">Core Team</span>
            ),
            children: (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {coreTeam.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-mist-500">
                    No core team members found.
                  </div>
                ) : (
                  coreTeam.map((member) => (
                    <GlassCard key={member.id} className="relative flex flex-col p-5 h-full">
                      {member.featured && (
                        <Tag
                          color="gold"
                          className="absolute right-4 top-4 border-0 font-medium"
                        >
                          Featured
                        </Tag>
                      )}
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={member.image}
                          size={64}
                          icon={<UserOutlined />}
                          className="border border-navy-700/60"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-display text-base font-semibold text-cloud-100">
                            {member.name}
                          </h4>
                          <p className="mt-0.5 font-medium text-xs text-violet-600 capitalize">
                            {member.category}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-mist-500">
                            <EnvironmentOutlined />
                            <span className="truncate">{member.location}</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 flex-1 text-xs leading-relaxed text-mist-400 line-clamp-3">
                        {member.bio}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {member.focusAreas.map((area) => (
                          <Tag key={area} className="border-0 bg-navy-700/50 text-[10px] text-mist-400">
                            {area}
                          </Tag>
                        ))}
                      </div>

                      {/* Contacts & Socials */}
                      <div className="mt-4 flex items-center justify-between border-t border-navy-700/60 pt-3">
                        <div className="flex items-center gap-2">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              title={member.email}
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <MailOutlined className="text-sm" />
                            </a>
                          )}
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              title={member.phone}
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <PhoneOutlined className="text-sm" />
                            </a>
                          )}
                          {member.linkedin && (
                            <a
                              href={`https://${member.linkedin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <LinkedinOutlined className="text-sm" />
                            </a>
                          )}
                          {member.twitter && (
                            <a
                              href={`https://${member.twitter}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <TwitterOutlined className="text-sm" />
                            </a>
                          )}
                        </div>

                        {/* Actions */}
                        <Space size={8}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditModal(member)}
                            className="text-mist-500 hover:text-violet-600 hover:bg-black/5"
                          />
                          <Popconfirm
                            title="Delete team member profile?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDeleteMember(member.id)}
                            okText="Yes, delete"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              className="hover:bg-red-50!"
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            ),
          },
          {
            key: "volunteers",
            label: (
              <Badge count={pendingVolunteersCount} size="small" offset={[10, -2]}>
                <span className="px-1 py-0.5">Volunteer Applications</span>
              </Badge>
            ),
            children: (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {volunteers.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-mist-500">
                    No volunteers found.
                  </div>
                ) : (
                  volunteers.map((vol) => (
                    <GlassCard key={vol.id} className="relative flex flex-col p-5 h-full">
                      <div className="absolute right-4 top-4">
                        {vol.status === "pending" && <Tag color="warning">Pending</Tag>}
                        {vol.status === "active" && <Tag color="success">Active</Tag>}
                        {vol.status === "rejected" && <Tag color="error">Rejected</Tag>}
                        {vol.status === "blocked" && <Tag color="default">Blocked</Tag>}
                      </div>

                      <div className="flex items-start gap-4">
                        <Avatar
                          src={vol.image}
                          size={64}
                          icon={<UserOutlined />}
                          className="border border-navy-700/60"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-display text-base font-semibold text-cloud-100">
                            {vol.name}
                          </h4>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-mist-500">
                            <EnvironmentOutlined />
                            <span className="truncate">{vol.location}</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 flex-1 text-xs leading-relaxed text-mist-400 line-clamp-3">
                        {vol.bio}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {vol.focusAreas.map((area) => (
                          <Tag key={area} className="border-0 bg-navy-700/50 text-[10px] text-mist-400">
                            {area}
                          </Tag>
                        ))}
                      </div>

                      {vol.status === "rejected" && vol.rejectionReason && (
                        <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-[11px] text-red-700">
                          <strong>Rejection reason:</strong> {vol.rejectionReason}
                        </div>
                      )}

                      {/* Contacts & Moderation Controls */}
                      <div className="mt-4 flex items-center justify-between border-t border-navy-700/60 pt-3">
                        <div className="flex items-center gap-2">
                          {vol.email && (
                            <a
                              href={`mailto:${vol.email}`}
                              title={vol.email}
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <MailOutlined className="text-sm" />
                            </a>
                          )}
                          {vol.phone && (
                            <a
                              href={`tel:${vol.phone}`}
                              title={vol.phone}
                              className="text-mist-500 hover:text-violet-600"
                            >
                              <PhoneOutlined className="text-sm" />
                            </a>
                          )}
                        </div>

                        {/* Moderation Controls */}
                        {vol.status === "pending" ? (
                          <Space size={4}>
                            <Button
                              type="primary"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() => handleApproveVolunteer(vol.id, vol.name)}
                              className="bg-green-600 hover:bg-green-700 border-0 text-[11px]"
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => handleOpenRejectModal(vol.id)}
                              className="text-[11px]"
                            >
                              Reject
                            </Button>
                            <Button
                              type="text"
                              size="small"
                              icon={<StopOutlined />}
                              onClick={() => handleBlockVolunteer(vol.id, vol.name)}
                              className="text-mist-500 hover:text-black/80 hover:bg-black/5 text-[11px]"
                              title="Block Application"
                            />
                          </Space>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {vol.status !== "active" && (
                              <Button
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => handleApproveVolunteer(vol.id, vol.name)}
                                className="text-[11px]"
                              >
                                Activate
                              </Button>
                            )}
                            {vol.status !== "blocked" && (
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<StopOutlined />}
                                onClick={() => handleBlockVolunteer(vol.id, vol.name)}
                                className="hover:bg-red-50 text-[11px]"
                              >
                                Block
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Member Creation/Modification Modal */}
      <Modal
        title={editingMember ? "Edit Team Member" : "Add Team Member"}
        open={memberModalOpen}
        onOk={handleSaveMember}
        onCancel={() => setMemberModalOpen(false)}
        okText="Save Details"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name" }]}
          >
            <Input placeholder="Edline Jean" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            initialValue="member"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              options={[
                { label: "Director", value: "director" },
                { label: "Member", value: "member" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please input the location" }]}
          >
            <Input placeholder="Port-au-Prince, Haiti" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Avatar Image URL"
            rules={[{ required: true, message: "Please enter an avatar URL" }]}
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          <Form.Item name="bio" label="Biography">
            <Input.TextArea placeholder="Enter short bio details..." rows={3} />
          </Form.Item>

          <Form.Item
            name="focusAreas"
            label="Focus Areas (comma-separated)"
            help="Example: Operations, Finance, Field Reviews"
          >
            <Input placeholder="Operations, Partnerships" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter the email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="name@ifundayiti.org" />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input placeholder="+509 3711 2233" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="linkedin" label="LinkedIn Path">
              <Input placeholder="linkedin.com/in/username" />
            </Form.Item>

            <Form.Item name="twitter" label="Twitter Path">
              <Input placeholder="twitter.com/username" />
            </Form.Item>
          </div>

          <Form.Item
            name="featured"
            valuePropName="checked"
            initialValue={false}
          >
            <Select
              options={[
                { label: "Standard Member Profile", value: false },
                { label: "Featured Profile (pinned/starred)", value: true },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Reason Dialog */}
      <Modal
        title="Reason for Rejection"
        open={rejectModalOpen}
        onOk={handleRejectVolunteer}
        onCancel={() => setRejectModalOpen(false)}
        okText="Submit & Notify"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical" className="mt-4">
          <Form.Item
            name="reason"
            label="Please specify why this volunteer application is being rejected:"
            rules={[
              { required: true, message: "Please input a rejection reason" },
            ]}
          >
            <Input.TextArea
              placeholder="e.g. Focus areas do not align with current program requirements."
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
