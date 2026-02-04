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

const API_BASE_URL = "https://kring.answer24.nl/api";

export function HeroSection() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    acceptTerms: false,
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const t = useTranslations("SignInPage");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  async function handleAuthSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!isLoginMode && !formData.acceptTerms) {
        throw new Error("You must accept the terms to register.");
      }

      const endpoint = isLoginMode ? "/login" : "/register";
      const payload = isLoginMode 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            accept_terms: formData.acceptTerms 
          };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      const { token, id, name, userType, email: userEmail } = response.data;

      if (token) {
        localStorage.setItem("auth_token", token);
        const userData = { id, name, email: userEmail, userType };
        localStorage.setItem("user_data", JSON.stringify(userData));

        setSuccess(isLoginMode ? "Identity Verified. Redirecting..." : "Account Created. Redirecting...");

        setTimeout(() => {
          if (userType === "Admin") {
            router.push("/dashboard/admin");
          } else if (userType === "Employee") {
            router.push("/dashboard");
          } else {
            router.push("/yachts");
          }
        }, 800);
      } else {
        throw new Error("Authentication failed: Token missing.");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative flex flex-col lg:flex-row w-11/12 md:w-3/4 lg:w-4/5 xl:w-2/3 2xl:w-1/2 bg-white rounded-2xl shadow-lg overflow-hidden my-8">
          
          {/* Left Panel: Branding */}
          <div className="relative lg:w-1/2 h-64 lg:h-auto bg-[#003566] flex items-center justify-center p-12">
            <Image
              src={ANSWER24LOGO}
              alt="Logo"
              width={280}
              height={80}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* Right Panel: Form */}
          <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {isLoginMode ? t("welcomeBack") : "Create Account"}
              </h1>
              <p className="text-sm text-gray-500">
                {isLoginMode ? "Please enter your terminal credentials." : "Register to access the fleet management system."}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleAuthSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm font-medium">
                  {success}
                </div>
              )}

              {!isLoginMode && (
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors"
                />
              )}

              <input
                name="email"
                type="email"
                required
                placeholder={t("enterEmail")}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors"
              />

              <input
                name="password"
                type="password"
                required
                placeholder={t("password")}
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-0 py-3 text-gray-700 bg-transparent border-0 border-b-2 border-gray-300 focus:border-[#003566] focus:outline-none transition-colors"
              />

              {isLoginMode ? (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-[#003566] border-gray-300 rounded focus:ring-[#003566] cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                      Remember Terminal
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-[#003566]">
                    {t("forgotPassword")}
                  </Link>
                </div>
              ) : (
                <div className="flex items-start space-x-2 mt-4">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 mt-1 text-[#003566] border-gray-300 rounded focus:ring-[#003566] cursor-pointer"
                  />
                  <label htmlFor="acceptTerms" className="text-[11px] leading-tight text-gray-500 cursor-pointer uppercase tracking-tighter">
                    I agree to the terms and conditions and consent to the system storing my IP address and device details for security purposes.
                  </label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#003566] hover:bg-[#001d3d] text-white font-semibold py-3 rounded-lg mt-4 transition-all"
              >
                {isLoading ? "Processing..." : isLoginMode ? t("login") : "Register Account"}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-6">
                {isLoginMode ? (
                  <>
                    {t("noAccount")}{" "}
                    <button 
                      type="button"
                      onClick={() => setIsLoginMode(false)}
                      className="text-[#003566] hover:underline font-bold"
                    >
                      {t("signupPartner")}
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button 
                      type="button"
                      onClick={() => setIsLoginMode(true)}
                      className="text-[#003566] hover:underline font-bold"
                    >
                      Sign In here
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}