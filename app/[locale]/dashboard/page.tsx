// app/[locale]/dashboard/layout.tsx
"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuthGuard } from "@/components/AuthGuard";
import { 
  Anchor, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Hammer, 
  Calendar 
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const sidebarItems = [
    { title: "Overview", href: "/dashboard/admin", icon: BarChart3 },
    { title: "Fleet Management", href: "/dashboard/admin/yachts", icon: Anchor },
    { title: "Task Board", href: "/dashboard/admin/tasks", icon: CheckSquare },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-[#050505] text-white">
        <DashboardHeader />
        <div className="flex pt-20">
          {/* Sidebar */}
          <aside className="w-64 fixed left-0 top-20 bottom-0 border-r border-white/5 bg-[#080808] hidden lg:block overflow-y-auto">
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                    pathname === item.href 
                      ? "bg-[#c5a572] text-black" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={16} />
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 lg:ml-64 p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
