import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores";
import { authService } from "@/services";
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

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { clearAuth, setAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data: LoginResponse) => {
      toast.success(data.message);
      setAuth(data.data.user, data.data.token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterRequest) =>
      authService.register(credentials),
    onSuccess: (data: RegisterResponse) => {
      toast.success(data.message || "Registration successful! Please sign in.");
      // Don't automatically log in - user should sign in manually
      // setAuth(data.data.user, data.data.token);
      // queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (credentials: ForgotPasswordRequest) =>
      authService.forgotPassword(credentials),
    onSuccess: (data: ForgotPasswordResponse) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const verifyResetTokenMutation = useMutation({
    mutationFn: (credentials: VerifyResetTokenRequest) =>
      authService.verifyResetToken(credentials),
    onSuccess: (data: VerifyResetTokenResponse) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (credentials: ResetPasswordRequest) =>
      authService.resetPassword(credentials),
    onSuccess: (data: ResetPasswordResponse) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const logout = () => {
    clearAuth();
    queryClient.invalidateQueries({ queryKey: ["user"] });
    toast.success("Logged out");
  };

  return {
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isLoginError: loginMutation.isError,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    isRegisterError: registerMutation.isError,
    registerError: registerMutation.error,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isForgotPasswordError: forgotPasswordMutation.isError,
    forgotPasswordError: forgotPasswordMutation.error,

    verifyResetToken: verifyResetTokenMutation.mutateAsync,
    isVerifyResetTokenLoading: verifyResetTokenMutation.isPending,
    isVerifyResetTokenError: verifyResetTokenMutation.isError,
    verifyResetTokenError: verifyResetTokenMutation.error,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isResetPasswordError: resetPasswordMutation.isError,
    resetPasswordError: resetPasswordMutation.error,

    logout,
  };
};
