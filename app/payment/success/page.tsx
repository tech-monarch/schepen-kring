"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get all search parameters
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Redirect to the correct locale-based URL
    const queryString = params.toString();
    const redirectUrl = `/nl/payment/success${queryString ? `?${queryString}` : ""}`;

    console.log("🔄 Redirecting from /payment/success to:", redirectUrl);
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to the payment success page.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessRedirect() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          </div>
        </div>
      }
    >
      <PaymentSuccessRedirectContent />
    </Suspense>
  );
}
