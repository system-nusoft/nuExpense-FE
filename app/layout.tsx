import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const RTL_LANGUAGES = ["ar"];
const SET_INITIAL_DIRECTION_SCRIPT = `
(function () {
  try {
    var lang = window.localStorage.getItem("zingg_language") || "en";
    document.documentElement.lang = lang;
    document.documentElement.dir = ${JSON.stringify(RTL_LANGUAGES)}.indexOf(lang) !== -1 ? "rtl" : "ltr";
  } catch (e) {}
})();
`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const TITLE = "Zingg — AI-Powered Expense Tracking";
const DESCRIPTION =
  "Scan receipts instantly with AI. Track expenses, manage categories, and understand your spending.";
const SITE_URL = "https://zingg.nusoft.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Zingg",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SET_INITIAL_DIRECTION_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased font-sans">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
