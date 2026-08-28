export function AuthGateLoader({
  label = "Verifying your session",
}: {
  label?: string;
}) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-navy-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-[#4A1C8A]/35 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(129,49,240,0.08),transparent_55%)]" />
      </div>

      <div className="relative flex flex-col items-center px-6">
        <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 animate-[spin_2.8s_linear_infinite] rounded-full border border-violet-600/20 border-t-violet-glow/90 border-r-violet-600/35" />
          <span className="absolute inset-2.5 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border border-transparent border-b-warning/65 border-l-warning/20" />
          <span className="absolute inset-5 animate-pulse rounded-full bg-violet-600/15 blur-xl" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-navy-800/80 shadow-[0_12px_40px_-12px_rgba(129,49,240,0.55)] backdrop-blur-sm">
            <img src="/logo-hubology.svg" alt="Hubology" className="h-8 w-auto" />
          </div>
        </div>

        <div className="text-center">
          <p className="font-display text-base font-semibold tracking-tight text-cloud-100">
            Hubology Admin
          </p>
          <p className="mt-1.5 text-sm text-mist-400">{label}</p>
        </div>

        <div className="mt-6 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-violet-glow" />
          <span className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_0.2s_infinite] rounded-full bg-violet-glow/70" />
          <span className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_0.4s_infinite] rounded-full bg-violet-glow/40" />
        </div>
      </div>
    </div>
  );
}
