import { Button, Form, Input } from "antd";
import { ArrowRightOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForgetPasswordMutation } from "@/redux/features/auth/authApi";
import { AuthShell } from "./components/AuthShell";
import { getAuthErrorMessage } from "./authUtils";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
  const [form] = Form.useForm<FormValues>();

  const handleFinish = async (values: FormValues) => {
    const email = values.email.trim().toLowerCase();
    try {
      const res = await forgetPassword({ email }).unwrap();
      toast.success("Check your inbox", {
        description: res.message ?? "We sent a 4-digit verification code to your email.",
      });
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      toast.error("Couldn't send code", {
        description: getAuthErrorMessage(error, "Please check the email and try again."),
      });
    }
  };

  return (
    <AuthShell
      step={1}
      title="Forgot password?"
      subtitle="Enter the email linked to your admin account. We'll send a one-time code to verify it's you."
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          label={<span className="text-mist-400">Email address</span>}
          name="email"
          rules={[
            { required: true, message: "Enter your email address" },
            { type: "email", message: "Enter a valid email address" },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined className="text-mist-600" />}
            placeholder="you@company.com"
            autoComplete="email"
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
          Send verification code
        </Button>
      </Form>

      <p className="mt-5 text-center text-xs text-mist-600">
        Remember your password?{" "}
        <Link to="/login" className="text-violet-glow hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
