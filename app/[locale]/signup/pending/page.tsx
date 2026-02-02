"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  X,
  Lock,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PendingOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdentifier = searchParams.get("identifier");

  // Loading & UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  // Agreement Metadata State
  const [clientIp, setClientIp] = useState("Detecting...");
  const [browserInfo, setBrowserInfo] = useState("");
  const [agreementText, setAgreementText] = useState("");

  useEffect(() => {
    // 1. Safety Check
    if (!userIdentifier && !success) {
      router.push("/nl/signup");
      return;
    }

    // 2. Set Browser Info
    setBrowserInfo(`${navigator.userAgent}`);

    // 3. Parallel Data Fetching (IP and Template)
    const initPage = async () => {
      // Detect IP
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        setClientIp(ipData.ip);
      } catch (err) {
        setClientIp("Hidden/VPN");
      }

      // Fetch Template
      try {
        const tempRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/settings/agreement-template`,
        );
        const tempData = await tempRes.json();
        if (tempData.content) {
          setAgreementText(tempData.content);
        }
      } catch (err) {
        setAgreementText(
          "Partnership Agreement between Schepenkring.nland {{company_name}}. Represented by {{contact_person}}. By signing, you agree to the terms.",
        );
      }
    };

    initPage();
  }, [userIdentifier, success, router]);

  // Helper to replace variables in text for the UI preview
  const getProcessedAgreement = () => {
    return agreementText
      .replace(/{{company_name}}/g, companyName || "[Company Name]")
      .replace(/{{address}}/g, address || "[Address]")
      .replace(/{{contact_person}}/g, contactPerson || "[Contact Person]")
      .replace(/{{email}}/g, userIdentifier || "[Email]")
      .replace(/{{date}}/g, new Date().toLocaleDateString("nl-NL"));
  };

  const handleOpenAgreement = (e: FormEvent) => {
    e.preventDefault();
    setShowAgreement(true);
  };

  async function handleFinalSubmit() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/pending-onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            identifier: userIdentifier,
            company_name: companyName,
            contact_person: contactPerson,
            website: websiteUrl,
            phone: businessPhone,
            address: address,
            description: description,
            facebook,
            instagram,
            youtube,
            signature_metadata: {
              ip: clientIp,
              browser: browserInfo,
              timestamp: new Date().toISOString(),
              agreement_content: getProcessedAgreement(),
            },
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        setPdfUrl(data.pdf_url); // Store the URL returned by the backend
        setSuccess(true);
        setShowAgreement(false);
      } else {
        throw new Error(data.message || "Submission failed.");
      }
    } catch (err: any) {
      setError(err.message);
      setShowAgreement(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* AGREEMENT POPUP */}
      <AnimatePresence>
        {showAgreement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-lg text-slate-800">
                    Legal Agreement
                  </h2>
                </div>
                <button
                  onClick={() => setShowAgreement(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-white text-slate-600 leading-relaxed text-sm">
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap mb-8">
                    {getProcessedAgreement()}
                  </p>
                </div>

                <div className="mt-8 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Digital Signature Audit Trail
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div>
                      <span className="block text-slate-400">IP Address</span>
                      <span className="font-mono font-bold text-slate-700">
                        {clientIp}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Timestamp</span>
                      <span className="font-mono font-bold text-slate-700">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400">Fingerprint</span>
                      <span className="font-mono text-slate-500 truncate block">
                        {browserInfo}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAgreement(false)}
                  className="flex-1 rounded-xl py-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 font-bold"
                >
                  {isLoading ? "Signing..." : "Agree & Submit Application"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
        <div className="relative lg:w-1/2 h-64 lg:h-auto">
          <Image
            src="/image.png"
            alt="Onboarding"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Business Profile
            </h1>
            <p className="text-blue-600">
              {success
                ? "Application Received"
                : `Setting up account for: ${userIdentifier}`}
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="bg-blue-50 text-blue-700 p-6 rounded-xl mb-6">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Under Review</h2>
                <p className="text-sm">
                  Application signed and submitted. An admin will review your
                  agreement shortly.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold bg-white px-4 py-2 rounded-lg border shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Download Signed PDF
                    </a>
                  )}
                </div>
              </div>
              <Button
                onClick={() => router.push("/nl/login")}
                className="w-full bg-blue-600 py-3"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleOpenAgreement}>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <Building2 className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  required
                  placeholder="Company Name"
                  className="w-full focus:outline-none bg-transparent"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <Globe className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  placeholder="Website URL"
                  className="w-full focus:outline-none bg-transparent"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <Phone className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  required
                  placeholder="Business Phone"
                  className="w-full focus:outline-none bg-transparent"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <MapPin className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  required
                  placeholder="Business Address"
                  className="w-full focus:outline-none bg-transparent"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <h3 className="text-sm font-bold text-gray-500 mt-4 uppercase">
                Identity
              </h3>
              <div className="flex items-center border-b-2 border-gray-300 py-2">
                <input
                  required
                  placeholder="Primary Contact Person"
                  className="w-full focus:outline-none bg-transparent"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <h3 className="text-sm font-bold text-gray-500 mt-6 uppercase">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Facebook URL"
                  className="border-b-2 py-2 focus:outline-none bg-transparent"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
                <input
                  placeholder="Instagram URL"
                  className="border-b-2 py-2 focus:outline-none bg-transparent"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 flex items-center">
                  <FileText className="h-3 w-3 mr-1" /> Business Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-600 focus:outline-none text-sm"
                  placeholder="Tell us what your business does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg mt-4"
              >
                {isLoading ? "Processing..." : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
