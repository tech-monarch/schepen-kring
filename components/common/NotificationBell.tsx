"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  Notification,
} from "@/app/[locale]/actions/notificationActions";
import Avatar from "@/components/common/Avatar";
import { toast } from "react-hot-toast";
import { tokenUtils } from "@/utils/auth";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Link } from "@/i18n/navigation";

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userType, isLoading: userLoading } = useUser();

  // Get notifications path based on user type - make it absolute with leading slash
  const notificationsPath = `/${userType}/notifications`;

  // Memoize the fetch function to prevent infinite loops
  const fetchNotifications = useCallback(async () => {
    if (!user || !userType) return; // Early return if no user data

    try {
      setIsLoading(true);
      const data = await getNotifications(1, 5, userType); // Get first 5 notifications
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (error: any) {
      // Error fetching notifications, continue silently
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, userType]); // Only depend on user and userType

  useEffect(() => {
    // Only fetch notifications when user data is loaded and available
    if (!userLoading && user && userType) {
      fetchNotifications();

      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => clearInterval(interval);
    }
  }, [userLoading, user, userType]); // Remove fetchNotifications from deps to break the cycle

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <Link
              href={notificationsPath}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-hide scroll-smooth">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link ? notification.link : notificationsPath}
                className="block p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    imgUrl={notification.sender?.avatar}
                    userName={notification.sender?.name}
                    sizeClass="size-8"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.sender?.name || "System"}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Link
              href={notificationsPath}
              className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
