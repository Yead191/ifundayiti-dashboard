import { useState } from "react";
import { SoundOutlined, CloseOutlined, ThunderboltOutlined, MailOutlined } from "@ant-design/icons";

interface CommunityBroadcastBannerProps {
  className?: string;
}

export function CommunityBroadcastBanner({ className = "" }: CommunityBroadcastBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/50 p-4 shadow-xs backdrop-blur-xs transition-all ${className}`}
    >
      <div className="flex items-start gap-3.5 sm:items-center justify-between">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B3D2E] text-white shadow-xs">
            <SoundOutlined className="text-lg animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-bold text-gray-900">
                Automatic Member Broadcast Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                <ThunderboltOutlined className="text-[10px]" />
                In-App Push + Email
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
              Publishing an announcement automatically dispatches real-time socket push notifications and branded email newsletters to all verified iFundAyiti members.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1 -mt-1 sm:mt-0 rounded-lg"
          aria-label="Dismiss banner"
        >
          <CloseOutlined className="text-xs" />
        </button>
      </div>

      <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-emerald-400/10 blur-xl" />
    </div>
  );
}
