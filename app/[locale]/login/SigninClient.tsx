"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { authAPI, tokenUtils } from "@/utils/auth";
import { useRouter } from "@/i18n/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

type SuccessResponse = {
  id: any;
  mainId: any;
  uuid: any;
  name: any;
  email: any;
  phone: any;
  userType: any;
  token: any;
};

type ErrorResponse = {
  status: string;
  message: any;
  email: any;
  uuid: any;
};

export default function EmployeeSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = useTranslations("SignInPage");
  const router = useRouter();

  async function handleSignInSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response: SuccessResponse | ErrorResponse = await authAPI.login(
        email,
        password,
        rememberMe
      );

      if ("status" in response) {
        throw new Error(response.message || "Authentication failed.");
      }

      if (response.token) {
        tokenUtils.setToken(response.token);
      } else {
        throw new Error("Access token missing.");
      }

      const userData = {
        id: response.id,
        mainId: response.mainId,
        uuid: response.uuid,
        name: response.name,
        email: response.email,
        phone: response.phone,
        userType: response.userType,
      };

      if (userData.email) {
        tokenUtils.setUser(userData);
      } else {
        throw new Error("Profile synchronization error.");
      }

      setSuccess("Employee verified. Synchronizing terminal...");

      const isPWA = window.matchMedia("(display-mode: standalone)").matches;
      const redirectDelay = isPWA ? 200 : 800;

      setTimeout(() => {
        router.push("/dashboard");
      }, redirectDelay);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 pt-32 pb-20">
        <div className="relative flex flex-col lg:flex-row w-full max-w-6xl min-h-[750px] bg-[#0d0d0d] border border-white/5 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          
          {/* Left Panel */}
          <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-white/5">
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1605281317010-fe5ffe798156?q=80&w=2000&auto=format&fit=crop"
                alt="NauticSell Heritage"
                fill
                className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0d0d0d] via-transparent to-[#0d0d0d]/40" />
            </div>

            <div className="relative z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-12"
              >
                <div className="h-px w-8 bg-[#c5a572]" />
                <span className="text-[10px] font-serif tracking-[0.4em] uppercase text-[#c5a572]">
                  Internal Network
                </span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-6xl font-serif leading-[1.1] max-w-md text-white italic"
              >
                Employee Portal
              </motion.h2>
              <p className="text-gray-400 mt-6 font-light tracking-widest text-xs uppercase max-w-xs leading-loose">
                Restricted access for authorized personnel and fleet administrators.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.4em] text-[#c5a572] font-bold"
            >
              <ShieldCheck className="w-4 h-4" />
              Secure Maritime Terminal 2.0
            </motion.div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center bg-[#0d0d0d]">
            <div className="mb-10">
              <h1 className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold mb-3 italic">
                Employee Sign In
              </h1>
              <div className="h-px w-16 bg-[#c5a572]" />
            </div>

            <form className="space-y-8" onSubmit={handleSignInSubmit}>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-red-950/20 border-l-2 border-red-500 text-red-200 text-[10px] tracking-widest uppercase font-bold"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-4 bg-green-950/20 border-l-2 border-green-500 text-green-200 text-[10px] tracking-widest uppercase font-bold"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#c5a572] font-black">Corporate Email</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:border-[#c5a572] outline-none transition-all placeholder:text-gray-800 text-sm"
                    placeholder="name@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-[#c5a572] font-black">Security Pin</label>
                  <div className="relative">
                    <input
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:border-[#c5a572] outline-none transition-all placeholder:text-gray-800 text-sm"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute right-0 top-3 w-4 h-4 text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                <label className="flex items-center gap-3 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors">
                  <input
                    type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 appearance-none border border-white/20 rounded-none bg-transparent checked:bg-[#c5a572] checked:border-[#c5a572] transition-all cursor-pointer"
                  />
                  Encrypted Session
                </label>
                <Link href="/forgot-password" className="text-[#c5a572] hover:text-white transition-colors font-bold">
                  Recover Access
                </Link>
              </div>

              <Button
                type="submit" disabled={isLoading}
                className="w-full bg-[#c5a572] hover:bg-[#d4b98c] text-black font-black py-8 rounded-none uppercase tracking-[0.4em] text-[10px] transition-all flex items-center justify-center gap-3 group relative"
              >
                {isLoading ? "Verifying..." : "Authorize Access"}
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
              </Button>

              <div className="text-center pt-10">
                <p className="text-[9px] uppercase tracking-[0.5em] text-gray-700 leading-relaxed">
                  Unauthorized access attempts are logged <br/> and reported to fleet security.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}