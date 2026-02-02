"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Shield,
  CheckCircle,
  X,
  Euro,
  Calendar,
  User,
} from "lucide-react";
import { Plan } from "@/services/planService";
import { motion } from "framer-motion";
import { tokenUtils } from "@/utils/auth";
import { toast } from "react-hot-toast";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onProceedToPayment: (plan: Plan) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onProceedToPayment,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Extract locale from current URL
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const locale = pathname.split("/")[1] || "en";

  if (!plan) return null;

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    try {
      const token = tokenUtils.getToken();
      if (!token) {
        toast.error("Please log in to continue with payment");
        return;
      }

      console.log("🚀 Starting payment process for plan:", {
        planId: plan.id,
        planName: plan.display_name,
        price: plan.price,
        duration: plan.duration_days,
      });

      const requestPayload = {
        amount: plan.price,
        description: `Plan: ${plan.display_name}`,
        plan_id: plan.id,
        redirect_url: `${window.location.origin}/${locale}/payment/success`,
        webhook_url: `${window.location.origin}/api/payment/webhook`,
      };

      console.log("📤 Sending payment request:", requestPayload);

      // Call Schepenkring.nlAPI to create Mollie payment
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.WALLET.DEPOSIT),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestPayload),
        },
      );

      console.log("📥 Payment API response status:", response.status);
      console.log(
        "📥 Payment API response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Payment API error response:", errorData);
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: Failed to create payment`,
        );
      }

      const paymentData = await response.json();
      console.log("✅ Payment API success response:", paymentData);

      // Check for various possible checkout URL field names
      const checkoutUrl =
        paymentData.checkout_url ||
        paymentData.payment_url ||
        paymentData.redirect_url ||
        paymentData.url ||
        paymentData.data?.checkout_url ||
        paymentData.data?.payment_url;

      console.log("🔍 Looking for checkout URL in response:", {
        checkout_url: paymentData.checkout_url,
        payment_url: paymentData.payment_url,
        redirect_url: paymentData.redirect_url,
        url: paymentData.url,
        data_checkout_url: paymentData.data?.checkout_url,
        data_payment_url: paymentData.data?.payment_url,
        foundUrl: checkoutUrl,
      });

      // Call onProceedToPayment before redirect to prevent React DOM errors
      await onProceedToPayment(plan);

      // Redirect to Mollie checkout URL from API response
      if (checkoutUrl) {
        console.log("🌐 Redirecting to checkout URL:", checkoutUrl);
        setIsRedirecting(true);
        // Use setTimeout to ensure state updates complete before redirect
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 100);
      } else {
        console.error(
          "❌ No checkout URL found in response. Full response:",
          paymentData,
        );
        throw new Error(
          "No checkout URL received from payment service. Please contact support.",
        );
      }
    } catch (error: any) {
      console.error("💥 Payment error:", error);
      console.error("💥 Error stack:", error.stack);

      // Only show error and reset state if we're not redirecting
      if (!isRedirecting) {
        toast.error(
          error.message || "Failed to process payment. Please try again.",
        );
        setIsProcessing(false);
      }
    } finally {
      // Only reset processing state if we're not redirecting
      if (!isRedirecting) {
        setIsProcessing(false);
      }
    }
  };

  // Removed features array

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Confirm Your Plan
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Plan Summary */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="text-center">
                <Badge className="mb-3 bg-blue-600 hover:bg-blue-700">
                  Selected Plan
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.display_name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <Euro className="w-6 h-6 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">
                    {plan.price}
                  </span>
                  <span className="text-gray-500">
                    / {plan.duration_days} days
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.duration_days} days access</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Single user</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Removed features and payment summary sections */}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Change Plan
            </Button>
            <Button
              onClick={handleProceedToPayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRedirecting ? "Redirecting..." : "Processing..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay with Mollie
                </div>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="w-3 h-3" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p>
              Your payment information is encrypted and secure. Cancel anytime.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
