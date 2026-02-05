"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import ANSWER24LOGO from "@/public/schepenkring-logo.png";
import BOATSLOGO from "@/public/boatslogo.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = "https://kring.answer24.nl/api";

export function HeroSection() {
  const [mode, setMode] = useState<"login" | "register" | "partner">("login");
  const [showTerms, setShowTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = useTranslations("SignInPage");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Handle Initial Click [cite: 506]
  async function handleSubmitTrigger(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    
    if (mode === "partner") {
      setShowTerms(true); // Show popup for partners first [cite: 507, 508]
    } else {
      executeAuth(); // Standard login/register proceeds immediately [cite: 509]
    }
  }

  // Step 2: Actual API call [cite: 510]
async function executeAuth() {
    setShowTerms(false);
    setIsLoading(true);
    setSuccess("");
    setError(""); // Reset error state at start of attempt 

    try {
      // Choose the endpoint based on the current mode [cite: 13, 14]
      // Mode "partner" goes to /register/partner, "register" goes to /register, and "login" to /login
      const endpoint = mode === "login" 
        ? "/login" 
        : (mode === "partner" ? "/register/partner" : "/register");
      
      // Construct the payload based on the authentication mode [cite: 15]
      const payload = mode === "login" 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            accept_terms: true // Required by the controller validation
          };

      // Perform the POST request to the backend [cite: 16]
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload); 
      
      // The new QuickAuthController returns token, id, and userType directly [cite: 16]
      const { token, id, name, userType, email: userEmail } = response.data;

      if (token) {
        // Store session data in localStorage for persistence 
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_data", JSON.stringify({ 
          id, 
          name: name || formData.name, // Fallback if name isn't returned in login
          email: userEmail || formData.email, 
          userType 
        }));
        
        setSuccess("Identity Verified. Redirecting..."); 

        // Role-based redirection logic [cite: 18, 19]
        setTimeout(() => {
          if (userType === "Partner") {
            router.push("/account-setup");
          } else if (userType === "Admin") {
            router.push("/dashboard/admin"); 
          } else if (userType === "Employee") {
            router.push("/dashboard"); 
          } else {
            router.push("/yachts"); 
          }
        }, 800);
      }
    } catch (err: any) {
      // Capture detailed error messages to help bypass "silent" 500/CORS errors 
      const errorMessage = err.response?.data?.message || err.message || "An error occurred.";
      setError(errorMessage);
      console.error("Auth System Failure:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="relative flex flex-col lg:flex-row w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
          
         <div className="relative lg:w-1/2 h-48 lg:h-auto flex items-center justify-center p-8 overflow-hidden">
  {/* Background Image */}
  <Image 
    src={BOATSLOGO} 
    alt="Background" 
    fill 
    className="object-cover" 
    priority 
  />
  
  {/* Overlay Logo (Centered) */}
  <div className="relative z-10">
    <Image 
      src={ANSWER24LOGO} 
      alt="Logo" 
      width={240} 
      height={68} 
      className="object-contain" 
      priority 
    />
  </div>
</div>

          <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center">
            <div className="mb-4">
              {mode !== "login" && (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                  <button type="button" onClick={() => setMode("register")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${mode === "register" ? "bg-white shadow text-[#003566]" : "text-gray-400"}`}>USER</button>
                  <button type="button" onClick={() => setMode("partner")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${mode === "partner" ? "bg-white shadow text-[#003566]" : "text-gray-400"}`}>PARTNER</button>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-800 mb-1">
                {mode === "login" ? t("welcomeBack") : mode === "partner" ? "Partner Access" : "Create Account"}
              </h1>
              <p className="text-xs text-gray-500">
                {mode === "login" ? "Please enter your terminal credentials." : "Register to access the fleet management system."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitTrigger}>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-[13px] font-medium">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-[13px] font-medium">{success}</div>}

              {mode !== "login" && (
                <input name="name" type="text" required placeholder="Full Name" value={formData.name} onChange={handleInputChange}
                  className="w-full px-0 py-2 text-sm text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors" />
              )}

              <input name="email" type="email" required placeholder={t("enterEmail")} value={formData.email} onChange={handleInputChange}
                className="w-full px-0 py-2 text-sm text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors" />

              <input name="password" type="password" required placeholder={t("password")} value={formData.password} onChange={handleInputChange}
                className="w-full px-0 py-2 text-sm text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors" />

              {mode === "login" && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <input id="rememberMe" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 text-[#003566] border-gray-300 rounded focus:ring-[#003566] cursor-pointer" />
                    <label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">Remember Terminal</label>
                  </div>
                  <Link href="/forgot-password" className="text-xs text-gray-600 hover:text-[#003566]">{t("forgotPassword")}</Link>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full bg-[#003566] hover:bg-[#001d3d] text-white font-semibold py-2.5 rounded-lg mt-2 transition-all text-sm">
                {isLoading ? "Processing..." : mode === "login" ? t("login") : "Register Account"}
              </Button>

              <div className="text-center text-xs text-gray-600 mt-4">
                {mode === "login" ? (
                  <>
                    {t("noAccount")}{" "}
                    <button type="button" onClick={() => setMode("register")} className="text-[#003566] hover:underline font-bold">
                      {t("signupPartner")}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setMode("login")} className="text-[#003566] hover:underline font-bold">
                    Already have an account? Sign In here
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Terms Modal [cite: 525] */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#003566] font-bold">Yacht Brokerage Protocol</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2 text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
            <p>1. Partner agrees to maintain high standards of yacht brokerage transparency.</p>
            <p>2. Security notice: System automatically logs IP address and device fingerprints for terminal security.</p>
            <p>3. Access is strictly limited until full verification is completed in account setup.</p>
          </div>
          <Button onClick={executeAuth} className="bg-[#003566] text-white text-xs uppercase font-bold">I APPROVE & REGISTER</Button>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}