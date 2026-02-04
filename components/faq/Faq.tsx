"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, X, Bot, Loader2, Minus, Sparkles } from "lucide-react";
import { getFAQs } from "@/app/[locale]/actions/faq";
import { api } from "@/lib/api"; // Using your central API utility
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Faq() {
  const t = useTranslations("Faq");
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // AI States
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [sessionId] = useState(`faq-session-${Math.random().toString(36).substr(2, 9)}`);

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
          if (!categoriesMap.has(catName)) categoriesMap.set(catName, { name: catName, items: [] });
          categoriesMap.get(catName).items.push(item);
        });
        setCategories(Array.from(categoriesMap.values()));
      } finally { setIsLoading(false); }
    };
    fetchFAQs();
  }, [t]);

  // NEW: Updated to use your /ai/chat endpoint
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiAnswer(null);

    try {
      // Calling your new Laravel Controller endpoint
      const response = await api.post("/ai/chat", {
        message: searchQuery,
        session_id: sessionId,
        history: JSON.stringify([]) // You can pass chat history here if needed
      });

      // Getting the 'reply' field from your GeminiController
      setAiAnswer(response.data.reply);
    } catch (e) { 
      setAiAnswer("Our maritime intelligence system is currently undergoing maintenance. Please try again in a moment."); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#003566]" /></div>;

  return (
    <div className="bg-white min-h-screen text-[#003566]">
      
      {/* --- HERO --- */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-[#001D3D]">
        <Image 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073" 
          alt="Ocean" fill className="object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-4">How can we help?</h1>
          <p className="text-blue-100/60 text-lg font-light uppercase tracking-[0.3em]">Support & Intelligence</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 pb-40">
        
        {/* --- SEARCH / AI INPUT --- */}
        <div className="relative -mt-8 z-20 mb-24">
          <div className="bg-white shadow-2xl border border-slate-100 flex items-center p-2">
            <Search className="ml-6 text-slate-300" />
            <input 
              className="w-full h-16 px-6 text-xl font-serif outline-none"
              placeholder="Search or ask anything about our fleet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
            />
            <button 
              onClick={handleAiSearch}
              disabled={isAiLoading}
              className="bg-[#003566] text-white px-8 h-16 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:bg-slate-400"
            >
              {isAiLoading ? <Loader2 className="animate-spin" /> : <><Sparkles size={14}/> Ask AI</>}
            </button>
          </div>
        </div>

        {/* --- AI ANSWER PANEL --- */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mb-20 p-10 bg-slate-50 border-l-4 border-[#003566] relative shadow-inner"
            >
              <button onClick={() => setShowAiPanel(false)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><X size={20} /></button>
              <div className="flex items-center gap-2 mb-6 text-[#003566] uppercase text-[10px] font-black tracking-widest">
                <Bot size={16} /> Kring Schepen Intelligence
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-3 text-slate-400 font-serif italic">
                    <Loader2 className="animate-spin" size={18} /> Reviewing vessel logs...
                </div>
              ) : (
                <p className="text-2xl font-serif leading-relaxed italic text-[#003566]">
                    "{aiAnswer}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FAQ CATEGORIES --- */}
        {categories.map((cat, i) => (
          <div key={i} className="mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 border-b border-slate-100 pb-4">
              {cat.name}
            </h2>
            <div className="divide-y divide-slate-100">
              {cat.items.map((item: any, j: number) => (
                <div key={j} className="py-6">
                  <button 
                    onClick={() => setExpandedItems(p => ({ ...p, [item.id]: !p[item.id] }))}
                    className="w-full flex justify-between items-center text-left group"
                  >
                    <span className="text-xl md:text-2xl font-serif group-hover:text-blue-600 transition-colors">
                      {item.question}
                    </span>
                    {expandedItems[item.id] ? <Minus size={20} className="text-blue-600" /> : <Plus size={20} className="text-slate-300" />}
                  </button>
                  <AnimatePresence>
                    {expandedItems[item.id] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        className="overflow-hidden"
                      >
                        <p className="pt-6 text-lg text-slate-500 leading-relaxed max-w-2xl font-light">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}