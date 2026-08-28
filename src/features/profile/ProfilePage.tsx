import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, Form, Input, Skeleton } from "antd";
import {
  CameraOutlined,
  LockOutlined,
  SaveOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { getImageUrl } from "@/lib/getImageUrl";
import { buildProfileFormData } from "@/redux/features/auth/buildProfileFormData";
import {
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/features/auth/authApi";
import { getAuthErrorMessage } from "@/features/auth/authUtils";

interface ProfileFormValues {
  name: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function formatRole(role?: string) {
  if (!role) return "Admin";
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useGetProfileQuery();
  const user = data?.data;

  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  useEffect(() => {
    if (!user) return;
    profileForm.setFieldsValue({ name: user.name });
  }, [user, profileForm]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const avatarSrc = useMemo(() => {
    if (imagePreview) return imagePreview;
    return getImageUrl(user?.image);
  }, [imagePreview, user?.image]);

  const nameValue = Form.useWatch("name", profileForm);

  const profileDirty =
    !!imageFile || (user ? (nameValue?.trim() ?? "") !== user.name.trim() : false);

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", { description: "Please choose an image file." });
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleProfileSave = async (values: ProfileFormValues) => {
    try {
      await updateProfile(
        buildProfileFormData({
          name: values.name,
          imageFile,
        })
      ).unwrap();

      setImageFile(null);
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);

      toast.success("Profile updated", { description: "Your changes have been saved." });
    } catch (error) {
      toast.error("Couldn't update profile", {
        description: getAuthErrorMessage(error),
      });
    }
  };

  const handlePasswordChange = async (values: PasswordFormValues) => {
    try {
      const res = await changePassword(values).unwrap();
      passwordForm.resetFields();
      toast.success("Password changed", {
        description: res.message ?? "Use your new password next time you sign in.",
      });
    } catch (error) {
      toast.error("Couldn't change password", {
        description: getAuthErrorMessage(error, "Check your current password and try again."),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="aurora-field glass-panel overflow-hidden p-6 md:p-8">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
          <div className="relative">
            <Avatar
              src={avatarSrc || undefined}
              icon={<UserOutlined />}
              size={96}
              className="border-2 border-violet-600/30 shadow-[0_12px_32px_-12px_rgba(129,49,240,0.55)]"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 bg-linear-to-br from-[#8131F0] to-[#4A1C8A] text-white shadow-lg transition hover:brightness-110"
              aria-label="Change profile photo"
            >
              <CameraOutlined />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <StatusTag tone="violet">{formatRole(user?.role)}</StatusTag>
            </div>
            <h2 className="font-display text-2xl font-semibold text-cloud-100">{user?.name}</h2>
            <p className="mt-1 text-sm text-mist-400">{user?.email}</p>
            <p className="mt-2 text-xs text-mist-600">
              You can update your display name and profile photo. Email is managed by your account
              administrator.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard flat>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 text-violet-glow">
              <UserOutlined />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-cloud-100">Profile details</h3>
              <p className="text-xs text-mist-500">Update your display name and photo</p>
            </div>
          </div>

          <Form
            form={profileForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handleProfileSave}
            initialValues={{ name: user?.name ?? "" }}
          >
            <Form.Item
              label={<span className="text-mist-400">Display name</span>}
              name="name"
              rules={[
                { required: true, message: "Enter your name" },
                { min: 2, message: "Name should be at least 2 characters" },
              ]}
            >
              <Input size="large" placeholder="Your name" />
            </Form.Item>

            <Form.Item label={<span className="text-mist-400">Email address</span>}>
              <Input size="large" value={user?.email} disabled />
            </Form.Item>

            <div className="flex flex-col gap-3 border-t border-navy-700/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-mist-600">
                {imageFile ? `New photo selected: ${imageFile.name}` : "JPG or PNG recommended."}
              </p>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isSavingProfile}
                disabled={!profileDirty}
                className="btn-gradient border-0!"
              >
                Save profile
              </Button>
            </div>
          </Form>
        </GlassCard>

        <GlassCard flat>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 text-violet-glow">
              <SafetyOutlined />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-semibold text-cloud-100">Change password</h3>
              <p className="text-xs text-mist-500">Keep your account secure with a strong password</p>
            </div>
          </div>

          <p className="mb-5 text-sm text-mist-400">
            You'll need your current password to confirm the change.
          </p>

          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handlePasswordChange}
          >
            <Form.Item
              label={<span className="text-mist-400">Current password</span>}
              name="currentPassword"
              rules={[{ required: true, message: "Enter your current password" }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-mist-600" />}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-mist-400">New password</span>}
              name="newPassword"
              rules={[
                { required: true, message: "Enter a new password" },
                { min: 8, message: "Use at least 8 characters" },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-mist-600" />}
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-mist-400">Confirm new password</span>}
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords don't match"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-mist-600" />}
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="flex justify-end border-t border-navy-700/60 pt-5">
              <Button
                type="primary"
                htmlType="submit"
                icon={<LockOutlined />}
                loading={isChangingPassword}
                className="btn-gradient border-0!"
              >
                Update password
              </Button>
            </div>
          </Form>
        </GlassCard>
      </div>
    </div>
  );
}
