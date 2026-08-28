import type { AdminUser } from "@/features/auth/types";

export type AuthUser = AdminUser;

export interface LoginRequest {
  email: string;
  password: string;
}

/** Inner payload returned by the auth endpoints. */
export interface AuthPayload {
  createToken?: string;
  token?: string;
  user?: AuthUser;
}

/** Standard API envelope used by the backend. */
export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export type LoginResponse = ApiEnvelope<AuthPayload>;

export interface ForgetPasswordRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  oneTimeCode: number;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  data: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  resetToken: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
}
