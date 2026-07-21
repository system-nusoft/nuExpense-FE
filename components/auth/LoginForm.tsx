"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t("auth.login.errorFillFields"));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        t("auth.login.errorInvalid");
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
        placeholder={t("auth.login.passwordPlaceholder")}
        required
        disabled={loading}
      />

      <Button type="submit" loading={loading} className="w-full mt-2">
        {t("auth.login.submit")}
      </Button>

      <p className="text-sm text-center text-gray-500">
        {t("auth.login.noAccount")}{" "}
        <Link
          href="/signup"
          className="text-[#3e6378] font-medium hover:underline"
        >
          {t("auth.login.createOne")}
        </Link>
      </p>
    </form>
  );
}
