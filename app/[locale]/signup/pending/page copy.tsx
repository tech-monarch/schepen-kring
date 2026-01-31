"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // To read the URL
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function PendingOnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get the identifier (email) from the URL
  const userIdentifier = searchParams.get("identifier");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [contactPerson, setContactPerson] = useState(""); // [cite: 141, 142]
const [facebook, setFacebook] = useState("");
const [instagram, setInstagram] = useState("");
const [youtube, setYoutube] = useState("");

  // Safety Check: If someone visits the link directly without an identifier
  useEffect(() => {
    if (!userIdentifier && !success) {
      router.push("nl/signup"); // Send them back to register
    }
  }, [userIdentifier, success, router]);

  async function handleOnboardingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/pending-onboarding`, // Make sure the path is correct
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json" // CRITICAL: Tells Laravel to send JSON errors instead of redirects
          },
          // Ensure credentials are NOT included since backend is set to supports_credentials => false
          credentials: "omit", 
          body: JSON.stringify({
            identifier: userIdentifier, // [cite: 146]
            company_name: companyName, // [cite: 146]
            contact_person: contactPerson, 
            website: websiteUrl, // [cite: 146]
            phone: businessPhone, // [cite: 147]
            address: address, // [cite: 147]
            description: description, // [cite: 147]
            facebook: facebook,
            instagram: instagram,
            youtube: youtube
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        // This will now catch the Laravel validation errors correctly
        throw new Error(data.message || "Submission failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
        {/* Left Side - Matching Signup Template */}
        <div className="relative lg:w-1/2 h-64 lg:h-auto">
          <Image
            src="/image.png"
            alt="Onboarding"
            fill
            className="object-cover"
            priority
          />{" "}
        </div>

        {/* Right Side - Form */}
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
                <p>
                  We've linked these details to your account. You'll receive an
                  email once an admin approves your partnership.
                </p>
              </div>
              <Button
                onClick={() => router.push("/nl/login")}
                className="w-full bg-blue-600 py-3"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleOnboardingSubmit}>
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
                  className="w-full focus:outline-none"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <Globe className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  placeholder="Website URL"
                  className="w-full focus:outline-none"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <Phone className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  required
                  placeholder="Business Phone"
                  className="w-full focus:outline-none"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                />
              </div>

              <div className="flex items-center border-b-2 border-gray-300 focus-within:border-blue-600 py-2">
                <MapPin className="text-gray-400 mr-3 h-5 w-5" />
                <input
                  required
                  placeholder="Business Address"
                  className="w-full focus:outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              {/* Identity Section */}
<h3 className="text-sm font-bold text-gray-500 mt-4 uppercase">Identity</h3>
<div className="flex items-center border-b-2 border-gray-300 py-2">
  <input 
    required 
    placeholder="Primary Contact Person" 
    className="w-full focus:outline-none" 
    value={contactPerson}
    onChange={(e) => setContactPerson(e.target.value)} 
  />
</div>

{/* Social Links Section */}
<h3 className="text-sm font-bold text-gray-500 mt-6 uppercase">Social Links</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <input 
    placeholder="Facebook URL" 
    className="border-b-2 py-2 focus:outline-none" 
    value={facebook}
    onChange={(e) => setFacebook(e.target.value)} 
  />
  <input 
    placeholder="Instagram URL" 
    className="border-b-2 py-2 focus:outline-none" 
    value={instagram}
    onChange={(e) => setInstagram(e.target.value)} 
  />
  <input 
    placeholder="YouTube URL" 
    className="border-b-2 py-2 focus:outline-none" 
    value={youtube}
    onChange={(e) => setYoutube(e.target.value)} 
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
                {isLoading ? "Saving..." : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
