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
import { ToastContainer } from "react-toastify";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { tokenUtils } from "@/utils/auth";
import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { NotificationBanner } from "@/components/common/NotificationBanner";
// import CookiePopup from "@/components/CookiePopup";
import { useWidgetSettings } from "@/hooks/useWidgetSettings";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login

  // Load widget settings from admin panel
  const { settings: widgetSettings, loading: widgetLoading } =
    useWidgetSettings();

  // Initialize user and check login status from localStorage
  useEffect(() => {
    const userData = tokenUtils.getUser();
    const token = tokenUtils.getToken(); // Checks for auth_token in localStorage

    setUser(userData);
    setIsLoggedIn(!!token); // Sets true if token exists, false if not
  }, []);

  // Initialize push notifications globally with user ID
  usePushNotifications(user?.id?.toString());

  // hook to hide something on route
  const hiddenNavbar = useHideSomethingOnRoute(["/client/autoservicejanssen"]);

  return (
    <AuthProvider>
      <ServiceWorkerRegistration />
      <TranslationPreloader />
      <NotificationBanner />

      {isDashboardPage || isUserTypePage ? null : <Header />}

      <PWALoader />

      <main className={isDashboardPage || isUserTypePage ? "pt-20" : ""}>
        {children}
      </main>

      {/* Widget logic: 
          1. Not on the chat page 
          2. Settings have finished loading
          3. User is logged in (auth_token exists)
      */}
      {!isDashboardChatPage &&
        !widgetLoading &&
        isLoggedIn &&
        widgetSettings && (
          <ChatWidget {...({ settings: widgetSettings } as any)} />
        )}

      {isDashboardPage || isUserTypePage ? null : <Footer />}

      {/* <CookiePopup /> */}
      <ToastContainer position="top-right" autoClose={5000} />
    </AuthProvider>
  );
}
