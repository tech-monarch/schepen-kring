export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  url?: string;
  userIds?: string[];
  userTypes?: ("admin" | "partner" | "client")[];
  interests?: string[];
}

export const notificationService = {
  // Send push notification via backend
  // MOCK IMPLEMENTATION - Replace with real API when available
  sendPushNotification: async (payload: PushNotificationPayload) => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));



    // Simulate browser notification for demo
    if (notificationService.isPermitted()) {
      notificationService.sendBrowserNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data,
        tag: payload.tag,
      });
    }

    return { success: true, message: "Push notification sent successfully" };
  },

  // Send browser notification directly (fallback)
  sendBrowserNotification: (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      return new Notification(title, {
        icon: "/answerLogobgRemover-removebg-preview.png",
        badge: "/answerLogobgRemover-removebg-preview.png",
        ...options,
      });
    } else {
      return null;
    }
  },

  // Request notification permission
  requestPermission: async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      return await Notification.requestPermission();
    }
    return "denied";
  },

  // Check if notifications are supported and permitted
  isSupported: (): boolean => {
    return "Notification" in window;
  },

  isPermitted: (): boolean => {
    return "Notification" in window && Notification.permission === "granted";
  },

  // Subscribe user to specific notification interests
  // MOCK IMPLEMENTATION - Replace with real API when available
  subscribeToInterests: async (interests: string[]) => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));


    return {
      success: true,
      interests,
      message: "Successfully subscribed to interests",
    };
  },

  // Unsubscribe user from specific notification interests
  // MOCK IMPLEMENTATION - Replace with real API when available
  unsubscribeFromInterests: async (interests: string[]) => {
    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));


    return {
      success: true,
      interests,
      message: "Successfully unsubscribed from interests",
    };
  },
};
