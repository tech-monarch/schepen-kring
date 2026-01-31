"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Briefcase, ArrowRight } from "lucide-react";
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
      className="group relative"
    >
      <div className="h-full bg-white/[0.02] border border-white/5 p-10 transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-[#c5a572]/40">
        
        {/* Top Section: Icon & Identity */}
        <div className="flex items-start justify-between mb-12">
          <div className="w-14 h-14 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-[#c5a572]">
            <Icon className="w-6 h-6 text-slate-400 group-hover:text-[#c5a572] transition-colors" />
          </div>
          <span className="text-[40px] font-serif italic text-white/5 group-hover:text-[#c5a572]/10 transition-colors select-none">
            0{index + 1}
          </span>
        </div>

        {/* Content Section */}
        <h3 className="text-3xl font-serif text-white mb-6 italic leading-tight group-hover:text-[#c5a572] transition-colors">
          {title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-10 font-light tracking-wide group-hover:text-slate-300">
          {description}
        </p>

        {/* Benefits List */}
        <div className="space-y-4 mb-12">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c5a572]/60 mb-4">Privileges</p>
          {benefits.map((benefit, benefitIndex) => (
            <div key={benefitIndex} className="flex items-center gap-4 group/item">
              <div className="w-1 h-1 bg-[#c5a572]/30 rounded-full group-hover:bg-[#c5a572] transition-colors" />
              <span className="text-xs text-slate-400 font-light tracking-wider group-hover:text-white transition-colors">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">
            {t('learn_more')}
          </span>
          <ArrowRight className="w-4 h-4 text-[#c5a572] group-hover:translate-x-2 transition-transform" />
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
      benefits: [
        t('audiences.0.benefits.0'),
        t('audiences.0.benefits.1'),
        t('audiences.0.benefits.2')
      ],
    },
    {
      icon: Users,
      title: t('audiences.1.title'),
      description: t('audiences.1.description'),
      benefits: [
        t('audiences.1.benefits.0'),
        t('audiences.1.benefits.1'),
        t('audiences.1.benefits.2')
      ],
    },
    {
      icon: Briefcase,
      title: t('audiences.2.title'),
      description: t('audiences.2.description'),
      benefits: [
        t('audiences.2.benefits.0'),
        t('audiences.2.benefits.1'),
        t('audiences.2.benefits.2')
      ],
    },
  ];

  return (
    <section id="about" className="py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#c5a572]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-[#c5a572]" />
            <span className="text-[#c5a572] text-[10px] font-bold tracking-[0.4em] uppercase">
              {t('section_title')}
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-serif text-white italic leading-[1.1]">
            Tailored for the <br />
            <span className="not-italic text-slate-600">Maritime Elite</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-0 border-l border-white/5">
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