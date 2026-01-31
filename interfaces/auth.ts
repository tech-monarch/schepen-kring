import type { BaseResponse } from "./base";
import type { User } from "./users";

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  userType: "client" | "partner" | "employee";
  referral_token?: string | null;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterResponseDate {
  user: User;
  role: string;
  token: string;
}

export interface LoginResponseDate {
  user: User;
  role: string;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetTokenRequest {
  email: string;
  token: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export type RegisterResponse = BaseResponse<RegisterResponseDate>;
export type LoginResponse = BaseResponse<LoginResponseDate>;
export type ForgotPasswordResponse = BaseResponse;
export type VerifyResetTokenResponse = BaseResponse;
export type ResetPasswordResponse = BaseResponse;
