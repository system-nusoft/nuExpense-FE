"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function SignupForm() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError(t("auth.signup.errorFillFields"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.signup.errorPasswordLength"));
      return;
    }

    setLoading(true);
    try {
      const verifiedEmail = await signup(email, password, name);
      router.push(`/verify-email?email=${encodeURIComponent(verifiedEmail)}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("auth.signup.errorFailed");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label={t("auth.signup.fullNameLabel")}
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("auth.signup.fullNamePlaceholder")}
        required
        disabled={loading}
      />

      <Input
        label={t("auth.emailLabel")}
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("auth.emailPlaceholder")}
        required
        disabled={loading}
      />

      <Input
        label={t("auth.passwordLabel")}
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("auth.signup.passwordPlaceholder")}
        required
        disabled={loading}
      />

      <Button type="submit" loading={loading} className="w-full mt-2">
        {t("auth.signup.submit")}
      </Button>

      <p className="text-sm text-center text-gray-500">
        {t("auth.signup.haveAccount")}{" "}
        <Link href="/login" className="text-[#3e6378] font-medium hover:underline">
          {t("auth.signup.signIn")}
        </Link>
      </p>
    </form>
  );
}
