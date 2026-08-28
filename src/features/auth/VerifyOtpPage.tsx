import { useEffect, useState } from "react";
import { Button } from "antd";
import { ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useForgetPasswordMutation, useVerifyEmailMutation } from "@/redux/features/auth/authApi";
import { AuthShell } from "./components/AuthShell";
import { isOtpComplete, OtpInput } from "./components/OtpInput";
import { getAuthErrorMessage, maskEmail } from "./authUtils";

interface LocationState {
  email?: string;
}

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email?.trim().toLowerCase() ?? "";

  const [otp, setOtp] = useState("");
  const [showError, setShowError] = useState(false);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [forgetPassword, { isLoading: isResending }] = useForgetPasswordMutation();

  useEffect(() => {
    setShowError(false);
  }, [otp]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleVerify = async () => {
    if (!isOtpComplete(otp)) {
      setShowError(true);
      return;
    }

    try {
      const res = await verifyEmail({
        email,
        oneTimeCode: Number(otp),
      }).unwrap();

      toast.success("Code verified", {
        description: "You can now choose a new password.",
      });

      navigate("/reset-password", {
        state: { email, resetToken: res.data },
        replace: true,
      });
    } catch (error) {
      setShowError(true);
      toast.error("Invalid code", {
        description: getAuthErrorMessage(error, "The code is incorrect or has expired."),
      });
    }
  };

  const handleResend = async () => {
    try {
      const res = await forgetPassword({ email }).unwrap();
      setOtp("");
      setShowError(false);
      toast.success("Code resent", {
        description: res.message ?? "A new verification code was sent to your email.",
      });
    } catch (error) {
      toast.error("Couldn't resend code", {
        description: getAuthErrorMessage(error),
      });
    }
  };

  return (
    <AuthShell
      step={2}
      title="Verify your email"
      subtitle={`We sent a 4-digit code to ${maskEmail(email)}. Enter it below to continue.`}
      backTo="/forgot-password"
      backLabel="Use a different email"
    >
      <div className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} error={showError} />

        <Button
          type="primary"
          size="large"
          block
          loading={isLoading}
          disabled={!isOtpComplete(otp)}
          className="btn-gradient border-0!"
          icon={<ArrowRightOutlined />}
          iconPlacement="end"
          onClick={handleVerify}
        >
          Verify code
        </Button>

        <div className="flex flex-col items-center gap-2 border-t border-navy-700/60 pt-5">
          <p className="text-xs text-mist-500">Didn't receive the code?</p>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            loading={isResending}
            onClick={handleResend}
            className="text-violet-glow! hover:bg-violet-600/10!"
          >
            Resend code
          </Button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-mist-600">
        <Link to="/login" className="text-violet-glow hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
