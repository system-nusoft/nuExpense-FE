"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { verifyEmailApi, resendOtpApi } from "@/lib/services/auth.service";
import OtpInput from "@/components/auth/OtpInput";
import Button from "@/components/Button";

const RESEND_COOLDOWN = 60;

function VerifyEmailContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const { setUserFromTokens } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) router.replace("/signup");
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await verifyEmailApi(email, code);
      setUserFromTokens(data.accessToken, data.refreshToken, data.user);
      router.push("/onboarding");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Invalid or expired code. Please try again.";
      setError(message);
      setCode("");
    } finally {
      setLoading(false);
    }
  }, [code, email, setUserFromTokens, router]);

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.length === 6 && !loading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function handleResend() {
    setResendSuccess(null);
    setError(null);
    setResendLoading(true);
    try {
      const res = await resendOtpApi(email);
      setResendSuccess(res.message);
      setCooldown(RESEND_COOLDOWN);
      setCode("");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to resend code. Please try again.";
      setError(message);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="text-gray-500 text-sm mt-2">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {resendSuccess && !error && (
        <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {resendSuccess}
        </div>
      )}

      <OtpInput
        value={code}
        onChange={setCode}
        disabled={loading}
        error={!!error}
      />

      <p className="text-xs text-gray-400">Code expires in 10 minutes</p>

      <Button
        onClick={handleVerify}
        loading={loading}
        size="lg"
        className="px-10"
        disabled={code.length !== 6}
      >
        Verify Email
      </Button>

      <div className="text-sm text-gray-500">
        Didn&apos;t receive it?{" "}
        {cooldown > 0 ? (
          <span className="text-gray-400">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-indigo-600 font-medium hover:underline disabled:opacity-50"
          >
            {resendLoading ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
