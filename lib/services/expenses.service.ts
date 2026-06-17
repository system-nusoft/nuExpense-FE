import { get, post, patch, del } from "@/lib/api";
import { Expense, ExpenseDraft, PaginatedResponse } from "@/types";
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
