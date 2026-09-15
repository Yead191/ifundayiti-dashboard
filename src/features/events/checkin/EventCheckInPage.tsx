import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Input, Button } from "antd";
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  CameraOutlined,
  ThunderboltOutlined,
  UserOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Html5Qrcode } from "html5-qrcode";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCheckInTicketMutation } from "@/redux/features/eventBookings/eventBookingsApi";
import { soundEffects } from "./soundAlerts";

interface VerificationResult {
  type: "success" | "warning" | "error";
  message: string;
  ticketCode: string;
  customerName?: string;
  eventName?: string;
  admitCount?: number;
  checkedInAt?: string;
}

interface RecentCheckInLog {
  ticketCode: string;
  customerName: string;
  eventName?: string;
  admitCount: number;
  timestamp: string;
  status: "success" | "duplicate";
}

export default function EventCheckInPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentCheckInLog[]>([]);

  const [checkInTicket, { isLoading: isCheckingIn }] = useCheckInTicketMutation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  // Sound test button
  const handleTestSound = () => {
    soundEffects.playSuccess();
  };

  const processTicketCode = async (rawCode: string) => {
    if (!rawCode || isProcessingRef.current) return;

    let code = rawCode.trim();
    // In case the QR code has a full URL e.g. https://.../ticket/IFA-2026-XXXXX
    const urlMatch = code.match(/(?:ticket|check-in)\/([A-Za-z0-9_-]+)/i);
    if (urlMatch) {
      code = urlMatch[1];
    }

    isProcessingRef.current = true;

    try {
      const res = await checkInTicket({ ticketCode: code }).unwrap();
      const booking = res.data?.booking;
      const alreadyCheckedIn = res.data?.alreadyCheckedIn;

      const eventTitle =
        typeof booking?.event === "object" && booking?.event !== null
          ? (booking.event as any).title
          : "Event Gathering";

      if (alreadyCheckedIn) {
        soundEffects.playWarning();
        setLastResult({
          type: "warning",
          message: res.message || "Warning: Ticket already scanned!",
          ticketCode: code,
          customerName: booking?.customerName || "Attendee",
          eventName: eventTitle,
          admitCount: booking?.quantity || 1,
          checkedInAt: booking?.checkedInAt,
        });

        setRecentLogs((prev) => [
          {
            ticketCode: code,
            customerName: booking?.customerName || "Attendee",
            eventName: eventTitle,
            admitCount: booking?.quantity || 1,
            timestamp: new Date().toLocaleTimeString(),
            status: "duplicate",
          },
          ...prev.slice(0, 19),
        ]);
      } else {
        soundEffects.playSuccess();
        setLastResult({
          type: "success",
          message: res.message || "Admit Confirmed! Welcome to the Event.",
          ticketCode: code,
          customerName: booking?.customerName || "Attendee",
          eventName: eventTitle,
          admitCount: booking?.quantity || 1,
          checkedInAt: booking?.checkedInAt || new Date().toISOString(),
        });

        setRecentLogs((prev) => [
          {
            ticketCode: code,
            customerName: booking?.customerName || "Attendee",
            eventName: eventTitle,
            admitCount: booking?.quantity || 1,
            timestamp: new Date().toLocaleTimeString(),
            status: "success",
          },
          ...prev.slice(0, 19),
        ]);
      }
      setTicketInput("");
    } catch (err: any) {
      soundEffects.playError();
      const errorMsg =
        err?.data?.message || err?.message || "Invalid ticket code or check-in denied.";
      setLastResult({
        type: "error",
        message: errorMsg,
        ticketCode: code,
      });
    } finally {
      // Cooldown pause before next scan to prevent double triggers
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1800);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      void processTicketCode(ticketInput.trim());
    }
  };

  // Camera scanner control
  const startScanner = async () => {
    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          void processTicketCode(decodedText);
        },
        () => {
          // ignore frame decode failures
        },
      );

      setIsScanning(true);
    } catch (err: any) {
      setCameraError(
        err?.message || "Unable to access device camera. Please check camera permissions or use manual code entry.",
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-mist-500">
            <Link to="/events" className="hover:text-emerald-700 hover:underline">
              Events
            </Link>
            <span>/</span>
            <Link to="/event-bookings" className="hover:text-emerald-700 hover:underline">
              Bookings
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Check-In</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Door Staff Live Check-In Scanner
          </h1>
          <p className="mt-0.5 text-xs text-mist-600">
            Scan attendee QR code passes or type ticket codes for instant admission verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<SoundOutlined />}
            onClick={handleTestSound}
            className="h-10 rounded-xl text-xs font-semibold border-slate-200 text-slate-600"
          >
            Audio Test
          </Button>

          <Link to="/event-bookings">
            <Button className="h-10 rounded-xl font-medium border-slate-200">
              All Bookings List
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Scanner Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Camera Viewport & Manual Input */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-6 space-y-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-display text-sm font-bold text-slate-800 flex items-center gap-2">
                <CameraOutlined className="text-emerald-700" />
                <span>Live Camera QR Scanner</span>
              </span>

              {isScanning ? (
                <Button
                  size="small"
                  danger
                  onClick={stopScanner}
                  className="rounded-lg text-xs"
                >
                  Stop Camera
                </Button>
              ) : (
                <Button
                  size="small"
                  type="primary"
                  onClick={startScanner}
                  className="rounded-lg text-xs bg-[#0B3D2E] hover:bg-[#082b20] border-0"
                >
                  Start Camera Feed
                </Button>
              )}
            </div>

            {/* Video Viewport */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-950 flex flex-col items-center justify-center min-h-[280px]">
              <div id="reader" className="w-full" />

              {!isScanning && (
                <div className="p-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-[#D4AF37] ring-1 ring-white/10">
                    <QrcodeOutlined className="text-3xl" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">
                      Camera Scanner Inactive
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Click &quot;Start Camera Feed&quot; above to enable camera scanning, or use the rapid code input below.
                    </p>
                  </div>
                  <Button
                    type="primary"
                    onClick={startScanner}
                    className="rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] font-semibold border-0 text-xs px-5"
                  >
                    Enable Camera
                  </Button>
                </div>
              )}

              {cameraError && (
                <div className="p-4 bg-rose-950/80 border-t border-rose-800 text-rose-200 text-xs text-center w-full">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Manual Code Input Form */}
            <form onSubmit={handleManualSubmit} className="pt-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Rapid Ticket ID Entry (or Barcode Gun Scanner)
              </label>
              <div className="flex gap-2">
                <Input
                  size="large"
                  placeholder="e.g. IFA-2026-8X7Q3"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                  className="rounded-xl font-mono uppercase font-bold tracking-wider"
                  autoFocus
                />
                <Button
                  size="large"
                  type="primary"
                  htmlType="submit"
                  loading={isCheckingIn}
                  className="rounded-xl bg-[#0B3D2E] hover:bg-[#082b20] font-bold border-0 px-6"
                >
                  Verify & Admit
                </Button>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Press Enter on keyboard or scan with USB barcode scanner to submit automatically.
              </span>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Instant Verification Display */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard className="p-6 space-y-4 border border-slate-200 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ThunderboltOutlined className="text-amber-600" />
                <span>Admission Decision</span>
              </h2>

              {/* Status Display Area */}
              {lastResult ? (
                <div className="pt-4 space-y-4 animate-in fade-in">
                  {/* SUCCESS */}
                  {lastResult.type === "success" && (
                    <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-6 text-center space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
                        <CheckCircleOutlined className="text-3xl" />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-600 text-white shadow-xs">
                          ADMIT {lastResult.admitCount || 1}
                        </span>
                        <h3 className="font-display text-2xl font-extrabold text-emerald-950 mt-2">
                          {lastResult.customerName}
                        </h3>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          {lastResult.eventName}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-emerald-200/80 text-xs text-emerald-700 font-mono">
                        Ticket: <strong>{lastResult.ticketCode}</strong>
                      </div>
                    </div>
                  )}

                  {/* WARNING: ALREADY CHECKED IN */}
                  {lastResult.type === "warning" && (
                    <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-6 text-center space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg">
                        <ExclamationCircleOutlined className="text-3xl" />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-amber-600 text-white shadow-xs">
                          DOUBLE ENTRY WARNING
                        </span>
                        <h3 className="font-display text-xl font-extrabold text-amber-950 mt-2">
                          Already Scanned!
                        </h3>
                        <p className="text-xs text-amber-800 mt-1">
                          {lastResult.message}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-amber-200/80 text-xs text-amber-900 font-semibold">
                        Guest: {lastResult.customerName} ({lastResult.ticketCode})
                      </div>
                    </div>
                  )}

                  {/* ERROR: INVALID OR DENIED */}
                  {lastResult.type === "error" && (
                    <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 p-6 text-center space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                        <CloseCircleOutlined className="text-3xl" />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-rose-600 text-white shadow-xs">
                          ADMISSION DENIED
                        </span>
                        <h3 className="font-display text-xl font-extrabold text-rose-950 mt-2">
                          Invalid Ticket Pass
                        </h3>
                        <p className="text-xs text-rose-800 mt-1 font-medium">
                          {lastResult.message}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-rose-200/80 text-xs text-rose-700 font-mono">
                        Code attempted: {lastResult.ticketCode}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <QrcodeOutlined className="text-4xl text-slate-300" />
                  <p className="text-xs">
                    Ready to scan. Present an attendee QR code or enter ticket code.
                  </p>
                </div>
              )}
            </div>

            {/* Instruction footer */}
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              Door check-in automatically logs admission timestamp and updates attendee status in real-time.
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Real-time Door Check-In Activity Stream */}
      <GlassCard className="p-6 space-y-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-emerald-700" />
            <h3 className="font-display text-base font-bold text-slate-900">
              Recent Door Check-In Activity ({recentLogs.length})
            </h3>
          </div>
          {recentLogs.length > 0 && (
            <Button
              size="small"
              type="text"
              onClick={() => setRecentLogs([])}
              className="text-xs text-slate-400"
            >
              Clear Log
            </Button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No check-in scans recorded during this session yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLogs.map((log, idx) => (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] ${
                      log.status === "success" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  >
                    {log.status === "success" ? "✓" : "!"}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{log.customerName}</span>
                    <span className="text-slate-400 font-mono ml-2">({log.ticketCode})</span>
                    <span className="text-slate-500 ml-2">• Admit {log.admitCount}</span>
                  </div>
                </div>

                <div className="text-slate-400 font-mono text-[11px]">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
