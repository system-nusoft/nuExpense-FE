"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Props {
  titleKey: string;
  bodyKey: string;
}

export default function PremiumUpsellCard({ titleKey, bodyKey }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[#eef2f5] flex items-center justify-center">
        <svg className="w-6 h-6 text-[#3e6378]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{t(titleKey)}</h3>
        <p className="text-sm text-gray-500 mt-1">{t(bodyKey)}</p>
      </div>
      <Link
        href="/settings"
        className="mt-1 inline-flex items-center gap-2 bg-[#3e6378] hover:bg-[#325163] text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors"
      >
        {t("premium.upgradeCta")}
      </Link>
    </div>
  );
}
