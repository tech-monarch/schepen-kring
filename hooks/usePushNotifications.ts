// hooks/usePushNotifications.ts
"use client";

import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

// Pusher Beams interface
interface PusherBeamsClient {
  start: () => Promise<void>;
  addDeviceInterest: (interest: string) => Promise<void>;
  removeDeviceInterest: (interest: string) => Promise<void>;
  setUserId: (userId: string, beamsAuthProvider: any) => Promise<void>;
}

// Dynamic import for Pusher Beams to avoid SSR issues
const loadPusherBeams = async () => {
  try {
    const PushNotifications = await import("@pusher/push-notifications-web");
    return PushNotifications.Client;
  } catch (error) {
    return null;
  }
};

export function usePushNotifications(userId?: string) {
  const beamsClient = useRef<PusherBeamsClient | null>(null);
  const isInitialized = useRef(false);
  const permissionRequested = useRef(false);

  // Function to initialize or reinitialize push notifications
  const initializePushNotifications = async () => {
    if (!userId || isInitialized.current) return;
    if (typeof window === "undefined") return;

    const initializePusherBeams = async () => {
      try {
        // Check if user has enabled push notifications
        const userDataStr = localStorage.getItem("user_data");
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            if (userData.push_notifications === false) {
              console.log("User has disabled push notifications");
              return;
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // Register service worker for push notifications
        if ("serviceWorker" in navigator) {
          try {
            await navigator.serviceWorker.register("/sw.js");
          } catch (error) {
            // Service worker registration failed, continue without it
          }
        }

        // Check notification permission - only initialize if granted
        if ("Notification" in window && Notification.permission !== "granted") {
          console.log(
            "Notification permission not granted, skipping Pusher initialization",
          );

          // If permission was denied, don't ask again
          if (Notification.permission === "denied") {
            console.log("Notification permission permanently denied");
            return;
          }

          // If permission was not requested yet and user hasn't been asked
          if (
            Notification.permission === "default" &&
            !permissionRequested.current
          ) {
            console.log("Will not auto-request notification permission");
            return;
          }
        }

        // Load Pusher Beams dynamically
        const PusherBeamsClient = await loadPusherBeams();

        if (!PusherBeamsClient) {
          return;
        }

        // Initialize Pusher Beams client
        beamsClient.current = new PusherBeamsClient({
          instanceId: "1f5da00c-61ac-4bef-8067-08f5ca994e0c",
        });

        const client = beamsClient.current;
        if (client) {
          // Start Beams registration
          await client.start();

          // Add device interests
          await client.addDeviceInterest("global"); // Global notifications
          await client.addDeviceInterest(`user-${userId}`); // User-specific notifications

          // Add user type specific interests
          const user = JSON.parse(localStorage.getItem("user_data") || "{}");
          const userType = user?.role?.name || "client";
          await client.addDeviceInterest(`${userType}-notifications`);

          toast.success("Push notifications enabled");

          isInitialized.current = true;
        }
      } catch (error) {
        toast.error("Failed to enable push notifications");
      }
    };

    initializePusherBeams();
  };

  // Listen for user data updates to reinitialize if needed
  useEffect(() => {
    if (!userId) return;

    const handleUserDataUpdate = () => {
      // Reset initialization flag to allow reinitialization
      isInitialized.current = false;
      initializePushNotifications();
    };

    window.addEventListener("userDataUpdated", handleUserDataUpdate);

    // Initial initialization
    initializePushNotifications();

    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate);

      // Cleanup on unmount
      if (beamsClient.current && isInitialized.current) {
        try {
          beamsClient.current.removeDeviceInterest(`user-${userId}`);
          const user = JSON.parse(localStorage.getItem("user_data") || "{}");
          const userType = user?.role?.name || "client";
          beamsClient.current.removeDeviceInterest(`${userType}-notifications`);
        } catch (error) {
          // Error cleaning up, continue silently
        }
      }
    };
  }, [userId]);

  // Function to send a test notification
  const sendTestNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Schepenkring.nlNotification", {
        body: "This is a test notification from Answer24",
        icon: "/favicon.ico",
      });
    }
  };

  return { sendTestNotification };
}
