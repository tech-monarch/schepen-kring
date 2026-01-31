"use client";

import { useState, useEffect } from "react";
import { Check, Star, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { tokenUtils } from "@/utils/auth";
import { PaymentModal } from "@/components/plans/PaymentModal";
import { getApiUrl, API_CONFIG } from "@/lib/api-config";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Pricing() {
  const t = useTranslations("Pricing");
  const [pricingTiers, setPricingTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  const fetchPricingData = async () => {
    try {
      setIsLoading(true);
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.PLAN.LIST);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.success && data.data) {
        const formattedTiers = data.data.map((tier: any) => ({
          ...tier,
          features: Array.isArray(tier.features) ? tier.features : [],
          is_popular: tier.name.toLowerCase().includes("starter") || tier.name.toLowerCase().includes("professional"),
        }));
        setPricingTiers(formattedTiers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "API Error");
      // Fallback data if API fails
      setPricingTiers(getFallbackData());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackData = () => [
    { id: "basic", name: "basic", display_name: "Basic", description: t("fallback.basicDesc"), price: "29.99", formatted_price: "€29.99", duration_days: 30, features: ["50 Leads", "AI Core", "Email Support"], is_popular: false },
    { id: "starter", name: "starter", display_name: "Premium", description: t("fallback.premiumDesc"), price: "79.99", formatted_price: "€79.99", duration_days: 30, features: ["200 Leads", "Advanced AI", "WhatsApp Integration"], is_popular: true }
  ];

  const handlePlanSelection = (tier: any) => {
    const token = tokenUtils.getToken();
    if (!!token) {
      setSelectedPlan(tier);
      setShowPaymentModal(true);
    } else {
      localStorage.setItem("selectedPlan", JSON.stringify(tier));
      router.push(`/signup?plan=${tier.id}`);
    }
  };

  useEffect(() => { fetchPricingData(); }, []);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="h-10 w-10 text-[#c5a572] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-32 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-1 border border-[#c5a572]/30 rounded-full mb-8">
            <Zap size={14} className="text-[#c5a572] fill-[#c5a572]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a572]">{t("badge")}</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-6">
            {t.rich("title", { span: (c) => <span className="text-slate-500 not-italic">{c}</span> })}
          </h1>
          <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                "rounded-none border-white/5 bg-white/[0.02] transition-all duration-500 hover:border-[#c5a572]/40 group",
                tier.is_popular ? "scale-105 bg-white/[0.04] border-[#c5a572]/20 z-10" : "scale-95"
              )}
            >
              {tier.is_popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-[#c5a572] text-black rounded-none px-4 py-1 font-bold text-[10px] tracking-widest uppercase">
                    {t("mostPopular")}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-10">
                <CardTitle className="text-sm uppercase tracking-[0.4em] text-[#c5a572] mb-4">
                  {tier.display_name || tier.name}
                </CardTitle>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-serif text-white italic">{tier.formatted_price}</span>
                  <span className="text-slate-500 text-xs ml-2 uppercase tracking-tighter">/ {t("month")}</span>
                </div>
                <CardDescription className="text-slate-500 text-xs mt-4 uppercase tracking-widest leading-relaxed">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 py-10">
                <ul className="space-y-4">
                  {tier.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-light">
                      <Check size={14} className="text-[#c5a572]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-10 px-8">
                <Button
                  onClick={() => handlePlanSelection(tier)}
                  className={cn(
                    "w-full rounded-none h-14 font-bold uppercase tracking-[0.2em] text-[10px] transition-all",
                    tier.is_popular ? "bg-[#c5a572] text-black hover:bg-white" : "bg-white/5 text-white border border-white/10 hover:bg-[#c5a572] hover:text-black"
                  )}
                >
                  {t("cta")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Micro-FAQ Footer */}
        <div className="mt-32 pt-20 border-t border-white/5 grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <h4 className="text-[#c5a572] font-serif italic text-lg mb-3">{t(`faq.q${i}`)}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-light">{t(`faq.a${i}`)}</p>
            </div>
          ))}
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        onProceedToPayment={() => router.push("/dashboard/billing")}
      />
    </div>
  );
}