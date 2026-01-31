"use server";

import { revalidatePath } from "next/cache";
import { API_CONFIG, getApiUrl, getApiHeaders } from "@/lib/api-config";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Avatar = {
  id: string;
  name: string;
  role: string;
  description: string;
  functions: string[];
  image: string;
  required_plan: "small" | "medium" | "big";
  created_at: string;
  updated_at: string;
};

export async function getAvatars(): Promise<Avatar[]> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.LIST), {
      method: "GET",
      headers: getApiHeaders(),
      cache: "no-store", // Ensure we always get fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch avatars: ${response.statusText}`);
    }

    const result: ApiResponse<Avatar[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch avatars");
    }

    return result.data;
  } catch (error) {
    console.error("Error fetching avatars:", error);
    throw error;
  }
}

export async function getAvatarById(id: string): Promise<Avatar | null> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.BY_ID(id)), {
      method: "GET",
      headers: getApiHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch avatar: ${response.statusText}`);
    }

    const result: ApiResponse<Avatar> = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch avatar");
    }

    return result.data;
  } catch (error) {
    console.error(`Error fetching avatar with id ${id}:`, error);
    throw error;
  }
}

export async function createAvatar(
  token: string,
  avatarData: FormData | Omit<Avatar, "id" | "created_at" | "updated_at">
): Promise<Avatar> {
  try {
    const isFormData = avatarData instanceof FormData;

    const headers: HeadersInit = {
      ...getApiHeaders(token),
    };

    if (!isFormData) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.ADMIN_LIST), {
      method: "POST",
      headers,
      body: isFormData ? avatarData : JSON.stringify(avatarData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle validation errors (422)
      if (response.status === 422 && result.errors) {
        const errorMessages = Object.entries(result.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        throw new Error(`Validation failed:\n${errorMessages}`);
      }

      throw new Error(
        result.message || `Failed to create avatar: ${response.statusText}`
      );
    }

    if (!result.success) {
      throw new Error(result.message || "Failed to create avatar");
    }

    revalidatePath("/client/avatar");
    return result.data;
  } catch (error) {
    console.error("Error creating avatar:", error);
    throw error;
  }
}

export async function updateAvatar(
  id: string,
  token: string,
  avatarData:
    | FormData
    | Partial<Omit<Avatar, "id" | "created_at" | "updated_at">>
): Promise<Avatar> {
  try {
    const isFormData = avatarData instanceof FormData;

    const headers: HeadersInit = {
      ...getApiHeaders(token),
    };

    if (!isFormData) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.ADMIN_BY_ID(id)), {
      method: "PATCH",
      headers,
      body: isFormData ? avatarData : JSON.stringify(avatarData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle validation errors (422)
      if (response.status === 422 && result.errors) {
        const errorMessages = Object.entries(result.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        throw new Error(`Validation failed:\n${errorMessages}`);
      }

      throw new Error(
        result.message || `Failed to update avatar: ${response.statusText}`
      );
    }

    if (!result.success) {
      throw new Error(result.message || "Failed to update avatar");
    }

    revalidatePath("/client/avatar");
    return result.data;
  } catch (error) {
    console.error(`Error updating avatar with id ${id}:`, error);
    throw error;
  }
}

export async function deleteAvatar(
  id: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AVATAR.ADMIN_BY_ID(id)), {
      method: "DELETE",
      headers: getApiHeaders(token),
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete avatar: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete avatar");
    }

    revalidatePath("/client/avatar");
    return true;
  } catch (error) {
    console.error(`Error deleting avatar with id ${id}:`, error);
    throw error;
  }
}
