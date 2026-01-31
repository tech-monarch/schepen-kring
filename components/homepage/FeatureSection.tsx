"use client";

import { useState, useRef } from "react";
import { 
  Compass, 
  ShieldCheck, 
  Anchor, 
  Waves, 
  Zap, 
  Bell,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative min-w-[320px] md:min-w-[400px] flex-shrink-0"
    >
      {/* The "Swiss" Frame */}
      <div className="h-[450px] border border-white/5 bg-[#0f0f0f] p-10 flex flex-col justify-between transition-all duration-500 group-hover:border-[#c5a572]/30 relative overflow-hidden">
        
        {/* Subtle Background Icon on Hover */}
        <Icon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/[0.02] group-hover:text-[#c5a572]/[0.05] transition-all duration-700 rotate-12" />

        <div>
          <div className="w-12 h-12 mb-10 flex items-center justify-center border border-white/10 group-hover:border-[#c5a572] transition-colors duration-500">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#c5a572] transition-colors" />
          </div>
          
          <span className="text-[10px] text-[#c5a572] font-bold tracking-[0.3em] uppercase mb-4 block">
            Phase 0{index + 1}
          </span>
          
          <h3 className="text-3xl font-serif text-white mb-6 italic leading-tight group-hover:text-[#c5a572] transition-colors">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] font-light tracking-wide group-hover:text-slate-300 transition-colors">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 group-hover:text-white transition-colors">
          Discovery <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export function FeaturesSection() {
  const t = useTranslations("FeatureSection");
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToIndex = (index: number) => {
    if (cardRefs.current[index]) {
      cardRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      setCurrentIndex(index);
    }
  };

  const features = [
    { icon: Compass, title: t("features.0.title"), description: t("features.0.description") },
    { icon: ShieldCheck, title: t("features.1.title"), description: t("features.1.description") },
    { icon: Anchor, title: t("features.2.title"), description: t("features.2.description") },
    { icon: Waves, title: t("features.3.title"), description: t("features.3.description") },
    { icon: Zap, title: t("features.4.title"), description: t("features.4.description") },
    { icon: Bell, title: t("features.5.title"), description: t("features.5.description") },
  ];

  return (
    <section id="features" className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Section Title Vertical */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden xl:block">
        <span className="text-[120px] font-serif font-black text-white/[0.02] select-none uppercase rotate-90 origin-left">
          Excellence
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-8 h-[1px] bg-[#c5a572]" />
              <span className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase">
                {t("section_title")}
              </span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-serif text-white italic leading-tight">
              {t("heading.line1")}<br />
              <span className="not-italic text-slate-600">{t("heading.line2")}</span>
            </h2>
          </motion.div>

          {/* Minimalist Controls */}
          <div className="flex gap-4">
            <button 
              onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
              className="w-14 h-14 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scrollToIndex(Math.min(features.length - 1, currentIndex + 1))}
              className="w-14 h-14 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Horizontal Gallery */}
        <div className="relative">
          <div
            className="flex overflow-x-auto gap-8 pb-12 no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => { if (el) cardRefs.current[index] = el; }}
                className="snap-center"
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Sleek Progress Line */}
          <div className="w-full h-[1px] bg-white/5 relative mt-10">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#c5a572]"
              animate={{ width: `${((currentIndex + 1) / features.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}