"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, LogOut } from "lucide-react";

export default function ReturnToAdmin() {
  const [isAdminImpersonating, setIsAdminImpersonating] = useState(false);

  useEffect(() => {
    // Check if we have an admin token stored in backup
    const adminToken = localStorage.getItem("admin_token");
    setIsAdminImpersonating(!!adminToken);
  }, []);

  const handleReturnToAdmin = () => {
    const originalToken = localStorage.getItem("admin_token");
    
    if (originalToken) {
      // 1. Clear the impersonated cache
      localStorage.clear();
      
      // 2. Restore original admin token
      localStorage.setItem("auth_token", originalToken);
      
      // 3. Optional: Set user_data to Admin to avoid visual flicker
      localStorage.setItem("user_data", JSON.stringify({
        name: "Main Admin",
        role: "Admin",
        userType: "Admin"
      }));

      // 4. Force reload back to the management page
      window.location.href = "/dashboard/admin/users";
    }
  };

  if (!isAdminImpersonating) return null;

  return (
    <button
      onClick={handleReturnToAdmin}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all animate-pulse shadow-lg border border-red-400"
    >
      <ShieldAlert size={14} />
      Exit Impersonation
      <LogOut size={14} className="ml-2" />
    </button>
  );
}