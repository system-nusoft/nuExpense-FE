import { get, post, patch } from "@/lib/api";
import { User } from "@/types";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupResponse {
  message: string;
  email: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export async function signupApi(
  email: string,
  password: string,
  name: string
): Promise<SignupResponse> {
  return post<SignupResponse>("/auth/signup", { email, password, name });
}

export async function verifyEmailApi(
  email: string,
  code: string
): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/verify-email", { email, code });
}

export async function resendOtpApi(email: string): Promise<{ message: string }> {
  return post<{ message: string }>("/auth/resend-otp", { email });
}

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/login", { email, password });
}

export async function logoutApi(): Promise<void> {
  return post<void>("/auth/logout");
}

export async function getMeApi(): Promise<User> {
  return get<User>("/auth/me");
}

export async function updateMeApi(data: Partial<User>): Promise<User> {
  return patch<User>("/users/me", data);
}
