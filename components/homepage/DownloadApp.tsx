"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Download, X, ShieldCheck, AppWindow, ArrowRight } from "lucide-react";

// Assuming yacht.webp is in the same folder
import yachtImage from "./yacht.jpg";

const SectionDownloadApp = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    setShouldRender(!standalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const t = useTranslations("DownloadApp");

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowModal(false);
      setDeferredPrompt(null);
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#003566]/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 p-12 text-center shadow-2xl rounded-sm"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-[#003566]">
                <X size={24} />
              </button>
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AppWindow className="text-[#003566]" size={28} />
              </div>
              <h2 className="text-2xl font-serif text-[#003566] mb-3">{t("modal_title")}</h2>
              <p className="text-slate-500 text-sm font-light mb-8">{t("modal_subtitle")}</p>
              <div className="space-y-3">
                <button onClick={handleInstallClick} disabled={!deferredPrompt} className="w-full py-4 bg-[#003566] text-white font-bold text-[10px] tracking-widest uppercase hover:bg-blue-700 disabled:opacity-20 transition-all">
                  {t("install_button")}
                </button>
                <button onClick={() => setShowModal(false)} className="w-full py-4 border border-slate-200 text-[#003566] font-bold text-[10px] tracking-widest uppercase hover:bg-slate-50 transition-all">
                  {t("later_button")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative py-32 lg:py-48 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* LEFT SIDE: CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-4 mb-8">
                <span className="h-[1px] w-12 bg-blue-600" />
                <span className="text-blue-600 text-[11px] font-black tracking-[0.4em] uppercase">{t("section_title")}</span>
              </div>

              <h2 className="text-6xl lg:text-[90px] font-serif text-[#003566] leading-[0.9] tracking-tighter mb-10">
                The Fleet <br />
                <span className="italic font-light text-slate-300">In Your Pocket</span>
              </h2>

              <p className="text-lg text-slate-500 font-light leading-relaxed mb-12 max-w-md">
                {t("section_subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-between gap-8 px-8 py-5 bg-[#003566] text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10 group"
                >
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Download for</p>
                    <p className="text-xs font-bold uppercase">iOS App Store</p>
                  </div>
                  <Smartphone size={20} className="group-hover:rotate-12 transition-transform" />
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center justify-between gap-8 px-8 py-5 border border-slate-200 text-[#003566] hover:border-blue-600 transition-all group"
                >
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Download for</p>
                    <p className="text-xs font-bold uppercase">Android Play</p>
                  </div>
                  <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={18} className="text-blue-600" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Secure Cloud Infrastructure</span>
              </div>
            </motion.div>

            {/* RIGHT SIDE: IMAGE WITH AESTHETIC FRAME */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              {/* Decorative background element */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-slate-50 rounded-full -z-10" />
              
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-2xl rounded-sm border-[12px] border-white">
                <Image
                  src={yachtImage}
                  alt="Luxury Yacht"
                  fill
                  placeholder="blur"
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>

              {/* Floating Stat Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-white p-6 shadow-xl border border-slate-100 hidden md:block"
              >
                <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase mb-2">Live Status</p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-serif italic text-[#003566]">Fleet sync active</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

export default SectionDownloadApp;