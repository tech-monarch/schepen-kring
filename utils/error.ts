import type { BaseResponse } from "@/interfaces";

export interface AppError {
  message: string;
  details?: Record<string, string[]>;
  status?: number;
}

export const handleApiError = (error: any): AppError => {
  if (error.response?.data) {
    const data: BaseResponse = error.response.data;
    return {
      message: data.message || "An error occurred",
      details: data.errors,
      status: error.response.status,
    };
  }

  if (!navigator.onLine) {
    return {
      message: "Network error: Please check your internet connection.",
    };
  }

  return {
    message: error.message || "An unexpected error occurred",
  };
};

export const formatErrorMessages = (
  errors: Record<string, string[]>
): string => {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
};
