"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { tokenUtils } from "@/utils/auth";
import {
  Loader2,
  CreditCard,
  Plus,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getApiUrl, getApiHeaders, API_CONFIG } from "@/lib/api-config";
import { toast } from "react-toastify";

interface SubscriptionData {
  plan_name?: string;
  credits_used?: number;
  credits_total?: number;
  renewal_date?: string;
  status?: string;
  is_active?: boolean;
  plan_id?: string;
  trial_ends_at?: string;
  is_trial?: boolean;
}

interface Invoice {
  id: string;
  invoice_number?: string;
  amount?: number;
  date?: string;
  status?: string;
  created_at?: string;
}

interface TrialData {
  is_trial?: boolean;
  trial_ends_at?: string;
  trial_days_remaining?: number;
}

export function Billing() {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = tokenUtils.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.DETAILS),
        {
          method: "GET",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Subscription data:", data);

      setSubscriptionData(data.data || data);

      // Check if user has an active subscription
      const isActive = data.data?.is_active || data.is_active;
      setHasActivePlan(isActive === true);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch subscription data",
      );
      setHasActivePlan(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const token = tokenUtils.getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.INVOICE.LIST),
        {
          method: "GET",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      const data = await response.json();
      setInvoices(data.data || data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const fetchTrialData = async () => {
    try {
      const token = tokenUtils.getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.TRIAL),
        {
          method: "GET",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setTrialData(data.data || data);
    } catch (error) {
      console.error("Error fetching trial data:", error);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);
      const token = tokenUtils.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL),
        {
          method: "POST",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      await fetchSubscriptionData();
    } catch (error) {
      toast.error("Failed to cancel subscription");
      console.error("Error cancelling subscription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (!confirm("Are you sure you want to renew your subscription?")) {
      return;
    }

    try {
      setIsProcessing(true);
      const token = tokenUtils.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.RENEW),
        {
          method: "POST",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to renew subscription");
      }

      toast.success("Subscription renewed successfully");
      await fetchSubscriptionData();
    } catch (error) {
      toast.error("Failed to renew subscription");
      console.error("Error renewing subscription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtendSubscription = async () => {
    if (!confirm("Are you sure you want to extend your subscription?")) {
      return;
    }

    try {
      setIsProcessing(true);
      const token = tokenUtils.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.SUBSCRIPTION.EXTEND),
        {
          method: "POST",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to extend subscription");
      }

      const data = await response.json();
      toast.success(data.message || "Subscription extended successfully");
      await fetchSubscriptionData();
    } catch (error) {
      toast.error("Failed to extend subscription");
      console.error("Error extending subscription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    toast.info("Payment method update coming soon");
    // TODO: Implement payment method update flow
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const token = tokenUtils.getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.INVOICE.DOWNLOAD(invoiceId)),
        {
          method: "GET",
          headers: getApiHeaders(token),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
      console.error("Error downloading invoice:", error);
    }
  };

  const handleContactSupport = () => {
    // Open chat widget or navigate to support
    window.location.href = "/support";
  };

  useEffect(() => {
    fetchSubscriptionData();
    fetchInvoices();
    fetchTrialData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading billing information...</span>
      </div>
    );
  }

  // No active plan state
  if (!hasActivePlan && !error) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <CreditCard className="h-8 w-8 text-gray-600" />
            </div>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You haven't subscribed to any plan yet. Choose a plan to get
              started with Answer24.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to unlock AI-powered features and start your journey
              with us.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/pricing">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Choose a Plan
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Questions about our plans or pricing? We're here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Contact our support team if you have any questions about choosing
              the right plan for your needs.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleContactSupport}>
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculate progress percentage for active subscriptions
  const progressValue = subscriptionData?.credits_total
    ? ((subscriptionData.credits_used || 0) / subscriptionData.credits_total) *
      100
    : 0;

  // Active subscription state
  return (
    <div className="space-y-8">
      {/* Trial Info Card */}
      {(subscriptionData?.is_trial || trialData?.is_trial) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Trial Period
            </CardTitle>
            <CardDescription className="text-blue-800">
              You are currently on a trial period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Trial ends on:</strong>{" "}
                {trialData?.trial_ends_at ||
                  subscriptionData?.trial_ends_at ||
                  "N/A"}
              </p>
              {trialData?.trial_days_remaining && (
                <p className="text-sm">
                  <strong>Days remaining:</strong>{" "}
                  {trialData.trial_days_remaining}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/pricing">
              <Button>Upgrade Now</Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      {/* Subscription Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            You are currently on the{" "}
            <strong>{subscriptionData?.plan_name || "Growth"}</strong> plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">Error: {error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSubscriptionData}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium">Monthly AI Credits</p>
                <p className="text-sm">
                  {subscriptionData?.credits_used || 0}/
                  {subscriptionData?.credits_total || 100}
                </p>
              </div>
              <Progress value={progressValue} />
              <p className="text-xs text-gray-500">
                Your credits will reset on{" "}
                {subscriptionData?.renewal_date || "August 1, 2025"}.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 flex-wrap">
          <Link href="/pricing">
            <Button variant="outline">Change Plan</Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleExtendSubscription}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Extend Subscription"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleRenewSubscription}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renew Now
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Cancel Subscription"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Payment Method Card */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Update your billing details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
            <div>
              <p className="font-medium">Payment method on file</p>
              <p className="text-sm text-gray-500">
                Manage your payment information
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleUpdatePaymentMethod}>
            Update Payment Method
          </Button>
        </CardFooter>
      </Card>

      {/* Billing History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvoices ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading invoices...</span>
            </div>
          ) : invoices.length > 0 ? (
            <ul className="space-y-4">
              {invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {invoice.date ||
                        (invoice.created_at
                          ? new Date(invoice.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "N/A")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Invoice #{invoice.invoice_number || invoice.id}
                    </p>
                    {invoice.amount && (
                      <p className="text-sm text-gray-600">${invoice.amount}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No invoices found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
