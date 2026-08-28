import { Button, Form, Input } from "antd";
import {
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getAuthErrorMessage } from "./authUtils";

interface LoginFormValues {
  email: string;
  password: string;
}

/** Pull a human-readable message out of an RTK Query error. */
function getErrorMessage(error: unknown): string {
  return getAuthErrorMessage(error, "Those credentials don't match our records.");
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const handleFinish = async (values: LoginFormValues) => {
    try {
      const res = await login(values).unwrap();
      const token = res.data?.createToken ?? res.data?.createToken;

      if (!token) {
        toast.error("Sign in failed", {
          description: "The server didn't return an access token.",
        });
        return;
      }

      dispatch(setCredentials({ user: res.data?.user ?? null, token }));
      toast.success("Welcome back", {
        description: "You're signed in to Hubology admin.",
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Sign in failed", { description: getErrorMessage(error) });
    }
  };

  const [form] = Form.useForm<LoginFormValues>();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4">
      {/* Ambient aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-120 w-120 rounded-full bg-violet-600/25 blur-[110px]" />
        <div className="absolute -bottom-40 -right-20 h-105 w-105 rounded-full bg-violet-900/30 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-105">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/logo-hubology.svg"
            alt="Hubology"
            className="mb-4 h-14 w-auto"
          />
          <p className="mt-1 text-sm text-mist-400">
            Sign in to manage your workspace
          </p>
        </div>

        <div className="glass-panel px-7 py-8">
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleFinish}
          >
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
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-mist-400">Password</span>}
              name="password"
              rules={[{ required: true, message: "Enter your password" }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-mist-600" />}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Form.Item>

            <div className="-mt-1 mb-3 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-violet-glow transition hover:underline"
              >
                Forgot password?
              </Link>
            </div>

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
              Sign in
            </Button>
          </Form>
        </div>

        <p className="mt-6 text-center text-xs text-mist-600">
          Hubology Admin Dashboard — internal tool, not for client access.
        </p>
      </div>
    </div>
  );
}
