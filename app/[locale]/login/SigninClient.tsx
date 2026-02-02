"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
// Import your api instance for direct calls
import { api } from "@/lib/api";
import { useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock, Fingerprint } from "lucide-react";

export default function EmployeeSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = useTranslations("SignInPage");
  const router = useRouter();

  async function handleSignInSubmit(
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // 1. Direct API call to your Laravel Backend
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      // 2. Map Laravel UserController response to your variables
      const { token, id, name, userType, email: userEmail } = response.data;

      if (token) {
        // 3. Direct Storage for MVP
        localStorage.setItem("auth_token", token);

        // Save user details for immediate UI use
        const userData = {
          id,
          name,
          email: userEmail,
          userType,
        };
        localStorage.setItem("user_data", JSON.stringify(userData));

        // 4. Inject token into current session headers
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setSuccess("Identity Verified. Synchronizing Terminal...");

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        throw new Error("Terminal denied access: Token missing.");
      }
    } catch (err: any) {
      // Catch Laravel 401/422 errors or connection issues
      const errorMessage =
        err.response?.data?.message || "Invalid credentials.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <div className="relative flex flex-col lg:flex-row w-full max-w-6xl min-h-[700px] bg-white shadow-[0_40px_100px_-20px_rgba(0,53,102,0.1)] border border-slate-100 overflow-hidden">
          {/* Left Panel: The Branding Side */}
          <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-16 bg-[#003566] text-white">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <Image
                src="https://images.unsplash.com/photo-1605281317010-fe5ffe798156?q=80&w=2000"
                alt="Maritime Heritage"
                fill
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-[#003566]/80" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-20"
              >
                <div className="p-2 bg-white/10 rounded-sm">
                  <Fingerprint className="w-5 h-5 text-blue-300" />
                </div>
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-blue-200">
                  Secure Access
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-serif leading-[1.1] text-white"
              >
                Employee <br />
                <span className="italic font-light text-blue-300">
                  Terminal
                </span>
              </motion.h2>
              <p className="text-blue-100/60 mt-8 font-light tracking-wide text-sm max-w-xs leading-relaxed">
                Enter your corporate credentials to manage fleet operations and
                secure maritime data.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold"
            >
              <ShieldCheck className="w-4 h-4" />
              Fleet OS v2.0
            </motion.div>
          </div>

          {/* Right Panel: The Form Side */}
          <div className="lg:w-7/12 p-8 lg:p-24 flex flex-col justify-center bg-white">
            <div className="mb-12">
              <h1 className="text-[12px] uppercase tracking-[0.5em] text-slate-400 font-black mb-4">
                Identity Authorization
              </h1>
              <div className="h-1 w-12 bg-[#003566]" />
            </div>

            <form className="space-y-10" onSubmit={handleSignInSubmit}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-tight"
                  >
                    AUTH_ERROR: {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-tight"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                <div className="relative group">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#003566] font-black block mb-2">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-b-2 border-slate-100 px-4 py-4 text-[#003566] focus:border-[#003566] focus:bg-white outline-none transition-all text-sm font-medium"
                    placeholder="e.g. captain@schepen-kring.nl"
                  />
                </div>

                <div className="relative group">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#003566] font-black block mb-2">
                    Security Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-b-2 border-slate-100 px-4 py-4 text-[#003566] focus:border-[#003566] focus:bg-white outline-none transition-all text-sm font-medium"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute right-4 top-4 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer text-slate-400 hover:text-[#003566] transition-colors group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border-2 border-slate-200 rounded-none bg-white checked:bg-[#003566] transition-all cursor-pointer"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Remember Terminal
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest"
                >
                  Reset Credentials
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#003566] hover:bg-blue-700 text-white font-black py-8 rounded-none uppercase tracking-[0.5em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10"
              >
                {isLoading ? "Validating..." : "Authorize Login"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <div className="text-center pt-8 border-t border-slate-50">
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300 font-bold leading-relaxed">
                  System strictly monitored by <br /> Global Maritime Security
                  Protocols
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
