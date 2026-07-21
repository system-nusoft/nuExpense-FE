"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "@/components/LanguageDropdown";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const { t } = useTranslation();

  const heroFeatures = [
    {
      icon: "📷",
      tag: "AI",
      title: t("landing.features.scanTitle"),
      description: t("landing.features.scanDescription"),
    },
    {
      icon: "🗂️",
      tag: null,
      title: t("landing.features.budgetsTitle"),
      description: t("landing.features.budgetsDescription"),
    },
    {
      icon: "🤖",
      tag: "AI",
      title: t("landing.features.recapTitle"),
      description: t("landing.features.recapDescription"),
    },
  ];

  const moreFeatures = [
    {
      icon: "🌍",
      title: t("landing.moreFeatures.currencyTitle"),
      description: t("landing.moreFeatures.currencyDescription"),
    },
    {
      icon: "🏪",
      title: t("landing.moreFeatures.vendorTitle"),
      description: t("landing.moreFeatures.vendorDescription"),
    },
    {
      icon: "📤",
      title: t("landing.moreFeatures.csvTitle"),
      description: t("landing.moreFeatures.csvDescription"),
    },
  ];

  const stats = [
    { value: "161", label: t("landing.stats.currencies") },
    { value: "<5s", label: t("landing.stats.scanTime") },
    { value: "100%", label: t("landing.stats.free") },
  ];

  const withoutList = t("landing.withoutList", { returnObjects: true }) as string[];
  const withList = t("landing.withList", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <Image src="/logo-with-name.png" alt="Zingg" width={1129} height={90} className="h-10 w-auto" style={{ width: 'auto' }} priority />
          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#3e6378] text-white px-4 py-2 rounded-lg hover:bg-[#325163] transition-colors"
            >
              {t("landing.getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — split layout with receipt mockup */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -start-24 w-96 h-96 bg-[#abc5d5]/40 rounded-full blur-3xl" />
        <div className="absolute top-40 -end-24 w-96 h-96 bg-[#a2ddd9]/40 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#eef2f5] text-[#325163] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[#d5e2ea]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fa89d] animate-pulse" />
              {t("landing.badge")}
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6">
              {t("landing.heroTitleLine1")}
              <br />
              <span className="text-[#3e6378]">{t("landing.heroTitleHighlight")}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#3e6378] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#325163] transition-colors text-base shadow-lg shadow-[#3e6378]/20"
              >
                {t("landing.testItOut")}
                <span className="rtl:rotate-180">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-base border border-gray-200"
              >
                {t("landing.signIn")}
              </Link>
            </div>
            <div className="flex flex-col gap-2 mb-10">
              <span className="text-sm font-medium text-gray-600">{t("landing.downloadApp")}</span>
              <div className="flex items-center gap-3">
                <button disabled className="rounded-md border border-gray-400 cursor-not-allowed">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/app-store.svg" alt={t("landing.appStoreAlt")} className="h-10 w-auto" />
                </button>
                <button disabled className="cursor-not-allowed">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/google-play.webp" alt={t("landing.googlePlayAlt")} className="h-10 w-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: mockup */}
          <div className="relative h-96 hidden lg:block">
            <div className="absolute top-6 end-4 w-64 rotate-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t("landing.mockupMonthlyRecap")}</p>
              <div className="flex items-end gap-1.5 h-16">
                {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#d5e2ea] rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="absolute top-16 start-2 w-72 -rotate-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🧾</span>
                <p className="text-sm font-semibold text-gray-900">{t("landing.mockupReceiptScanned")}</p>
                <span className="ms-auto w-5 h-5 bg-[#d0eeec] text-[#32867c] rounded-full flex items-center justify-center text-xs">✓</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{t("landing.mockupVendor")}</p>
              <p className="text-3xl font-extrabold text-gray-900 mb-4">$84.32</p>
              <span className="inline-block text-xs font-medium bg-[#edf8f7] text-[#26645c] px-2.5 py-1 rounded-full mb-4">
                {t("landing.mockupCategory")}
              </span>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-[#4a7a9a] rounded-full" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{t("landing.mockupBudget")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#3e6378]">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before / After */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("landing.soundFamiliar")}</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            {t("landing.soundFamiliarSubtitle")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">{t("landing.withoutZingg")}</p>
            <ul className="space-y-3 text-sm text-gray-500">
              {withoutList.map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-gray-300">✗</span> {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#d5e2ea] bg-[#eef2f5]/50 p-6">
            <p className="text-xs font-semibold text-[#3e6378] uppercase tracking-wide mb-4">{t("landing.withZingg")}</p>
            <ul className="space-y-3 text-sm text-gray-700">
              {withList.map((item, i) => (
                <li key={i} className="flex gap-2"><span className="text-[#3fa89d]">✓</span> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Flagship features — left-aligned rows */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            {t("landing.boringPart")}
          </h2>
          <div className="space-y-12">
            {heroFeatures.map((f) => (
              <div key={f.title} className="flex items-start gap-6">
                <div className="w-16 h-16 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl">
                  {f.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
                    {f.tag && (
                      <span className="text-[10px] font-bold text-[#3e6378] bg-[#eef2f5] px-2 py-0.5 rounded-full">
                        {f.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Also included */}
          <div className="mt-20 pt-14 border-t border-gray-200">
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wide mb-8">
              {t("landing.alsoIncluded")}
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {moreFeatures.map((f) => (
                <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0d1f28] py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-[#abc5d5] mb-8">
            {t("landing.ctaSubtitle")}
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-[#325163] font-bold px-10 py-4 rounded-xl hover:bg-[#eef2f5] transition-colors text-base shadow-lg"
          >
            {t("landing.ctaButton")}
            <span className="rtl:rotate-180">→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
