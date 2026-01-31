import { api, handleApiError } from "@/utils";
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  VerifyResetTokenRequest,
  ResetPasswordRequest,
  RegisterResponse,
  LoginResponse,
  ForgotPasswordResponse,
  VerifyResetTokenResponse,
  ResetPasswordResponse,
} from "@/interfaces";

export const authService = {
  /**
   * Register a new user
   * @param userData User registration data
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post("/register", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Login user
   * @param credentials User login credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post("/login", credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Initiate password reset request
   * @param email User's email address
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      const response = await api.post("/forgot-password", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Verify password reset token
   * @param tokenData Token verification data
   */
  async verifyResetToken(
    data: VerifyResetTokenRequest
  ): Promise<VerifyResetTokenResponse> {
    try {
      const response = await api.post("/verify-reset-token", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Reset user's password
   * @param passwordData Password reset data
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post("/reset-password", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
