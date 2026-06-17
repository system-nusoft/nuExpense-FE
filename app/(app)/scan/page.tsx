"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { scanReceiptApi } from "@/lib/services/expenses.service";
import { getCategoriesApi } from "@/lib/services/categories.service";
import { Category, ExpenseDraft, Expense } from "@/types";
import FileDropzone from "@/components/FileDropzone";
import Button from "@/components/Button";
import ExpenseReviewForm from "@/components/expenses/ExpenseReviewForm";
import Spinner from "@/components/Spinner";

type Step = "upload" | "analyzing" | "review";

export default function ScanPage() {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExpenseDraft | null>(null);
  const [receiptImageKey, setReceiptImageKey] = useState<string | undefined>();
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  function handleCameraInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  async function handleAnalyze() {
    if (!file) return;
    setError(null);
    setStep("analyzing");
    setAnalyzing(true);

    try {
      const [scanResult, cats] = await Promise.all([
        scanReceiptApi(file),
        getCategoriesApi(),
      ]);

      setDraft({
        vendor: scanResult.vendor,
        amount: scanResult.amount,
        currency: scanResult.currency,
        date: scanResult.date,
        suggestedCategoryId: scanResult.suggestedCategoryId,
        receiptImageKey: scanResult.receiptImageKey,
        confidence: scanResult.confidence,
      });
      setReceiptImageKey(scanResult.receiptImageKey);
      setReceiptPreviewUrl(scanResult.receiptPreviewUrl || previewUrl || undefined);
      setCategories(cats);
      setStep("review");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to analyze receipt. Please try again.";
      setError(message);
      setStep("upload");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSaved(expense: Expense) {
    void expense;
    router.push("/expenses?success=1");
  }

  function handleCancel() {
    setStep("upload");
    setDraft(null);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  if (step === "analyzing") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            AI is reading your receipt...
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Extracting vendor, amount, and date
          </p>
        </div>
      </div>
    );
  }

  if (step === "review" && draft) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Expense</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI has pre-filled the details — review and save
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <ExpenseReviewForm
            draft={draft}
            categories={categories}
            receiptImageKey={receiptImageKey}
            receiptPreviewUrl={receiptPreviewUrl}
            onSave={handleSaved}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan Receipt</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload or capture a receipt — AI will extract the details
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <FileDropzone
          onFile={handleFile}
          accept="image/*"
          maxSizeMB={10}
          preview={true}
        />

        {/* Camera button for mobile */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <label className="cursor-pointer">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraInput}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm text-gray-600 font-medium">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use Camera
          </div>
        </label>

        {file && (
          <Button
            onClick={handleAnalyze}
            loading={analyzing}
            size="lg"
            className="w-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Analyze Receipt
          </Button>
        )}
      </div>
    </div>
  );
}
