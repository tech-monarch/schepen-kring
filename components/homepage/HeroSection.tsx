"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Play, Compass } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const t = useTranslations("HeroSection");
  const router = useRouter();

  return (
    <section className="relative min-h-screen bg-[#0a0a0a] text-[#e5e5e5] overflow-hidden flex items-center">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-[#c5a572]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />

      <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-4 relative z-10">
        
        {/* Left Content - The Editorial Column */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-10"
          >
            <div className="w-12 h-[1px] bg-[#c5a572]" />
            <span className="text-[#c5a572] uppercase tracking-[0.4em] text-[10px] font-bold">
              {t("hero_badge")}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-serif leading-[0.85] mb-8"
          >
            {t("hero_title_1")}<br />
            <span className="italic text-[#c5a572] font-light">{t("hero_title_2")}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg max-w-md leading-relaxed mb-12 font-light tracking-wide"
          >
            A seamless blend of AI-driven intelligence and exclusive human curation for the world's most prestigious vessels.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-8 items-center"
          >
            <button 
              onClick={() => router.push('/signup')}
              className="group relative px-8 py-4 bg-[#c5a572] text-black font-bold text-sm tracking-widest uppercase transition-all hover:bg-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Fleet <ArrowUpRight size={18} />
              </span>
            </button>

            <button className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#c5a572] transition-colors">
                <Play size={16} className="fill-white group-hover:fill-[#c5a572]" />
              </div>
              <span className="text-xs font-bold tracking-[0.2em] uppercase">Virtual Tour</span>
            </button>
          </motion.div>
        </div>

        {/* Right Content - The Asymmetric Gallery */}
        <div className="lg:col-span-6 relative h-[700px] hidden lg:block">
          {/* Main Top Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="absolute top-0 right-0 w-[85%] h-[400px] overflow-hidden rounded-sm border border-white/5 shadow-2xl"
          >
            <Image 
              src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=1200" 
              alt="Yacht" 
              fill 
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>

          {/* Floating Glass Stat Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[350px] left-0 z-20 bg-white/5 backdrop-blur-xl border border-white/10 p-8 w-64"
          >
            <Compass className="text-[#c5a572] mb-4" size={32} />
            <h3 className="text-xl font-serif italic mb-1">Verified</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global Fleet Status</p>
          </motion.div>

          {/* Bottom Overlapping Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute bottom-0 right-10 w-[70%] h-[300px] overflow-hidden rounded-sm border border-white/10 shadow-2xl z-10"
          >
            <Image 
              src="https://images.unsplash.com/photo-1540946484627-2ee544ad333c?q=80&w=1000" 
              alt="Interior" 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[#0a0a0a]/20" />
          </motion.div>
        </div>
      </div>

      {/* Vertical Scroll Indicator */}
      <div className="absolute bottom-10 left-10 hidden md:flex flex-col items-center gap-4">
         <div className="w-[1px] h-20 bg-gradient-to-t from-[#c5a572] to-transparent" />
         <span className="text-[9px] uppercase tracking-[0.5em] rotate-90 origin-left mt-10 whitespace-nowrap text-slate-500">Scroll to Explore</span>
      </div>
    </section>
  );
}