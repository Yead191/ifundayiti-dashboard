export function AuthGateLoader({
  label = "Verifying your session",
}: {
  label?: string;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-navy-900">
      {/* CSS Styles for premium animations */}
      <style>{`
        @keyframes premium-sweep {
          0% {
            left: -100%;
            width: 50%;
          }
          100% {
            left: 100%;
            width: 50%;
          }
        }
        .animate-premium-sweep {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, transparent, #0038a8, #d21034, transparent);
          animation: premium-sweep 2.2s infinite ease-in-out;
        }
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
      `}</style>

      {/* Grid Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 56, 168, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 56, 168, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient aurora glowing backgrounds matching the logo colors */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Haitian Blue Glow - Top Left */}
        <div className="absolute -top-40 -left-20 h-130 w-130 rounded-full bg-[#0038a8]/6 blur-[120px]" />

        {/* Haitian Red Glow - Bottom Right */}
        <div className="absolute -bottom-40 -right-20 h-130 w-130 rounded-full bg-[#d21034]/5 blur-[120px]" />

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-140 w-140 rounded-full bg-[#0038a8]/3 blur-[130px]" />
      </div>

      {/* Main Glassmorphic Panel container */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-float-gentle">
        <div className="glass-panel flex flex-col items-center border border-white/60 bg-white/70 px-8 py-12 shadow-[0_32px_60px_-15px_rgba(0,56,168,0.1)] backdrop-blur-xl">
          {/* Circular Spinner Area */}
          <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
            {/* Outer Ring - Haitian Blue */}
            <span className="absolute inset-0 animate-[spin_3.5s_linear_infinite] rounded-full border-[3px] border-transparent border-t-[#0038a8] border-r-[#0038a8]/25" />

            {/* Middle Ring - Haitian Red (reversing) */}
            <span className="absolute inset-2.5 animate-[spin_2.2s_linear_infinite_reverse] rounded-full border-[3px] border-transparent border-b-[#d21034] border-l-[#d21034]/25" />

            {/* Inner Glow Aura */}
            <span className="absolute inset-5 animate-pulse rounded-full bg-[#0038a8]/5 blur-md" />

            {/* Logo Center Container */}
            <div className="relative flex h-22 w-22 items-center justify-center rounded-2xl border border-white bg-white shadow-[0_12px_36px_-6px_rgba(0,56,168,0.12)]">
              <img
                src="/logo-ifundayiti.png"
                alt="IFundAyiti Logo"
                className="h-12 w-auto object-contain transition-all duration-300 hover:scale-105"
              />
            </div>
          </div>

          {/* Secure Badge */}
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[#0038a8]/10 bg-[#0038a8]/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0038a8]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d21034] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0038a8]"></span>
            </span>
            Secure Authorization
          </div>

          {/* Typography Section */}
          <div className="text-center">
            <h1 className="font-display text-xl font-extrabold tracking-tight">
              <span className="text-[#0038a8]">IFund</span>
              <span className="text-[#d21034]">Ayiti</span>
              <span className="ml-1 text-[10px] font-bold text-mist-400 uppercase tracking-widest block mt-1">
                Admin Portal
              </span>
            </h1>
            <p className="mt-3 text-sm font-medium text-mist-600">{label}</p>
          </div>

          {/* Premium Crawling Progress Bar */}
          <div className="relative mt-8 h-1 w-44 overflow-hidden rounded-full bg-slate-100/90">
            <div className="animate-premium-sweep" />
          </div>
        </div>
      </div>
    </div>
  );
}
