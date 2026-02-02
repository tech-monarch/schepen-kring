"use client";

import { Building2, Users, Briefcase, ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const AudienceCard = ({ icon: Icon, title, description, benefits, index }: {
  icon: any,
  title: string,
  description: string,
  benefits: string[],
  index: number
}) => {
  const t = useTranslations("AudienceSection");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      viewport={{ once: true }}
      // Increased border contrast and added a slight background shift
      className="group relative border-r border-b border-slate-200 last:border-r-0 md:border-b-0"
    >
      <div className="h-full bg-white p-10 lg:p-14 transition-all duration-700 group-hover:bg-slate-50">
        
        {/* Top Section: Icon & Identity */}
        <div className="flex items-start justify-between mb-16">
          <div className="w-16 h-16 rounded-sm border-2 border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:border-[#003566] group-hover:bg-[#003566]">
            <Icon className="w-6 h-6 text-[#003566] group-hover:text-white transition-colors" />
          </div>
          <span className="text-5xl font-serif italic text-slate-200 group-hover:text-blue-600/20 transition-colors select-none">
            0{index + 1}
          </span>
        </div>

        {/* Content Section */}
        <h3 className="text-3xl font-serif text-[#003566] mb-6 leading-tight group-hover:translate-x-2 transition-transform duration-500">
          {title}
        </h3>

        <p className="text-slate-600 text-[15px] leading-relaxed mb-12 font-light tracking-wide max-w-[300px]">
          {description}
        </p>

        {/* Benefits List with more defined separators */}
        <div className="space-y-0 mb-16 border-t border-slate-100">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-600 py-6">Exclusive Privileges</p>
          {benefits.map((benefit, benefitIndex) => (
            <div key={benefitIndex} className="flex items-center gap-4 py-4 border-b border-slate-50 group/item">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              <span className="text-[13px] text-slate-500 font-medium tracking-wide group-hover:text-[#003566] transition-colors">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Action - High Contrast Button */}
        <div className="pt-8 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#003566]">
            {t('learn_more')}
          </span>
          <div className="w-12 h-12 border border-slate-200 flex items-center justify-center group-hover:bg-[#003566] group-hover:border-[#003566] group-hover:text-white transition-all duration-500">
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function AudienceSection() {
  const t = useTranslations("AudienceSection");

  const audiences = [
    {
      icon: Building2,
      title: t('audiences.0.title'),
      description: t('audiences.0.description'),
      benefits: [t('audiences.0.benefits.0'), t('audiences.0.benefits.1'), t('audiences.0.benefits.2')],
    },
    {
      icon: Users,
      title: t('audiences.1.title'),
      description: t('audiences.1.description'),
      benefits: [t('audiences.1.benefits.0'), t('audiences.1.benefits.1'), t('audiences.1.benefits.2')],
    },
    {
      icon: Briefcase,
      title: t('audiences.2.title'),
      description: t('audiences.2.description'),
      benefits: [t('audiences.2.benefits.0'), t('audiences.2.benefits.1'), t('audiences.2.benefits.2')],
    },
  ];

  return (
    <section id="about" className="py-40 bg-[#F8FAFC] relative overflow-hidden">
      
      {/* Structural Accent Lines */}
      <div className="absolute top-0 left-1/4 w-[1px] h-full bg-slate-200/50 hidden lg:block" />
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-slate-200/50 hidden lg:block" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10"
        >
          <div>
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-[2px] bg-blue-600" />
              <span className="text-blue-600 text-[11px] font-black tracking-[0.5em] uppercase">
                {t('section_title')}
              </span>
            </div>
            <h2 className="text-6xl lg:text-9xl font-serif text-[#003566] tracking-tighter leading-[0.85]">
              The <span className="italic font-light text-slate-400">Maritime</span> <br />
              <span className="text-slate-800">Network</span>
            </h2>
          </div>
          
          <div className="max-w-xs pb-4 border-b-2 border-[#003566]">
            <p className="text-slate-500 text-sm leading-relaxed italic">
              Connecting global industry leaders with exclusive acquisition opportunities.
            </p>
          </div>
        </motion.div>

        {/* The Card Grid - Now with heavy border structure */}
        <div className="grid md:grid-cols-3 border-2 border-slate-200 shadow-2xl shadow-slate-200/50">
          {audiences.map((audience, index) => (
            <AudienceCard
              key={index}
              icon={audience.icon}
              title={audience.title}
              description={audience.description}
              benefits={audience.benefits}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}