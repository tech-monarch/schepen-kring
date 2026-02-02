"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Play, Compass } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import yachtImage from "./interior.jpg";

export function HeroSection() {
  const t = useTranslations("HeroSection");
  const router = useRouter();

  return (
    <section className="relative min-h-screen lg:min-h-[110vh] bg-[#f8fafc] text-[#003566] overflow-hidden flex items-center py-20 lg:py-0">
      {/* Background Ambient Glows - Soft Sea Tones */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-blue-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[50%] bg-slate-200/40 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 md:px-8 grid lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Left Content - The Editorial Column */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6 lg:mb-10"
          >
            <div className="w-8 lg:w-12 h-[1px] bg-[#003566]" />
            <span className="text-[#003566] uppercase tracking-[0.5em] text-[9px] lg:text-[10px] font-bold">
              {t("hero_badge")}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-[100px] font-serif leading-[1] lg:leading-[0.9] mb-6 lg:mb-8 tracking-tight"
          >
            {t("hero_title_1")}<br />
            <span className="italic text-blue-500/80 font-light drop-shadow-sm">{t("hero_title_2")}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-base lg:text-lg max-w-md leading-relaxed mb-8 lg:mb-12 font-light tracking-wide"
          >
            A seamless blend of AI-driven intelligence and exclusive human curation for the world&apos;s most prestigious vessels.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap gap-6 lg:gap-10 items-start sm:items-center"
          >
            <button 
              onClick={() => router.push('/signup')}
              className="group relative w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-[#003566] text-white font-sans font-bold text-[10px] lg:text-[11px] tracking-[0.25em] uppercase transition-all hover:bg-[#001d3d] shadow-2xl shadow-blue-900/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Explore Fleet <ArrowUpRight size={16} />
              </span>
            </button>

            <button className="flex items-center gap-4 group">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-[#003566] group-hover:border-[#003566] transition-all duration-500">
                <Play size={16} className="fill-[#003566] text-[#003566] group-hover:fill-white group-hover:text-white transition-colors ml-1" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 group-hover:text-[#003566] transition-colors">Virtual Tour</span>
            </button>
          </motion.div>
        </div>

        {/* Right Content - The Clean Nautical Gallery */}
        <div className="lg:col-span-6 relative h-[750px] hidden lg:block">
          {/* Main Top Image - Vibrant & Clear */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-[90%] h-[450px] overflow-hidden rounded-sm shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-8 border-white"
          >
            <Image 
              src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=1200" 
              alt="Luxury Yacht" 
              fill 
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
          </motion.div>

          {/* Floating Minimalist Stat Card */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[380px] left-[-20px] z-20 bg-white p-10 shadow-xl border border-slate-50 min-w-[280px]"
          >
            <Compass className="text-blue-500 mb-6" size={36} strokeWidth={1} />
            <h3 className="text-2xl font-serif italic mb-2 text-[#003566]">Premium Fleet</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold leading-loose">Global Verified Status</p>
          </motion.div>

          {/* Bottom Overlapping Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-5 right-0 w-[65%] h-[320px] overflow-hidden rounded-sm border-8 border-white shadow-2xl z-10"
          >
            <Image 
              src={yachtImage}
              alt="Interior Luxury" 
              fill 
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>

      {/* Vertical Scroll Indicator */}
      <div className="absolute bottom-12 left-12 hidden md:flex flex-col items-center gap-6">
          <div className="w-[1px] h-24 bg-gradient-to-t from-blue-500 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] rotate-180 [writing-mode:vertical-lr] text-slate-400">Scroll Down</span>
      </div>
    </section>
  );
}