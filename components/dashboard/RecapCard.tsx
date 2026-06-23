"use client";

import { useState } from "react";
import { getMonthlyRecapApi } from "@/lib/services/expenses.service";

interface Props {
  month: string;
  monthLabel: string;
}

export default function RecapCard({ month, monthLabel }: Props) {
  const [recap, setRecap] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(false);
    try {
      const data = await getMonthlyRecapApi(month);
      setRecap(data.recap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">AI Monthly Recap</h2>
          <p className="text-xs text-gray-400 mt-0.5">{monthLabel}</p>
        </div>
        <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">
          AI
        </span>
      </div>

      {recap ? (
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">{recap}</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-3 text-xs text-indigo-600 hover:underline disabled:opacity-50"
          >
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          {error && (
            <p className="text-xs text-red-500">Failed to generate recap. Try again.</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing spending…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Recap
              </>
            )}
          </button>
          <p className="text-xs text-gray-400">Powered by Groq AI</p>
        </div>
      )}
    </div>
  );
}
