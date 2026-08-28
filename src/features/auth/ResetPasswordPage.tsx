import { Button, Form, Input } from "antd";
import { ArrowRightOutlined, CheckCircleOutlined, LockOutlined } from "@ant-design/icons";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useResetPasswordMutation } from "@/redux/features/auth/authApi";
import { AuthShell } from "./components/AuthShell";
import { getAuthErrorMessage } from "./authUtils";

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

interface LocationState {
  email?: string;
  resetToken?: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const email = state.email?.trim().toLowerCase() ?? "";
  const resetToken = state.resetToken ?? "";

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [form] = Form.useForm<FormValues>();

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleFinish = async (values: FormValues) => {
    try {
      const res = await resetPassword({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
        resetToken,
      }).unwrap();

      toast.success("Password updated", {
        description: res.message ?? "You can now sign in with your new password.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Couldn't reset password", {
        description: getAuthErrorMessage(error, "Your reset session may have expired. Try again."),
      });
    }
  };

  return (
    <AuthShell
      step={3}
      title="Create new password"
      subtitle="Choose a strong password you'll use to sign in to Hubology admin."
      backTo="/verify-otp"
      backState={{ email }}
      backLabel="Back to verification"
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-success/20 bg-success/8 px-4 py-3">
        <CheckCircleOutlined className="text-success" />
        <p className="text-xs leading-relaxed text-mist-400">
          Email verified. Set your new password below to complete the reset.
        </p>
      </div>

      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-mist-400">Confirm password</span>}
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
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          loading={isLoading}
          className="btn-gradient mt-2! border-0!"
          icon={<ArrowRightOutlined />}
          iconPlacement="end"
        >
          Reset password
        </Button>
      </Form>

      <p className="mt-5 text-center text-xs text-mist-600">
        <Link to="/login" className="text-violet-glow hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
