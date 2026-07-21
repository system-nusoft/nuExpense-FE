"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMonthlySummaryApi,
  getCategorySummaryApi,
  getVendorInsightsApi,
  downloadCsvApi,
} from "@/lib/services/expenses.service";
import { MonthlySummary, CategorySummary, VendorInsight } from "@/types";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecapCard from "@/components/dashboard/RecapCard";
import VendorInsights from "@/components/dashboard/VendorInsights";

type Tab = "overview" | "insights" | "export";

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function monthLabel(yyyymm: string, locale: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  return new Date(year, month - 1).toLocaleString(locale, {
    month: "long",
    year: "numeric",
  });
}

function prevMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

function nextMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-").map(Number);
  if (month === 12) return `${year + 1}-01`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function ChartSkeleton() {
  return <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />;
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      {loading ? (
        <div className="h-7 bg-gray-200 rounded animate-pulse w-24" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: t("dashboard.tabs.overview") },
    { id: "insights", label: t("dashboard.tabs.insights") },
    { id: "export", label: t("dashboard.tabs.export") },
  ];
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [vendorInsights, setVendorInsights] = useState<VendorInsight[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [csvLoading, setCsvLoading] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue());
  const [csvStart, setCsvStart] = useState(currentMonthValue());
  const [csvEnd, setCsvEnd] = useState(currentMonthValue());

  const currencyCode = user?.homeCurrency || "USD";

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await getMonthlySummaryApi();
        setMonthlySummary(data);
      } catch {
        // fail silently
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, []);

  useEffect(() => {
    async function loadVendors() {
      try {
        const data = await getVendorInsightsApi();
        setVendorInsights(data);
      } catch {
        // fail silently
      } finally {
        setVendorLoading(false);
      }
    }
    loadVendors();
  }, []);

  const loadCategorySummary = useCallback(async (month: string) => {
    setCategoryLoading(true);
    try {
      const data = await getCategorySummaryApi(month);
      setCategorySummary(data);
    } catch {
      // fail silently
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorySummary(selectedMonth);
  }, [selectedMonth, loadCategorySummary]);

  const currentMonth = currentMonthValue();
  const selectedSummary = monthlySummary.find((m) => m.month === selectedMonth);
  const totalForMonth = selectedSummary?.total ?? 0;
  const countForMonth = selectedSummary?.count ?? 0;
  const isCurrentMonth = selectedMonth === currentMonth;
  const oldestAvailable = monthlySummary[0]?.month;
  const atOldest = oldestAvailable ? selectedMonth <= oldestAvailable : false;

  function lastDayOfMonth(yyyymm: string): string {
    const [year, month] = yyyymm.split("-").map(Number);
    const last = new Date(year, month, 0).getDate();
    return `${yyyymm}-${String(last).padStart(2, "0")}`;
  }

  async function handleExportCsv() {
    setCsvLoading(true);
    try {
      await downloadCsvApi(`${csvStart}-01`, lastDayOfMonth(csvEnd));
    } catch {
      // fail silently
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t(`dashboard.greeting.${getGreetingKey()}`)}, {user?.name || user?.email?.split("@")[0] || t("dashboard.greetingFallbackName")} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("dashboard.subtitle")}</p>
        </div>
      </div>

      {/* Scan CTA */}
      <Link href="/scan">
        <div className="bg-gradient-to-br from-[#3e6378] to-[#325163] rounded-2xl p-5 text-white cursor-pointer hover:from-[#325163] hover:to-[#263e4e] transition-all shadow-lg active:scale-[0.99]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#abc5d5] text-xs font-medium mb-1">{t("dashboard.scanCta.eyebrow")}</p>
              <h2 className="text-xl font-bold">{t("dashboard.scanCta.title")}</h2>
              <p className="text-[#abc5d5] text-xs mt-1">{t("dashboard.scanCta.subtitle")}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
      <div className="text-center -mt-2">
        <Link href="/expenses?add=1" className="text-sm text-gray-400 hover:text-gray-600">
          {t("dashboard.orAddManually")} <span className="underline">{t("dashboard.addManually")}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4">
          {/* Month selector */}
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
            <button
              onClick={() => setSelectedMonth(prevMonth(selectedMonth))}
              disabled={atOldest}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t("dashboard.previousMonth")}
            >
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{monthLabel(selectedMonth, language)}</p>
              {!isCurrentMonth && (
                <button
                  onClick={() => setSelectedMonth(currentMonth)}
                  className="text-xs text-[#3e6378] hover:underline mt-0.5"
                >
                  {t("dashboard.backToCurrent")}
                </button>
              )}
            </div>
            <button
              onClick={() => setSelectedMonth(nextMonth(selectedMonth))}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label={t("dashboard.nextMonth")}
            >
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label={t("dashboard.stats.totalSpent")} value={formatCurrency(totalForMonth)} loading={summaryLoading} />
            <StatCard label={t("dashboard.stats.expenses")} value={String(countForMonth)} loading={summaryLoading} />
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("dashboard.monthlyTrend")}</h2>
            {summaryLoading ? (
              <ChartSkeleton />
            ) : (
              <MonthlyChart
                data={monthlySummary}
                currency={currencyCode}
                selectedMonth={selectedMonth}
                onBarClick={(month) => setSelectedMonth(month)}
              />
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              {t("dashboard.categoryBreakdown", { month: monthLabel(selectedMonth, language) })}
            </h2>
            {categoryLoading ? (
              <ChartSkeleton />
            ) : (
              <CategoryChart data={categorySummary} currency={currencyCode} />
            )}
          </div>
        </div>
      )}

      {/* Tab: Insights */}
      {activeTab === "insights" && (
        <div className="flex flex-col gap-4">
          <RecapCard month={selectedMonth} monthLabel={monthLabel(selectedMonth, language)} />
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t("dashboard.topVendors")}</h2>
            <VendorInsights
              data={vendorInsights}
              currency={currencyCode}
              loading={vendorLoading}
            />
          </div>
        </div>
      )}

      {/* Tab: Export */}
      {activeTab === "export" && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">{t("dashboard.export.title")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("dashboard.export.subtitle")}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">{t("dashboard.export.from")}</label>
              <input
                type="month"
                value={csvStart}
                onChange={(e) => setCsvStart(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a]"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">{t("dashboard.export.to")}</label>
              <input
                type="month"
                value={csvEnd}
                onChange={(e) => setCsvEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a]"
              />
            </div>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={csvLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {csvLoading ? t("dashboard.export.preparing") : t("dashboard.export.download")}
          </button>
        </div>
      )}
    </div>
  );
}
