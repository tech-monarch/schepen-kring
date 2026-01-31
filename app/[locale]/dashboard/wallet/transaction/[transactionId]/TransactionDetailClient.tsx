"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { tokenUtils } from "@/utils/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionDetail {
  id: string;
  user_id: number;
  mollie_payment_id: string;
  plan_name: string;
  payment_type: string;
  amount: string;
  currency: string;
  status: string;
  paid_at: string;
  mollie_data: {
    type?: string;
    description?: string;
    reference?: string;
  };
  created_at: string;
  updated_at: string;
}

export default function TransactionDetailClient() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.transactionId as string;

  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      console.log(
        "🔍 [TRANSACTION DETAIL] Fetching transaction:",
        transactionId,
      );
      setLoading(true);
      setError(null);

      try {
        const token = tokenUtils.getToken();
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/transactions/${transactionId}`;
        console.log("🌐 [TRANSACTION DETAIL] API URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log(
          "📡 [TRANSACTION DETAIL] Response status:",
          response.status,
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [TRANSACTION DETAIL] Error:", errorText);
          setError(`Failed to fetch transaction: ${response.status}`);
          setLoading(false);
          return;
        }

        const result = await response.json();
        console.log("📦 [TRANSACTION DETAIL] Response:", result);

        if (result.success && result.data) {
          setTransaction(result.data);
        } else {
          setError("Transaction not found");
        }
      } catch (err) {
        console.error("❌ [TRANSACTION DETAIL] Exception:", err);
        setError("An error occurred while fetching the transaction");
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransactionDetail();
    }
  }, [transactionId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "canceled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading transaction details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Transaction
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Transaction not found
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction Details</h1>
            <p className="text-sm text-muted-foreground">
              Transaction ID: {transaction.id}
            </p>
          </div>
        </div>

        {/* Main Transaction Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {transaction.plan_name}
                </CardTitle>
                <CardDescription className="mt-2">
                  {transaction.mollie_data?.description || "Wallet Transaction"}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Section */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Transaction Amount
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment ID</span>
                </div>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {transaction.mollie_payment_id}
                </p>
              </div>

              {/* Payment Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Payment Type</span>
                </div>
                <p className="font-medium capitalize">
                  {transaction.payment_type.replace(/_/g, " ")}
                </p>
              </div>

              {/* Date Paid */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Date Paid</span>
                </div>
                <p className="font-medium">{formatDate(transaction.paid_at)}</p>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>Currency</span>
                </div>
                <p className="font-medium">{transaction.currency}</p>
              </div>
            </div>

            {/* Additional Information */}
            {transaction.mollie_data && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {transaction.mollie_data.type && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Type
                      </span>
                      <span className="font-medium capitalize">
                        {transaction.mollie_data.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {transaction.mollie_data.reference && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Reference
                      </span>
                      <span className="font-mono text-sm">
                        {transaction.mollie_data.reference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created
                    </span>
                    <span className="text-sm">
                      {formatDate(transaction.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm">
                      {formatDate(transaction.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallet
          </Button>
          {/* Future: Add download receipt button */}
        </div>
      </div>
    </div>
  );
}
