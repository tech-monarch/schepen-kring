import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuthGuard } from "@/components/AuthGuard";
// import InactivityLockProvider from "@/components/InactivityLockProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true}>
      {/* <InactivityLockProvider> */}
        <div className="min-h-screen bg-gray-50">
          <DashboardHeader />
          <main className="">{children}</main>
        </div>
      {/* </InactivityLockProvider> */}
    </AuthGuard>
  );
}
