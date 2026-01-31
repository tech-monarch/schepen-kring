'use client';

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { tokenUtils } from "@/utils/auth";
import { getApiUrl, getApiHeaders } from "@/lib/api-config";

// API call to update notification settings
const updateNotificationSettings = async (data: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  newFeatures?: boolean;
  weeklyReports?: boolean;
  specialOffers?: boolean;
}) => {
  try {
    const token = tokenUtils.getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      getApiUrl("/profile"),
      {
        method: "PUT",
        headers: getApiHeaders(token),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update notification settings");
    }

    const responseData = await response.json();
    
    // Update local user data
    const currentUser = tokenUtils.getUser();
    const updatedUser = {
      ...currentUser,
      ...data,
    };
    tokenUtils.setUser(updatedUser);

    return { success: true, message: "Notification settings updated successfully!" };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update notification settings",
    };
  }
};

export function Notifications() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [newFeatures, setNewFeatures] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    setIsClient(true);
    const userData = tokenUtils.getUser();
    if (userData) {
      setEmailNotifications(userData.email_notifications ?? true);
      setPushNotifications(userData.push_notifications ?? false);
      setNewFeatures(userData.new_features ?? true);
      setWeeklyReports(userData.weekly_reports ?? true);
      setSpecialOffers(userData.special_offers ?? false);
    }
  }, []);

  // Handle push notification permission request
  const requestPushNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notification permission was denied. Please enable it in your browser settings.');
      return false;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast.success('Push notifications enabled!');
      return true;
    } else {
      toast.error('Push notification permission denied');
      return false;
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // User is enabling push notifications
      const hasPermission = await requestPushNotificationPermission();
      if (!hasPermission) {
        // Permission denied, don't enable
        return;
      }
    }
    
    // Update state
    setPushNotifications(enabled);
    
    // Save immediately
    await updateNotificationSettings({ pushNotifications: enabled });
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await updateNotificationSettings({
        emailNotifications,
        pushNotifications,
        newFeatures,
        weeklyReports,
        specialOffers,
      });
      
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <form onSubmit={handleNotificationsSubmit}>
      <div className="p-2">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
        <div className="space-y-8">
          {/* Email Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Receive updates and news directly in your inbox.</p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Enable Email Notifications</p>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Get real-time alerts on your devices.</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enable Push Notifications</p>
                {pushNotifications && (
                  <p className="text-xs text-green-600 mt-1">
                    {Notification.permission === 'granted' ? '✓ Permissions granted' : '⚠ Permission required'}
                  </p>
                )}
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={handlePushNotificationToggle}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
            <p className="mt-1 text-sm text-gray-500">Choose which notifications you want to receive.</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">New features and updates</p>
                <Switch checked={newFeatures} onCheckedChange={setNewFeatures} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Weekly reports</p>
                <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Special offers</p>
                <Switch checked={specialOffers} onCheckedChange={setSpecialOffers} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </div>
    </form>
  );
}