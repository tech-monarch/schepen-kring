"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useRouter } from "@/i18n/navigation";
import { Wallet, ArrowLeft, Download, CreditCard } from "lucide-react";

interface PaymentDetails {
  mollie_payment_id: string;
  plan: string;
  amount: string;
  currency: string;
  paid_at: string;
  created_at: string;
  checkout_url?: string;
  status?: string;
}

interface ClientInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Transaction {
  id: string;
  payment_type: "wallet" | "expense";
  mollie_data: {
    description: string;
  };
  mollie_payment_id: string;
  paid_at: string;
  amount: number;
  status: string;
}

interface InvoiceCardProps {
  transactionId: string;
}

export default function InvoiceCard({ transactionId }: InvoiceCardProps) {
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  // Dummy transactions data (same as wallet page)
  const dummyTransactions: Transaction[] = [
    {
      id: "txn_001",
      payment_type: "wallet",
      mollie_data: { description: "Top-up from Bank" },
      mollie_payment_id: "tr_abc123",
      paid_at: new Date().toISOString(),
      amount: 100,
      status: "paid",
    },
    {
      id: "txn_002",
      payment_type: "expense",
      mollie_data: { description: "Payment for Service A" },
      mollie_payment_id: "tr_def456",
      paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 45.5,
      status: "pending",
    },
    {
      id: "txn_003",
      payment_type: "wallet",
      mollie_data: { description: "Refund for item X" },
      mollie_payment_id: "tr_ghi789",
      paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 20.0,
      status: "active",
    },
    {
      id: "txn_004",
      payment_type: "expense",
      mollie_data: { description: "Subscription renewal" },
      mollie_payment_id: "tr_jkl012",
      paid_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 15.0,
      status: "paid",
    },
    {
      id: "txn_005",
      payment_type: "wallet",
      mollie_data: { description: "Top-up from Credit Card" },
      mollie_payment_id: "tr_mno345",
      paid_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 50.0,
      status: "paid",
    },
  ];

  const dummyClientInfo: ClientInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+31 6 12345678",
    address: "123 Main Street, 1234 AB Amsterdam, Netherlands"
  };

  // Generate QR code for wallet payment
  const generateQRCode = async (url: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 120,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('QR code generation error:', error);
      setQrCodeDataUrl("");
    }
  };

  useEffect(() => {
    // Find the specific transaction by ID and convert to PaymentDetails format
    const loadTransactionData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the transaction by ID
      const transaction = dummyTransactions.find(t => t.id === transactionId);
      
      if (transaction) {
        // Convert Transaction to PaymentDetails format
        const paymentDetails: PaymentDetails = {
          mollie_payment_id: transaction.mollie_payment_id,
          plan: transaction.mollie_data.description,
          amount: transaction.amount.toString(),
          currency: "EUR",
          paid_at: transaction.status === "paid" ? transaction.paid_at : "",
          created_at: transaction.paid_at,
          checkout_url: "/wallet",
          status: transaction.status
        };
        
        setPaymentDetails(paymentDetails);
        setClientInfo(dummyClientInfo);
        
        // Generate QR code for wallet payment
        const walletUrl = `${window.location.origin}/wallet`;
        generateQRCode(walletUrl);
      }
      
      setLoading(false);
    };

    loadTransactionData();
  }, [transactionId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePayWithWallet = () => {
    router.push('/wallet');
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl h-screen mx-auto bg-white p-6 rounded-2xl shadow-xl my-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          Loading invoice...
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl my-10 text-center">
        <div className="text-red-500 mb-4">Invoice not found</div>
        <p className="text-gray-600 mb-4">Transaction ID: {transactionId}</p>
       
      </div>
    );
  }

  const {
    mollie_payment_id,
    plan,
    amount,
    currency,
    paid_at,
    created_at,
    status,
  } = paymentDetails;

  // The amount stored is the total amount paid (including VAT)
  const totalAmount = parseFloat(amount || "0");
  const taxRate = 0.21;
  
  // Calculate subtotal and VAT from the total amount
  const subtotal = totalAmount / (1 + taxRate);
  const taxAmount = totalAmount - subtotal;

  // Check if invoice is paid
  const isPaid = status === "paid" || paid_at;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl my-10 relative">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          
        </div>
        {/* <div className="flex items-center gap-4">
          <div className="text-3xl sm:text-4xl font-bold text-blue-600">INVOICE</div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div> */}
      </div>

      {/* PAID Stamp */}
      {isPaid && (
        <div className="absolute top-28 right-4 bg-green-600 text-white px-4 py-2 rounded font-bold text-sm transform rotate-12 z-10">
          PAID
        </div>
      )}

      {/* Company & Invoice Info */}
      <div className="flex flex-col sm:flex-row justify-between border-b pb-4 gap-6">
        <div>
          <div className="text-xl font-bold text-blue-600">Answer24</div>
          <div className="text-sm text-gray-700 mt-2">Answer24 B.V.</div>
          <div className="text-sm text-gray-700">Keizersgracht 123</div>
          <div className="text-sm text-gray-700 mt-2">1015 CJ Amsterdam</div>
          <div className="text-sm text-gray-700 mt-2">Netherlands</div>
          <div className="text-sm text-gray-700 mt-2">KvK: 12345678</div>
          <div className="text-sm text-gray-700 mt-2">VAT: NL123456789B01</div>
        </div>
        <div className="text-sm text-gray-700 sm:text-right">
          <div className="mt-2">Invoice Number: <strong>{mollie_payment_id || "N/A"}</strong></div>
          <div className="mt-2">Date: <strong>{formatDate(created_at)}</strong></div>
          <div className="mt-2">Due Date: <strong>{formatDate(paid_at) || "Upon receipt"}</strong></div>
          <div className="mt-2">Status: <strong className={`${status === 'paid' ? 'text-green-600' : status === 'pending' ? 'text-yellow-600' : 'text-gray-600'}`}>{status || "Pending"}</strong></div>
        </div>
      </div>

      {/* Client Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-lg font-semibold text-gray-900 mb-2">Invoice For:</div>
        {clientInfo ? (
          <>
            <div className="text-sm text-gray-700">{clientInfo.name}</div>
            <div className="text-sm text-gray-700">{clientInfo.email}</div>
            {clientInfo.phone && <div className="text-sm text-gray-700">{clientInfo.phone}</div>}
            {clientInfo.address && <div className="text-sm text-gray-700">{clientInfo.address}</div>}
          </>
        ) : (
          <div className="text-sm text-gray-700">Client data not available</div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Description</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Price (excl. VAT)</th>
              <th className="p-3">VAT Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">{plan || "Product/Service"}</td>
              <td className="p-3">1</td>
              <td className="p-3">€{subtotal.toFixed(2)} {currency}</td>
              <td className="p-3">€{taxAmount.toFixed(2)} {currency}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 text-right space-y-1 text-sm sm:text-base">
        <div>Subtotal: <strong>€{subtotal.toFixed(2)} {currency}</strong></div>
        <div>VAT (21%): <strong>€{taxAmount.toFixed(2)} {currency}</strong></div>
        <div className="text-lg font-bold bg-blue-600 text-white p-2 inline-block rounded mt-2">
          Total (incl. VAT): €{totalAmount.toFixed(2)} {currency}
        </div>
      </div>

      {/* <div className="mt-6 border-t pt-6">      
        <div className="flex justify-center">
          <div className="text-center">
            {qrCodeDataUrl ? (
              <div className="flex justify-center mb-4">
                <img src={qrCodeDataUrl} alt="QR Code for Wallet Payment" className="w-32 h-32 border rounded-lg" />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-xs rounded-lg border">
                  Loading QR Code...
                </div>
              </div>
            )}
          </div>      
        </div>
      </div>
      <div className="mt-6 text-sm text-center text-gray-600">
        <p className="mb-2">
          Thank you for your business! This invoice is generated automatically and is valid without signature.
        </p>
        <p>
          For questions about this invoice, please contact our support team at&nbsp;
          <a href="mailto:support@answer24.nl" className="text-blue-600 underline hover:text-blue-800">
            support@lociq.nl
          </a>.
        </p>
      </div> */}
    </div>
  );
}