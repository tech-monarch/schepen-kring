"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { tokenUtils } from "@/utils/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenUtils.getToken();
      const user = tokenUtils.getUser();

      const authenticated = !!(token && user);
      setIsAuthenticated(authenticated);

      if (requireAuth && !authenticated) {
        router.replace("/login");
      } else if (!requireAuth && authenticated) {
        router.replace("/dashboard");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to signin
  }

  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect to dashboard
  }

  return <>{children}</>;
};
