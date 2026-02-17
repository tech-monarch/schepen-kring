"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Anchor, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SellerRegistrationPage() {
  const params = useParams();
  const token = params?.id as string; // token from URL
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await api.post("/register/seller", {
        ...form,
        token: token,
      });

      const { token: authToken, user } = response.data;

      // Store auth token and user data
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("user_data", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => router.push("/nl/dashboard/partner"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="relative flex flex-col lg:flex-row w-full max-w-6xl min-h-[700px] bg-white shadow-xl border border-slate-100 overflow-hidden">
        {/* Left panel - branding */}
        <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-16 bg-[#003566] text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1605281317010-fe5ffe798156?q=80&w=2000"
              alt="Maritime"
              fill
              className="object-cover grayscale"
            />
            <div className="absolute inset-0 bg-[#003566]/80" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
              <div className="p-2 bg-white/10 rounded-sm">
                <Anchor className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-[11px] font-black tracking-[0.4em] uppercase text-blue-200">
                Seller Onboarding
              </span>
            </div>
            <h2 className="text-6xl font-serif leading-[1.1] text-white">
              Join as a <br />
              <span className="italic font-light text-blue-300">Seller</span>
            </h2>
            <p className="text-blue-100/60 mt-8 font-light tracking-wide text-sm max-w-xs leading-relaxed">
              Register to start listing and managing your vessels.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold">
            <Anchor className="w-4 h-4" />
            Partner Portal
          </div>
        </div>

        {/* Right panel - registration form */}
        <div className="lg:w-7/12 p-8 lg:p-24 flex flex-col justify-center bg-white">
          <div className="mb-12">
            <h1 className="text-[12px] uppercase tracking-[0.5em] text-slate-400 font-black mb-4">
              Create Seller Account
            </h1>
            <div className="h-1 w-12 bg-[#003566]" />
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold"
                >
                  ERROR: {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#003566] font-black block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border-b-2 border-slate-100 px-4 py-4 text-[#003566] focus:border-[#003566] focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#003566] font-black block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border-b-2 border-slate-100 px-4 py-4 text-[#003566] focus:border-[#003566] focus:bg-white outline-none transition-all text-sm font-medium"
                  placeholder="seller@example.com"
                />
              </div>

              <div className="relative">
                <label className="text-[10px] uppercase tracking-[0.3em] text-[#003566] font-black block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-slate-50 border-b-2 border-slate-100 px-4 py-4 text-[#003566] focus:border-[#003566] focus:bg-white outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003566] hover:bg-blue-700 text-white font-black py-8 rounded-none uppercase tracking-[0.5em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10"
            >
              {isLoading ? "Registering..." : "Complete Registration"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <div className="text-center pt-8 border-t border-slate-50">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300 font-bold">
                Already have an account? <Link href="/login" className="text-blue-600 underline">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}