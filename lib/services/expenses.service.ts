import { get, post, patch, del } from "@/lib/api";
import { Expense, ExpenseDraft, MonthlySummary, CategorySummary, VendorInsight, PaginatedResponse } from "@/types";
import axiosInstance from "@/lib/api";

export interface ScanReceiptResponse extends ExpenseDraft {
  receiptPreviewUrl?: string;
}

export interface ExpensesQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateExpensePayload {
  vendor: string;
  amount: string;
  currency: string;
  date: string;
  categoryId?: string;
  receiptImageKey?: string;
  notes?: string;
}

export interface UpdateExpensePayload extends Partial<CreateExpensePayload> {}

export async function scanReceiptApi(
  file: File
): Promise<ScanReceiptResponse> {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await axiosInstance.post<ScanReceiptResponse>(
    "/expenses/scan",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
}

export async function createExpenseApi(
  data: CreateExpensePayload
): Promise<Expense> {
  return post<Expense>("/expenses", data);
}

export async function getExpensesApi(
  params: ExpensesQueryParams = {}
): Promise<PaginatedResponse<Expense>> {
  const queryParams: Record<string, string> = {};
  if (params.page !== undefined)
    queryParams.page = String(params.page);
  if (params.limit !== undefined)
    queryParams.limit = String(params.limit);
  if (params.categoryId) queryParams.categoryId = params.categoryId;
  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;

  return get<PaginatedResponse<Expense>>("/expenses", {
    params: queryParams,
  });
}

export async function updateExpenseApi(
  id: string,
  data: UpdateExpensePayload
): Promise<Expense> {
  return patch<Expense>(`/expenses/${id}`, data);
}

export async function deleteExpenseApi(id: string): Promise<void> {
  return del<void>(`/expenses/${id}`);
}

export async function uploadReceiptApi(
  file: File
): Promise<{ receiptImageKey: string; receiptImageUrl: string }> {
  const formData = new FormData();
  formData.append("receipt", file);
  const response = await axiosInstance.post<{
    receiptImageKey: string;
    receiptImageUrl: string;
  }>("/expenses/upload-receipt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getMonthlySummaryApi(): Promise<MonthlySummary[]> {
  return get<MonthlySummary[]>("/expenses/summary/monthly");
}

export async function getCategorySummaryApi(
  month: string
): Promise<CategorySummary[]> {
  return get<CategorySummary[]>("/expenses/summary/categories", {
    params: { month },
  });
}

export async function getMonthlyRecapApi(month: string): Promise<{ recap: string }> {
  return get<{ recap: string }>("/expenses/recap", { params: { month } });
}

export async function getVendorInsightsApi(): Promise<VendorInsight[]> {
  return get<VendorInsight[]>("/expenses/vendors/insights");
}

export async function downloadCsvApi(
  startDate?: string,
  endDate?: string
): Promise<void> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get("/expenses/export/csv", {
    params,
    responseType: "blob",
  });

  const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
