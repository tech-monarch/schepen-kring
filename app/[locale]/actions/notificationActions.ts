"use client";

import { API_CONFIG, getApiUrl } from "@/lib/api-config";
import { tokenUtils } from "@/utils/auth";

// Define a standard Notification type
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  sender?: {
    name: string;
    avatar: string;
  };
}

export interface NotificationCount {
  total: number;
  unread: number;
}

/**
 * Fetches notifications for the current user from the backend API (Client-side)
 */
export const getNotifications = async (
  page: number = 1,
  pageSize: number = 10,
  userType?: "admin" | "partner" | "client",
): Promise<Notification[]> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      console.warn("⚠️ [NOTIFICATIONS] No authentication token available");
      return [];
    }

    const url = getApiUrl(
      `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST}?per_page=${pageSize}&page=${page}`,
    );

    console.log("🔔 [NOTIFICATIONS] Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("❌ [NOTIFICATIONS] Failed to fetch:", response.status);
      if (response.status === 401) {
        console.error(
          "❌ [NOTIFICATIONS] Authentication failed - token may be expired",
        );
      }
      return [];
    }

    const result = await response.json();
    console.log("✅ [NOTIFICATIONS] Response:", result);

    if (result.success && result.data) {
      // Handle paginated response - notifications are in result.data.data
      const notificationsData = Array.isArray(result.data)
        ? result.data
        : result.data.data;

      if (!notificationsData || !Array.isArray(notificationsData)) {
        console.warn(
          "⚠️ [NOTIFICATIONS] No notifications array found in response",
        );
        return [];
      }

      // Transform backend response to match frontend Notification interface
      const notifications: Notification[] = notificationsData.map(
        (notification: any) => ({
          id: notification.id,
          message:
            notification.data?.message ||
            notification.data?.body ||
            "New notification",
          read: !!notification.read_at,
          createdAt: notification.created_at,
          link: notification.data?.link || notification.data?.url,
          sender: notification.data?.sender
            ? {
                name: notification.data.sender.name || "System",
                avatar:
                  notification.data.sender.avatar || "/schepenkring-logo.png",
              }
            : {
                name: "System",
                avatar: "/schepenkring-logo.png",
              },
        }),
      );

      console.log(
        "📋 [NOTIFICATIONS] Transformed:",
        notifications.length,
        "notifications",
      );
      return notifications;
    }

    return [];
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error:", error);
    return [];
  }
};

/**
 * Marks a specific notification as read
 */
export const markAsRead = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return { success: false };
    }

    const url = getApiUrl(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId),
    );

    console.log("🔔 [NOTIFICATIONS] Marking as read:", notificationId);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ [NOTIFICATIONS] Failed to mark as read:",
        response.status,
      );
      return { success: false };
    }

    const result = await response.json();
    console.log("✅ [NOTIFICATIONS] Marked as read:", result);

    return { success: result.success || true };
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error marking as read:", error);
    return { success: false };
  }
};

/**
 * Marks all unread notifications for the user as read
 */
export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return { success: false };
    }

    const url = getApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

    console.log("🔔 [NOTIFICATIONS] Marking all as read");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "❌ [NOTIFICATIONS] Failed to mark all as read:",
        response.status,
      );
      return { success: false };
    }

    const result = await response.json();
    console.log("✅ [NOTIFICATIONS] Marked all as read:", result);

    return { success: result.success || true };
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error marking all as read:", error);
    return { success: false };
  }
};

/**
 * Get notification counts (total and unread)
 */
export const getNotificationCount = async (): Promise<NotificationCount> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return { total: 0, unread: 0 };
    }

    const url = getApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS.COUNT);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { total: 0, unread: 0 };
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        total: result.data.total || 0,
        unread: result.data.unread || 0,
      };
    }

    return { total: 0, unread: 0 };
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error fetching count:", error);
    return { total: 0, unread: 0 };
  }
};

/**
 * Get only unread notifications
 */
export const getUnreadNotifications = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<Notification[]> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return [];
    }

    const url = getApiUrl(
      `${API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD}?per_page=${pageSize}&page=${page}`,
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();

    if (result.success && result.data) {
      // Handle paginated response - notifications are in result.data.data
      const notificationsData = Array.isArray(result.data)
        ? result.data
        : result.data.data;

      if (!notificationsData || !Array.isArray(notificationsData)) {
        return [];
      }

      const notifications: Notification[] = notificationsData.map(
        (notification: any) => ({
          id: notification.id,
          message:
            notification.data?.message ||
            notification.data?.body ||
            "New notification",
          read: !!notification.read_at,
          createdAt: notification.created_at,
          link: notification.data?.link || notification.data?.url,
          sender: notification.data?.sender
            ? {
                name: notification.data.sender.name || "System",
                avatar:
                  notification.data.sender.avatar || "/schepenkring-logo.png",
              }
            : {
                name: "System",
                avatar: "/schepenkring-logo.png",
              },
        }),
      );

      return notifications;
    }

    return [];
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error fetching unread:", error);
    return [];
  }
};

/**
 * Delete a specific notification
 */
export const deleteNotification = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return { success: false };
    }

    const url = getApiUrl(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(notificationId),
    );

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const result = await response.json();
    return { success: result.success || true };
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error deleting:", error);
    return { success: false };
  }
};

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = async (): Promise<{
  success: boolean;
}> => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      return { success: false };
    }

    const url = getApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE_ALL_READ);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const result = await response.json();
    return { success: result.success || true };
  } catch (error) {
    console.error("❌ [NOTIFICATIONS] Error deleting all read:", error);
    return { success: false };
  }
};
