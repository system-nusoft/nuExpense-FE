import { post } from "@/lib/api";

export async function createCheckoutSessionApi(): Promise<{ url: string }> {
  return post<{ url: string }>("/billing/checkout");
}

export async function createPortalSessionApi(): Promise<{ url: string }> {
  return post<{ url: string }>("/billing/portal");
}
