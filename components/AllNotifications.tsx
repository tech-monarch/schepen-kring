"use client";

import {
  getNotifications,
  markAsRead,
  Notification,
} from "@/app/[locale]/actions/notificationActions";
import Avatar from "@/components/common/Avatar";
import { tokenUtils } from "@/utils/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Bell, Clock, Shield, Users, Briefcase } from "lucide-react";
import { useParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Link } from "@/i18n/navigation";

interface AllNotificationsProps {
  userType?: "admin" | "partner" | "client";
}

const AllNotifications: React.FC<AllNotificationsProps> = ({
  userType: propUserType,
}) => {
  const { locale } = useParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoader, setNotificationsLoader] = useState(false);
  const { user, userType: hookUserType, isLoading: userLoading } = useUser();

  // Get user type from prop or hook
  const currentUserType = propUserType || hookUserType;

  useEffect(() => {
    const userTypeToUse = propUserType || hookUserType;

    // Only fetch when we actually have a userType (and user is loaded)
    if (!userLoading && userTypeToUse) {
      const fetchNotifications = async () => {
        try {
          setNotificationsLoader(true);
          const data = await getNotifications(1, 10, userTypeToUse);
          setNotifications(data);
        } catch (error: any) {
          toast.error(error.message || "Error fetching notifications");
        } finally {
          setNotificationsLoader(false);
        }
      };

      fetchNotifications();
    }
  }, [userLoading, propUserType, hookUserType]);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      toast.error("Failed to mark as read.");
    }
  };

  // User type specific configurations
  const getUserTypeConfig = () => {
    switch (currentUserType) {
      case "admin":
        return {
          icon: Shield,
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          title: "Admin Notifications",
          subtitle:
            "System alerts, user activities, and administrative updates",
          primaryColor: "red",
        };
      case "partner":
        return {
          icon: Briefcase,
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          title: "Partner Notifications",
          subtitle:
            "Client updates, service alerts, and business notifications",
          primaryColor: "green",
        };
      case "client":
      default:
        return {
          icon: Users,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          title: "Client Notifications",
          subtitle: "Service updates, messages, and account notifications",
          primaryColor: "blue",
        };
    }
  };

  const config = getUserTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="max-w-4xl  mx-auto p-6">
      {/* Header */}
      <div className="mb-8 mt-20">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 ${config.iconBg} rounded-lg`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
        </div>
        <p className="text-gray-600">{config.subtitle}</p>
      </div>

      {/* Notifications Content */}
      <div className="space-y-4">
        {notificationsLoader ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-4">
                <Link
                  href={item.link ? item.link : "#"}
                  onClick={() => handleNotificationClick(item.id)}
                  className="flex items-start gap-4 group"
                >
                  <Avatar
                    imgUrl={item.sender?.avatar}
                    userName={item.sender?.name}
                    sizeClass="size-12"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.sender?.name || "System"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                        {!item.read && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-600 text-xs"
                          >
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{item.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              You'll see your notifications here when you receive them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotifications;
