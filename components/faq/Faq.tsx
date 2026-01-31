"use client";
import React, { useState, useEffect } from "react";
import { 
  Search, ChevronDown, HelpCircle, X, Bot, Sparkles, Loader2, Zap, ArrowRight 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getFAQs } from "@/app/[locale]/actions/faq";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function Faq() {
  const t = useTranslations("Faq");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await getFAQs();
        const faqItems = data.flatMap((entry: any) => 
          entry.question ? entry : (entry.subcategories?.flatMap((sub: any) => sub.items || []) || [])
        );
        
        const categoriesMap = new Map();
        faqItems.forEach((item: any) => {
          const catName = item.categories?.[0] || t("generalCategory");
          const catId = catName.toLowerCase().replace(/ /g, "-");
          if (!categoriesMap.has(catId)) {
            categoriesMap.set(catId, {
              id: catId, name: catName, icon: HelpCircle, subcategories: []
            });
          }
          const cat = categoriesMap.get(catId)!;
          const subName = item.subcategories?.[0] || t("generalCategory");
          let sub = cat.subcategories.find((s: any) => s.name === subName);
          if (!sub) { cat.subcategories.push(sub = { id: subName, name: subName, items: [] }); }
          sub.items.push(item);
        });
        setCategories(Array.from(categoriesMap.values()));
      } finally { setIsLoading(false); }
    };
    fetchFAQs();
  }, [t]);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiAnswer(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: t("aiSystemPrompt", { data: JSON.stringify(categories) })
      });

      const result = await model.generateContent(searchQuery);
      setAiAnswer(result.response.text());
    } catch (error) {
      setAiAnswer(t("aiError"));
    } finally { setIsAiLoading(false); }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="h-10 w-10 text-[#c5a572] animate-spin" />
    </div>
  );

  return (
    <div className="w-full bg-[#0a0a0a] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1 border border-[#c5a572]/30 rounded-full mb-8">
          <Zap size={14} className="text-[#c5a572] fill-[#c5a572]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a572]">{t("badge")}</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-6">
          {t.rich("title", {
            span: (chunks) => <span className="text-slate-500 not-italic">{chunks}</span>
          })}
        </h1>
        <p className="text-slate-400 text-lg font-light tracking-wide">{t("subtitle")}</p>
      </div>

      <div className="max-w-3xl mx-auto mb-24">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c5a572] transition-colors" />
          <Input
            className="w-full h-20 pl-16 pr-44 bg-white/5 border-white/10 rounded-none text-xl text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-[#c5a572]"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
          />
          <Button onClick={handleAiSearch} disabled={!searchQuery.trim() || isAiLoading} className="absolute right-2 top-2 h-16 px-8 bg-[#c5a572] hover:bg-white text-black rounded-none font-bold uppercase tracking-widest text-xs">
            {isAiLoading ? <Loader2 className="animate-spin" /> : <>{t("askButton")} <Sparkles className="ml-2 w-4 h-4" /></>}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showAiPanel && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-3xl mx-auto mb-20 relative">
            <div className="bg-[#111] border border-[#c5a572]/20 p-10">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowAiPanel(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-[#c5a572] flex items-center justify-center"><Bot size={20} className="text-black" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a572]">{t("aiBadge")}</p>
                  <p className="text-white font-serif italic">{t("aiName")}</p>
                </div>
              </div>
              {isAiLoading ? (
                <div className="py-10 flex flex-col items-center gap-4">
                  <div className="h-[1px] w-20 bg-[#c5a572] animate-pulse" />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t("aiLoading")}</p>
                </div>
              ) : (
                <p className="text-2xl text-slate-200 font-light leading-relaxed mb-8">{aiAnswer}</p>
              )}
              <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase tracking-[0.4em] pt-8 border-t border-white/5">
                <Zap size={10} /> {t("slogan")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="border border-white/5 bg-white/[0.02]">
            <button onClick={() => setExpandedCategories(p => ({ ...p, [category.id]: !p[category.id] }))} className="w-full flex items-center justify-between p-8 text-left">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 border border-white/10 flex items-center justify-center text-[#c5a572]"><category.icon size={24} /></div>
                <div>
                  <h2 className="text-xl font-serif text-white">{category.name}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                    {t("protocolCount", { count: category.subcategories.reduce((c: any, s: any) => c + s.items.length, 0) })}
                  </p>
                </div>
              </div>
              <ChevronDown className={cn("text-slate-600 transition-transform", expandedCategories[category.id] && "rotate-180")} />
            </button>
            <AnimatePresence>
              {expandedCategories[category.id] && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-8 pb-8 border-t border-white/5 pt-4">
                    {category.subcategories.flatMap((s: any) => s.items).map((item: any) => (
                      <div key={item.id} className="border-b border-white/5 last:border-0">
                        <button onClick={() => setExpandedItems(p => ({ ...p, [item.id]: !p[item.id] }))} className="w-full py-5 flex justify-between items-center group">
                          <span className="text-slate-400 group-hover:text-[#c5a572] transition-colors text-lg font-light">{item.question}</span>
                          <ArrowRight size={16} className={cn("text-slate-700 transition-all", expandedItems[item.id] && "rotate-90 text-[#c5a572]")} />
                        </button>
                        {expandedItems[item.id] && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-6 text-slate-500 font-light">{item.answer}</motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}