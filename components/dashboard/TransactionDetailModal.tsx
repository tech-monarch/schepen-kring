"use client";

import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { tokenUtils } from "@/utils/auth";
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
  mollie_data?: {
    type?: string;
    description?: string;
    reference?: string;
  };
  description?: string; // Add this too
  created_at: string;
  updated_at: string;
}

interface TransactionDetailModalProps {
  transactionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({
  transactionId,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !transactionId) return;

    const fetchTransactionDetail = async () => {
      console.log(
        "🔍 [TRANSACTION MODAL] Fetching transaction:",
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
        console.log("🌐 [TRANSACTION MODAL] API URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("📡 [TRANSACTION MODAL] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ [TRANSACTION MODAL] Error:", errorText);
          setError(`Failed to fetch transaction: ${response.status}`);
          setLoading(false);
          return;
        }

        const result = await response.json();
        console.log("📦 [TRANSACTION MODAL] Response:", result);

        if (result.success && result.data) {
          setTransaction(result.data);
        } else {
          setError("Transaction not found");
        }
      } catch (err) {
        console.error("❌ [TRANSACTION MODAL] Exception:", err);
        setError("An error occurred while fetching the transaction");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Transaction Details</h2>
            <p className="text-xs text-muted-foreground mt-1">
              ID: {transactionId}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading transaction details...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Transaction
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          ) : transaction ? (
            <div className="space-y-6">
              {/* Title and Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {transaction.plan_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {transaction.mollie_data?.description || transaction.description || "Wallet Deposit"}
                  </p>
                </div>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment ID */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment ID</span>
                  </div>
                  <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
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
                  <p className="font-medium text-sm">
                    {formatDate(transaction.paid_at)}
                  </p>
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
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {transaction.mollie_data.type && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">
                          {transaction.mollie_data.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                    {transaction.mollie_data.reference && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-mono text-xs">
                          {transaction.mollie_data.reference}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(transaction.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">
                        Last Updated
                      </span>
                      <span>{formatDate(transaction.updated_at)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Transaction not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-6 py-4">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
