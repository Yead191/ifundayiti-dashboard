import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 4;

export function OtpInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const updateAt = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d)).join("");
    onChange(next.replace(/\s/g, ""));
  };

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, OTP_LENGTH - 1));
    inputsRef.current[clamped]?.focus();
    setFocusedIndex(clamped);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateAt(index, digit);
    if (digit && index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (digits[index]) {
        updateAt(index, "");
      } else if (index > 0) {
        updateAt(index - 1, "");
        focusIndex(index - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusIndex(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div>
      <div className="flex justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onFocus={() => setFocusedIndex(index)}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "h-14 w-12 rounded-xl border bg-navy-800/60 text-center font-display text-xl font-semibold text-cloud-100 outline-none transition",
              "focus:border-violet-glow focus:ring-2 focus:ring-violet-600/30",
              error ? "border-danger/50" : "border-navy-600/80",
              focusedIndex === index && !error && "border-violet-600/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-danger">Enter the 4-digit code from your email.</p>
      )}
    </div>
  );
}

export function isOtpComplete(value: string) {
  return /^\d{4}$/.test(value);
}
