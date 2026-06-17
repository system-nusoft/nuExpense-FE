"use client";

import React, { useRef, useState, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] ?? "")
  );
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(Array.from({ length }, (_, i) => value[i] ?? ""));
  }, [value, length]);

  function update(next: string[]) {
    setDigits(next);
    onChange(next.join(""));
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        update(next);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    update(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputs.current[focusIndex]?.focus();
  }

  const borderClass = error
    ? "border-red-400 focus:ring-red-400"
    : "border-gray-300 focus:ring-indigo-500";

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none focus:ring-2 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400 ${borderClass}`}
        />
      ))}
    </div>
  );
}
