import { get, post, patch, del } from "@/lib/api";
import { Category } from "@/types";

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> {}

export interface ReorderCategoryPayload {
  orderedIds: string[];
}

export async function getCategoriesApi(): Promise<Category[]> {
  return get<Category[]>("/categories");
}

export async function createCategoryApi(
  data: CreateCategoryPayload
): Promise<Category> {
  return post<Category>("/categories", data);
}

export async function updateCategoryApi(
  id: string,
  data: UpdateCategoryPayload
): Promise<Category> {
  return patch<Category>(`/categories/${id}`, data);
}

export async function deleteCategoryApi(id: string): Promise<void> {
  return del<void>(`/categories/${id}`);
}

export async function reorderCategoriesApi(
  orderedIds: string[]
): Promise<void> {
  return patch<void>("/categories/reorder", { orderedIds });
}
