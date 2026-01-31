"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { PrivateNavbar } from "./PrivateNavbar";
import { tokenUtils } from "@/utils/auth";

const Header = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = tokenUtils.getToken();
      const user = tokenUtils.getUser();
      const authenticated = !!(token && user);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case of in-memory changes
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Handle internationalized routes by removing locale prefix
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}/, "") || "/";

  // Define public routes that should always show public header
  const publicRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/unauthorized",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    normalizedPathname.startsWith(route)
  );

  // Show loading state briefly
  if (isLoading) {
    return <Navbar />; // Default to public navbar while loading
  }

  // Always show public navbar for public routes
  if (isPublicRoute) {
    return <Navbar />;
  }

  // Show private navbar for authenticated users, public navbar for non-authenticated
  return isAuthenticated ? <PrivateNavbar /> : <Navbar />;
};

export default Header;
