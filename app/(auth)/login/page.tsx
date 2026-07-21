"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <span className="rtl:rotate-180">←</span> {t("auth.backHome")}
        </Link>

        {/* Logo / Hero */}
        <div className="text-center mb-8">
          <Image
            src="/logo-with-name.png"
            alt="Zingg"
            width={225}
            height={150}
            className="h-12 w-auto mx-auto mb-3"
            priority
          />
          <p className="text-gray-500 text-sm mt-1">
            {t("auth.login.tagline")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("auth.login.welcomeBack")}
          </h2>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
