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
      className="group relative min-w-[320px] md:min-w-[420px] flex-shrink-0"
    >
      <div className="h-[500px] border border-slate-100 bg-white p-12 flex flex-col justify-between transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,53,102,0.12)] group-hover:-translate-y-2 relative overflow-hidden">
        
        <Icon className="absolute -right-12 -bottom-12 w-64 h-64 text-slate-50 group-hover:text-blue-50/50 transition-all duration-1000 rotate-12" />

        <div className="relative z-10">
          <div className="w-14 h-14 mb-12 flex items-center justify-center bg-slate-50 group-hover:bg-[#003566] transition-colors duration-500 rounded-sm">
            <Icon className="w-6 h-6 text-[#003566] group-hover:text-white transition-colors" />
          </div>
          
          <span className="text-[10px] text-blue-500 font-sans font-bold tracking-[0.4em] uppercase mb-6 block">
            Excellence 0{index + 1}
          </span>
          
          <h3 className="text-4xl font-serif text-[#003566] mb-8 italic leading-tight">
            {title}
          </h3>
          
          <p className="text-slate-500 text-[15px] leading-relaxed max-w-[300px] font-light tracking-wide group-hover:text-slate-700 transition-colors">
            {description}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-slate-400 group-hover:text-[#003566] transition-colors">
          View Detail <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
    <section id="features" className="relative py-40 bg-[#F1F5F9] overflow-hidden">
      
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="max-w-[1500px] mx-auto px-8 relative z-10">
        
        <div className="grid lg:grid-cols-12 gap-16 items-center mb-32">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-12 h-[1px] bg-blue-600" />
              <span className="text-blue-600 text-[10px] font-sans font-bold tracking-[0.5em] uppercase">
                {t("section_title")}
              </span>
            </div>
            <h2 className="text-6xl lg:text-[100px] font-serif text-[#003566] leading-[0.85] tracking-tighter mb-12">
              {t("heading.line1")}<br />
              <span className="italic font-light text-slate-300">{t("heading.line2")}</span>
            </h2>

            <div className="flex gap-5">
              <button 
                onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                className="w-14 h-14 border border-slate-200 flex items-center justify-center hover:bg-[#003566] hover:text-white transition-all rounded-full bg-white shadow-sm"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => scrollToIndex(Math.min(features.length - 1, currentIndex + 1))}
                className="w-14 h-14 border border-slate-200 flex items-center justify-center hover:bg-[#003566] hover:text-white transition-all rounded-full bg-white shadow-sm"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          {/* New Yacht Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block lg:col-span-5 relative h-[550px]"
          >
            <div className="absolute inset-0 z-10 border-[12px] border-white shadow-2xl rounded-sm overflow-hidden bg-slate-200">
              <img 
                src="https://th.bing.com/th/id/R.9ab8b08a7fccb3f09d6bc26199c969c9?rik=wIaHhYwwzjkaYw&pid=ImgRaw&r=0" 
                alt="Luxury Yacht"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
            {/* Decorative Shadow Frame */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-slate-300/50 -z-10 rounded-sm" />
          </motion.div>
        </div>

        {/* Gallery Slider */}
        <div className="relative">
          <div
            className="flex overflow-x-auto gap-10 pb-20 no-scrollbar snap-x snap-mandatory"
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

          <div className="max-w-xs mx-auto h-[1.5px] bg-slate-200 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-[#003566]"
              animate={{ width: `${((currentIndex + 1) / features.length) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}