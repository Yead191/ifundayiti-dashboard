import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  subtitle,
  step,
  totalSteps = 3,
  backTo = "/login",
  backLabel = "Back to sign in",
  backState,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  backTo?: string;
  backLabel?: string;
  backState?: unknown;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-4 py-10">
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
          <img src="/logo-hubology.svg" alt="Hubology" className="mb-4 h-14 w-auto" />
          <h1 className="font-display text-xl font-semibold tracking-tight text-cloud-100">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-sm text-sm text-mist-400">{subtitle}</p>}

          {step !== undefined && (
            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const active = stepNumber === step;
                const done = stepNumber < step;
                return (
                  <div key={stepNumber} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition",
                        done && "border-violet-600/40 bg-violet-600/20 text-violet-glow",
                        active && "border-violet-glow bg-linear-to-br from-[#8131F0] to-[#4A1C8A] text-white shadow-[0_8px_20px_-8px_rgba(129,49,240,0.8)]",
                        !done && !active && "border-navy-600 bg-navy-800/40 text-mist-600"
                      )}
                    >
                      {stepNumber}
                    </div>
                    {stepNumber < totalSteps && (
                      <div
                        className={cn(
                          "h-px w-8 transition",
                          done ? "bg-violet-600/50" : "bg-navy-600/80"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel px-7 py-8">{children}</div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <Link
            to={backTo}
            state={backState}
            className="inline-flex items-center gap-1.5 text-sm text-mist-500 transition hover:text-violet-glow"
          >
            <ArrowLeftOutlined className="text-xs" />
            {backLabel}
          </Link>
          {footer}
        </div>
      </div>
    </div>
  );
}
