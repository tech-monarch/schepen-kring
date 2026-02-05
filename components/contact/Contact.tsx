"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Anchor, Send, Ship, Zap, MapPin } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  const t = useTranslations("ContactPage");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Maritime Inquiry Received:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactItems = [
    { icon: Phone, label: t("contactInfo.phoneLabel"), value: t("contactInfo.phoneValue") },
    { icon: MapPin, label: t("contactInfo.locationLabel"), value: t("contactInfo.locationValue") },
    { icon: Mail, label: t("contactInfo.emailLabel"), value: t("contactInfo.emailValue") },
  ];

return (
    <div className="min-h-screen bg-[#F8F9FA]">
      
      {/* --- HERO SECTION: Clearance for navbar and reduced height --- */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070"
            alt="Maritime Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#003566]/95 via-[#003566]/70 to-transparent" />
        </div>
        
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-3 mb-4 md:mb-6"
          >
            <span className="w-8 md:w-10 h-[1px] bg-blue-400" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-blue-300">{t("contactBadge")}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tighter leading-[0.9]"
          >
            {t.rich("title", {
              span: (chunks) => <span className="italic font-light text-blue-200/60">{chunks}</span>
            })}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-base md:text-lg text-blue-50/70 font-light max-w-md leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </section>

      {/* --- MAIN CONTENT AREA: Adjusted overlap and padding --- */}
      <main className="max-w-7xl mx-auto px-6 -mt-16 md:-mt-24 pb-20 md:pb-32 relative z-20">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-10">
          
          {/* Inquiry Form */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white p-6 md:p-12 lg:p-16 shadow-xl border border-slate-100"
          >
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-serif text-[#003566] mb-2">Send an Inquiry</h2>
              <div className="h-1 w-10 bg-blue-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
              <div className="grid md:grid-cols-2 gap-6 md:gap-10">
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    {t("form.fullName")}
                  </label>
                  <input
                    name="name"
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border-b-2 border-slate-100 py-3 md:py-4 px-4 focus:border-[#003566] focus:bg-white outline-none transition-all font-serif text-base md:text-lg"
                  />
                </div>
                <div className="space-y-1 group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    {t("form.email")}
                  </label>
                  <input
                    name="email"
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full bg-slate-50 border-b-2 border-slate-100 py-3 md:py-4 px-4 focus:border-[#003566] focus:bg-white outline-none transition-all font-serif text-base md:text-lg"
                  />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  {t("form.message")}
                </label>
                <textarea
                  name="message"
                  rows={4}
                  onChange={handleChange}
                  placeholder="How can we assist you?"
                  className="w-full bg-slate-50 border-b-2 border-slate-100 py-3 md:py-4 px-4 focus:border-[#003566] focus:bg-white outline-none transition-all resize-none font-serif text-base md:text-lg"
                />
              </div>

              <Button className="h-14 md:h-16 px-10 md:px-12 bg-[#003566] hover:bg-blue-600 text-white rounded-none w-full md:w-auto font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-3">
                {t("form.submit")} <Send size={14} />
              </Button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 md:space-y-10">
            <div className="bg-white p-8 md:p-10 border border-slate-100 shadow-sm">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#003566] mb-6 md:mb-8">
                {t("contactInfo.title")}
              </h3>
              <div className="space-y-6 md:space-y-8">
                {contactItems.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 text-blue-600/40 shrink-0">
                      <item.icon size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase font-bold text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-[#003566] font-serif text-base md:text-lg break-all">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#001D3D] p-8 md:p-10 text-white relative overflow-hidden group">
              <Ship className="absolute bottom-[-10%] right-[-10%] w-24 h-24 md:w-32 md:h-32 text-white/5 transition-transform group-hover:scale-110" />
              <div className="relative z-10">
                <Zap size={20} className="text-blue-400 mb-4 md:mb-6" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 md:mb-4">{t("quickResponse.title")}</h4>
                <p className="text-xs md:text-sm text-blue-100/60 leading-relaxed font-light">
                  {t("quickResponse.description")}
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}