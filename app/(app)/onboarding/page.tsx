"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateMeApi } from "@/lib/services/auth.service";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Category } from "@/types";
import { CURRENCY_OPTIONS } from "@/lib/currencies";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [currency, setCurrency] = useState(user?.homeCurrency || "USD");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCurrencyNext(e: React.FormEvent) {
    e.preventDefault();
    if (!currency) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await updateMeApi({ homeCurrency: currency });
      updateUser(updated);

      // Load categories for step 2
      setCatsLoading(true);
      const cats = await getCategoriesApi();
      setCategories(cats);
      setCatsLoading(false);

      setStep(2);
    } catch {
      setError("Failed to save currency. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleFinish() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= s
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`flex-1 h-1 w-12 rounded ${step > s ? "bg-indigo-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                What&apos;s your home currency?
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                We&apos;ll use this as the default for your expenses
              </p>
            </div>

            <form onSubmit={handleCurrencyNext} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCY_OPTIONS}
                required
                disabled={saving}
              />

              <Button type="submit" loading={saving} className="w-full mt-2">
                Continue
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">
                Your default categories
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                These were set up for you automatically. You can customize them later.
              </p>
            </div>

            {catsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" className="text-indigo-600" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      {cat.icon || cat.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {cat.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleFinish} className="w-full">
              Looks good, go to Dashboard!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
