"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "@/components/LanguageDropdown";
import Footer from "@/components/Footer";

export default function DeleteAccountPage() {
  const { t } = useTranslation();

  const steps = t("deleteAccount.inAppSteps", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <Link href="/">
            <Image
              src="/logo-with-name.png"
              alt="Zingg"
              width={1129}
              height={90}
              className="h-10 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <LanguageDropdown />
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 text-center mb-6">
          {t("deleteAccount.title")}
        </h1>
        <p className="text-gray-600 text-center mb-16">{t("deleteAccount.intro")}</p>
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("deleteAccount.inAppHeading")}</h2>
            <ol className="list-decimal ps-6 space-y-1 text-gray-600 leading-relaxed">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("deleteAccount.emailHeading")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("deleteAccount.emailBody")}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("deleteAccount.whatHeading")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("deleteAccount.whatBody")}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t("deleteAccount.keptHeading")}</h2>
            <p className="text-gray-600 leading-relaxed">{t("deleteAccount.keptBody")}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
