import { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import {
  UserOutlined,
  MailOutlined,
  BankOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useUpdateUserMutation } from "@/redux/features/users/usersApi";
import type { ApiUser } from "@/redux/features/users/users.types";

interface EditUserModalProps {
  user: ApiUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUserModal({
  user,
  open,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [form] = Form.useForm();
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "USER",
        status: user.status || "active",
        verified: Boolean(user.verified),
        company: user.company || "",
        interest: user.interest || "",
        rejectionReason: user.rejectionReason || "",
      });
    } else {
      form.resetFields();
    }
  }, [user, open, form]);

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const values = await form.validateFields();
      await updateUser({
        id: user._id,
        data: {
          name: values.name.trim(),
          role: values.role,
          status: values.status,
          verified: values.verified,
          company: values.company ? values.company.trim() : "",
          interest: values.interest ? values.interest.trim() : "",
          rejectionReason: values.rejectionReason ? values.rejectionReason.trim() : "",
        },
      }).unwrap();

      toast.success("User updated successfully");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const errorMsg =
        err?.data?.message || err?.message || "Failed to update user profile.";
      toast.error(errorMsg);
    }
  };

  const statusValue = Form.useWatch("status", form);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0B3D2E]">
            <UserOutlined />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Edit User & Role
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Update account credentials, platform permissions, and profile fields
            </p>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Save Changes"
      okButtonProps={{
        className: "bg-[#0B3D2E] hover:bg-emerald-800! border-0 rounded-lg",
      }}
      cancelButtonProps={{ className: "rounded-lg" }}
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-3">
        <Form.Item
          name="name"
          label={<span className="text-xs font-semibold text-slate-700">Full Name</span>}
          rules={[{ required: true, message: "Please input full name" }]}
        >
          <Input
            prefix={<UserOutlined className="text-slate-400" />}
            placeholder="e.g. Jean-Pierre Duval"
            className="rounded-xl h-10"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="text-xs font-semibold text-slate-700">Email Address</span>}
          tooltip="Primary account email identifier"
        >
          <Input
            prefix={<MailOutlined className="text-slate-400" />}
            disabled
            className="rounded-xl h-10 bg-slate-50 text-slate-500"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="role"
            label={<span className="text-xs font-semibold text-slate-700">Account Role</span>}
            rules={[{ required: true }]}
          >
            <Select
              className="rounded-xl h-10 w-full"
              options={[
                { label: "Regular User (USER)", value: "USER" },
                { label: "Platform Admin (ADMIN)", value: "ADMIN" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-xs font-semibold text-slate-700">Account Status</span>}
            rules={[{ required: true }]}
          >
            <Select
              className="rounded-xl h-10 w-full"
              options={[
                { label: "Active", value: "active" },
                { label: "Blocked", value: "blocked" },
                { label: "Pending Review", value: "pending" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
          </Form.Item>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800">Email Verified Status</span>
            <p className="text-[11px] text-slate-500">
              Verified accounts can apply for grants, place orders, and manage vendor shops
            </p>
          </div>
          <Form.Item name="verified" valuePropName="checked" noStyle>
            <Switch
              checkedChildren="Verified"
              unCheckedChildren="Unverified"
              className="bg-slate-300"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            name="company"
            label={<span className="text-xs font-semibold text-slate-700">Company / Organization</span>}
          >
            <Input
              prefix={<BankOutlined className="text-slate-400" />}
              placeholder="e.g. Duval Agro Industries"
              className="rounded-xl h-10"
            />
          </Form.Item>

          <Form.Item
            name="interest"
            label={<span className="text-xs font-semibold text-slate-700">Area of Interest</span>}
          >
            <Input
              prefix={<TagOutlined className="text-slate-400" />}
              placeholder="e.g. Agriculture & Grants"
              className="rounded-xl h-10"
            />
          </Form.Item>
        </div>

        {(statusValue === "rejected" || statusValue === "blocked") && (
          <Form.Item
            name="rejectionReason"
            label={<span className="text-xs font-semibold text-rose-700">Reason for Block / Rejection</span>}
          >
            <Input.TextArea
              rows={2}
              placeholder="Explain why this account was blocked or rejected (visible in audit logs)..."
              className="rounded-xl"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
