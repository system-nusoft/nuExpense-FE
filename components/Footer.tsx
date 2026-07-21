"use client";

import Link from "next/link";
import Image from "next/image";
import { Trans, useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
        <Image
          src="/logo-with-name.png"
          alt="Zingg"
          width={1129}
          height={90}
          className="h-8 w-auto"
          style={{ width: "auto" }}
        />
        <span>
          <Trans
            i18nKey="landing.footerRights"
            values={{ year: new Date().getFullYear() }}
            components={[
              <a
                key="nusoft-link"
                href="https://nusoft.co"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 transition-colors"
              />,
            ]}
          />
        </span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">
            {t("landing.footerPrivacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
