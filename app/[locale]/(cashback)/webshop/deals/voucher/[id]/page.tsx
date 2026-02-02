"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { tokenUtils } from "@/utils/auth"; // Adjust path to your auth utils

const API_BASE = "https://kring.answer24.nl/api/v1";

interface RequestedDeal {
  id: number | string;
  deal_name: string;
  deal_image: string | null;
  status: string;
  booking_date: string;
  customer_email: string;
  price?: string | number;
  deal_price?: string | number;
  people_count?: string | number;
}

export default function VoucherPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<RequestedDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Unauthorized");
          setLoading(false);
          return;
        }

        // We fetch all requested deals and find the specific one
        // (If you have a specific endpoint for getting ONE requested deal, use that instead)
        const res = await fetch(`${API_BASE}/requested-deals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          const found = result.data.find(
            (d: any) => d.id.toString() === params.id,
          );
          if (found) {
            setDeal(found);
            // Auto-trigger print after a short delay to ensure rendering
            setTimeout(() => {
              window.print();
            }, 800);
          } else {
            setError("Voucher not found.");
          }
        } else {
          setError("Could not load vouchers.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading voucher.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [params.id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  if (error || !deal)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-bold">{error || "Deal not found"}</p>
        <button
          onClick={() => router.push("/webshop")}
          className="text-blue-600 hover:underline"
        >
          Return to Webshop
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center print:bg-white print:p-0">
      {/* NO-PRINT CONTROLS */}
      <div className="mb-8 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
        >
          <Printer className="w-5 h-5" /> Print / Save as PDF
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      {/* THE VOUCHER (Exact Design) */}
      <div className="w-full max-w-[450px] bg-white border-[1.5px] border-slate-100 rounded-[40px] relative overflow-hidden print:border-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="p-10 text-left border-b-2 border-dashed border-slate-100">
          <img
            src={deal.deal_image || "https://kring.answer24.nl/placeholder.png"}
            className="w-16 h-16 rounded-[20px] object-cover mb-6 shadow-sm"
            alt="Logo"
          />
          <h1 className="text-[28px] font-[800] text-slate-900 tracking-tight leading-none mb-2">
            {deal.deal_name}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Reservation Confirmation & Voucher
          </p>
        </div>

        {/* Details Section */}
        <div className="p-10">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-100">
            <span className="text-[10px] font-[800] uppercase tracking-[0.15em] text-slate-400">
              Booking Details
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Customer
              </p>
              <p className="text-sm font-[600] text-slate-700 break-words">
                {deal.customer_email}
              </p>
            </div>
            <div className="mb-2 text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Arrival Date
              </p>
              <p className="text-sm font-[600] text-slate-700">
                {new Date(deal.booking_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Guests
              </p>
              <p className="text-sm font-[600] text-slate-700">
                {deal.people_count || "1"} Person(s)
              </p>
            </div>
            <div className="mb-2 text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Reference
              </p>
              <p className="text-sm font-[600] text-slate-700">
                A24-{deal.id.toString().slice(-4).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 rounded-3xl p-5">
            <div className="flex gap-2 text-[11px] text-slate-500 mb-2">
              <span>•</span>
              <span>Please present this voucher upon arrival.</span>
            </div>
            <div className="flex gap-2 text-[11px] text-slate-500">
              <span>•</span>
              <span>Valid only for the specified date.</span>
            </div>
          </div>
        </div>

        {/* Price Bar */}
        <div className="mx-10 p-6 bg-slate-900 rounded-3xl flex justify-between items-center text-white">
          <div>
            <p className="text-[11px] font-bold opacity-60 uppercase">
              Total Amount
            </p>
            <p className="text-2xl font-[800] tracking-tight">
              €{deal.price || deal.deal_price || "0.00"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold opacity-60 uppercase">Status</p>
            <p className="text-xs font-[900] text-green-400">CONFIRMED</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 text-center">
          <div className="inline-block p-3 border border-slate-100 rounded-3xl mb-5">
            {/* Simple QR Code Placeholder or SVG */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.5"
            >
              <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM14 14h3v3h-3zM17 17h4v4h-4zM14 17h3v4h-3zM17 14h4v3h-4z" />
            </svg>
          </div>
          <br />
          <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
            VOUCHER ID: #A24-{deal.id}
          </span>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body {
            background: white;
            -webkit-print-color-adjust: exact;
          }
          .min-h-screen {
            height: auto;
            display: block;
            padding: 20px;
          }
          /* Center content in print */
          .w-full.max-w-\\[450px\\] {
            margin: 0 auto;
            width: 100%;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}
