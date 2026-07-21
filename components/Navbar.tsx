"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import LanguageDropdown from "@/components/LanguageDropdown";

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/expenses", label: t("nav.expenses") },
    { href: "/categories", label: t("nav.categories") },
  ];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const userInitial = user?.name
    ? user.name[0].toUpperCase()
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <Image src="/logo-with-name.png" alt="Zingg" width={1129} height={382} className="h-10 w-auto" style={{ width: 'auto' }} priority />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + "/")
                      ? "bg-[#eef2f5] text-[#325163]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <LanguageDropdown />
              </div>
              {/* User avatar dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-9 h-9 bg-[#3e6378] text-white rounded-full flex items-center justify-center font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7a9a] focus:ring-offset-2"
                  aria-label={t("nav.userMenu")}
                >
                  {userInitial}
                </button>

                {dropdownOpen && (
                  <div className="absolute end-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="sm:hidden px-2 py-1 border-b border-gray-100">
                      <LanguageDropdown />
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t("nav.profile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label={t("nav.toggleNav")}
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-full bg-white h-full flex flex-col shadow-xl">
            <div className="px-4 py-6 border-b border-gray-100">
              <p className="font-bold text-[#3e6378] text-lg">Zingg</p>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-[#eef2f5] text-[#325163]"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-3">
              <LanguageDropdown />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {t("nav.logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
