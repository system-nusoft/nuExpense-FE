"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { updateMeApi, getMeApi } from "@/lib/services/auth.service";
import { createCheckoutSessionApi, createPortalSessionApi } from "@/lib/services/billing.service";
import { CURRENCY_OPTIONS } from "@/lib/currencies";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Card from "@/components/Card";
import LanguageDropdown from "@/components/LanguageDropdown";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [homeCurrency, setHomeCurrency] = useState(
    user?.homeCurrency || "USD"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Coming back from Stripe Checkout — refetch the user so isPremium reflects the new subscription.
  useEffect(() => {
    if (searchParams.get("upgraded") !== "true") return;
    getMeApi()
      .then((freshUser) => updateUser(freshUser))
      .finally(() => router.replace("/settings"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleUpgrade() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const { url } = await createCheckoutSessionApi();
      window.location.href = url;
    } catch {
      setBillingError(t("premium.upgradeError"));
      setBillingLoading(false);
    }
  }

  async function handleManageSubscription() {
    setBillingError(null);
    setBillingLoading(true);
    try {
      const { url } = await createPortalSessionApi();
      window.location.href = url;
    } catch {
      setBillingError(t("premium.portalError"));
      setBillingLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const updated = await updateMeApi({ name, homeCurrency });
      updateUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("settings.errorUpdate");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Profile card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t("settings.profile")}</h2>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t("settings.changesSaved")}
            </div>
          )}

          {/* Email (read-only) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t("settings.emailLabel")}</label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              {user?.email}
            </div>
            <p className="text-xs text-gray-400">{t("settings.emailCannotChange")}</p>
          </div>

          <Input
            label={t("settings.fullNameLabel")}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("settings.fullNamePlaceholder")}
            disabled={loading}
          />

          <div>
            <Select
              label={t("settings.homeCurrencyLabel")}
              name="homeCurrency"
              value={homeCurrency}
              onChange={(e) => setHomeCurrency(e.target.value)}
              options={CURRENCY_OPTIONS}
              disabled={loading}
              className="max-w-xs"
            />
            {homeCurrency !== user?.homeCurrency && (
              <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg max-w-xs">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>
                  {t("settings.currencyChangeWarning", { currency: homeCurrency })}
                </span>
              </div>
            )}
          </div>

          <div className="pt-1">
            <Button type="submit" loading={loading}>
              {t("settings.saveChanges")}
            </Button>
          </div>
        </form>
      </Card>

      {/* Language card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t("settings.language")}</h2>
        <LanguageDropdown />
      </Card>

      {/* Account card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("settings.account")}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{t("settings.plan")}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.isPremium ? t("settings.planPremium") : t("settings.planFree")}
            </p>
          </div>
          <span
            className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              ${user?.isPremium
                ? "bg-[#d5e2ea] text-[#325163]"
                : "bg-gray-100 text-gray-600"
              }
            `}
          >
            {user?.isPremium ? t("settings.premium") : t("settings.freeTier")}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{t("settings.memberSince")} </span>
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString(language, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </p>
        </div>

        {billingError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {billingError}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          {user?.isPremium ? (
            <Button variant="secondary" loading={billingLoading} onClick={handleManageSubscription}>
              {t("premium.manageSubscriptionButton")}
            </Button>
          ) : (
            <Button loading={billingLoading} onClick={handleUpgrade}>
              {t("premium.upgradeButton")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
