"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Anchor, Send, MessageCircle, Ship } from "lucide-react";

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
    // Simulate a luxury brokerage inquiry
    console.log("Maritime Inquiry Received:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactItems = [
    {
      icon: Phone,
      label: t("contactInfo.phoneLabel"),
      value: t("contactInfo.phoneValue"),
    },
    {
      icon: Anchor,
      label: t("contactInfo.locationLabel"),
      value: t("contactInfo.locationValue"),
    },
    {
      icon: Mail,
      label: t("contactInfo.emailLabel"),
      value: t("contactInfo.emailValue"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* --- HERO SECTION: DEEP MARITIME DARK THEME --- */}
      <section className="relative pt-40 pb-32 md:pt-56 md:pb-48 bg-[#050505] text-white overflow-hidden border-b border-white/5">
        {/* Animated Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#c5a572]/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <div className="container mx-auto max-w-5xl px-6 relative z-10 text-center">
          {/* Glassmorphic Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 mb-10 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-none shadow-2xl"
          >
            <div className="w-1.5 h-1.5 bg-[#c5a572] rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gray-300 font-semibold">
              {t("contactBadge")}
            </span>
          </motion.div>

          {/* Headline - Using Serif for Luxury */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-8xl font-serif mb-8 tracking-tight leading-[1.1]"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {t("subtitle")}
          </motion.p>

          {/* Decorative Scroll Line */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col items-center gap-4 mt-8"
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Inquiry Form</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#c5a572] to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* --- MAIN CONTENT: THE INQUIRY SUITE --- */}
      <section className="py-24 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Contact Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7"
            >
              <Card className="shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-none rounded-none bg-white">
                <CardContent className="p-8 md:p-12">
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-2 relative">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#c5a572]">
                          {t("form.fullName")}
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Johnathan Drake"
                          className="w-full bg-transparent border-b border-gray-200 py-4 focus:border-[#c5a572] outline-none transition-colors rounded-none placeholder:text-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#c5a572]">
                          {t("form.email")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="captain@nautic.com"
                          className="w-full bg-transparent border-b border-gray-200 py-4 focus:border-[#c5a572] outline-none transition-colors rounded-none placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#c5a572]">
                        {t("form.company")}
                      </label>
                      <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Organization (Optional)"
                        className="w-full bg-transparent border-b border-gray-200 py-4 focus:border-[#c5a572] outline-none transition-colors rounded-none placeholder:text-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#c5a572]">
                        {t("form.message")}
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Vessel requirements or specific yacht name..."
                        className="w-full bg-transparent border-b border-gray-200 py-4 focus:border-[#c5a572] outline-none transition-colors resize-none rounded-none placeholder:text-gray-300"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#0a0a0a] hover:bg-[#c5a572] hover:text-black text-white py-8 rounded-none uppercase tracking-[0.3em] text-xs transition-all duration-500 flex items-center justify-center gap-3 group"
                    >
                      {t("form.submit")}
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar: Office & Intelligence */}
            <div className="lg:col-span-5 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div>
                  <h3 className="text-xs uppercase tracking-[0.4em] text-[#c5a572] font-bold mb-10">
                    {t("contactInfo.title")}
                  </h3>

                  <div className="space-y-10">
                    {contactItems.map((item, index) => (
                      <div key={index} className="flex gap-6 items-start group">
                        <div className="w-12 h-12 bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#c5a572] transition-all shadow-sm">
                          <item.icon className="w-5 h-5 text-gray-400 group-hover:text-[#c5a572] transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            {item.label}
                          </p>
                          <p className="text-gray-900 font-medium text-lg leading-tight">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Response Card */}
                <div className="pt-8">
                  <div className="bg-[#0a0a0a] text-white p-10 relative overflow-hidden group">
                    {/* Background Icon Watermark */}
                    <Ship className="absolute top-[-20%] right-[-10%] w-40 h-40 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-700" />
                    
                    <div className="relative z-10">
                      <h4 className="text-xs uppercase tracking-[0.3em] text-[#c5a572] mb-6">
                        {t("quickResponse.title")}
                      </h4>
                      <p className="text-sm text-gray-400 leading-loose font-light">
                        {t("quickResponse.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}