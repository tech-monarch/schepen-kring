"use client";

import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useHideSomethingOnRoute } from "@/lib/useHideSomethinOnRoute";
import { usePathname } from "@/i18n/navigation";
import ChatWidget from "@/components/common/ChatWidget";
import PWALoader from "@/components/PWALoader";
import TranslationPreloader from "@/components/TranslationPreloader";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastContainer, toast } from "react-toastify"; // Added toast
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { tokenUtils } from "@/utils/auth";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { NotificationBanner } from "@/components/common/NotificationBanner";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";
import { Button } from "@/components/ui/button"; // Added Button
import { ShieldAlert, LogOut } from "lucide-react"; // Added Icons
import { cn } from "@/lib/utils"; // Added cn

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboardPage =
    pathname.startsWith("/dashboard") || pathname.startsWith("/webshop");
  const isUserTypePage =
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/partner") && !pathname.startsWith("/signup ")) ||
    pathname.startsWith("/client");
  const isDashboardChatPage = pathname === "/dashboard/chat";

  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);

  const { settings: widgetSettings, loading: widgetLoading } =
    useWidgetSettings();

  useEffect(() => {
    const userData = tokenUtils.getUser();
    const token = tokenUtils.getToken();
    const adminToken = localStorage.getItem("admin_token");

    setUser(userData);
    setIsLoggedIn(!!token);
    setIsAdminImpersonating(!!adminToken);
  }, []);

  const handleSwitchBack = () => {
    const adminToken = localStorage.getItem("admin_token");
    if (adminToken) {
      // 1. Restore the original admin token
      localStorage.setItem("auth_token", adminToken);

      // 2. Clean up the impersonation keys
      localStorage.removeItem("admin_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");

      toast.success("Returning to Admin account...");

      // 3. Force refresh to reset the entire app state
      setTimeout(() => {
        window.location.href = "/nl/dashboard/admin/users";
      }, 500);
    }
  };

  usePushNotifications(user?.id?.toString());

  const hiddenNavbar = useHideSomethingOnRoute(["/client/autoservicejanssen"]);

  return (
    <AuthProvider>
      <ServiceWorkerRegistration />
      <TranslationPreloader />

      {/* IMPERSONATION BANNER */}
      {/* {isAdminImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span className="text-xs md:text-sm font-bold tracking-wide uppercase">
              Impersonation Mode: You are viewing as {user?.name || "User"}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSwitchBack}
            className="bg-white text-amber-700 hover:bg-amber-50 border-none h-7 px-3 text-[10px] font-black uppercase"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Exit & Return to Admin
          </Button>
        </div>
      )} */}

      <NotificationBanner />

      {isDashboardPage || isUserTypePage ? null : <Header />}

      <PWALoader />

      {/* Main content area: 
          If impersonating, we add extra padding (pt-10) so the 
          banner doesn't cover the top of your dashboard.
      */}
      <main
        className={cn(
          isDashboardPage || isUserTypePage ? "pt-20" : "",
          isAdminImpersonating && "pt-10",
        )}
      >
        {children}
      </main>

      {!isDashboardChatPage &&
        !widgetLoading &&
        isLoggedIn &&
        widgetSettings && (
          <ChatWidget {...({ settings: widgetSettings } as any)} />
        )}

      {isDashboardPage || isUserTypePage ? null : <Footer />}

      <ToastContainer position="top-right" autoClose={5000} />
    </AuthProvider>
  );
}
