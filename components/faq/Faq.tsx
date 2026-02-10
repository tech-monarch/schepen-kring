"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, X, Bot, Loader2, Minus, Sparkles, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  not_helpful: number;
  created_at: string;
  updated_at: string;
}

export default function Faq() {
  const t = useTranslations("Faq");
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [categoryList, setCategoryList] = useState<string[]>(["All"]);
  const [stats, setStats] = useState<any>(null);

  // AI States
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiAnswerData, setAiAnswerData] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [sessionId] = useState(`faq-session-${Math.random().toString(36).substr(2, 9)}`);

  // Fetch FAQs from Laravel API
  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await axios.get(`${API_BASE}/faqs?${params.toString()}`);
      
      // Handle both response structures
      const faqData = response.data.faqs?.data || response.data.faqs || [];
      setFaqs(faqData);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(faqData.map((faq: FaqItem) => faq.category)));
      setCategoryList(["All", ...uniqueCategories]);
      
      // Group by category for display
      const groupedCategories = uniqueCategories.map(category => ({
        name: category,
        items: faqData.filter((faq: FaqItem) => faq.category === category)
      }));
      setCategories(groupedCategories);
      
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/faqs/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchFAQs();
    fetchStats();
  }, [selectedCategory, searchQuery]);

  // Rate FAQ helpfulness
  const rateHelpful = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/faqs/${id}/rate-helpful`);
      toast.success("Thank you for your feedback!");
      fetchFAQs(); // Refresh to update counts
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  const rateNotHelpful = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/faqs/${id}/rate-not-helpful`);
      toast.success("Thank you for your feedback!");
      fetchFAQs();
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  // Ask AI using the new FAQ endpoint
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAiLoading(true);
    setShowAiPanel(true);
    setAiAnswer(null);
    setAiAnswerData(null);

    try {
      // Using the new FAQ-specific AI endpoint
      const response = await axios.post(`${API_BASE}/faqs/ask-gemini`, {
        question: searchQuery
      });

      setAiAnswer(response.data.answer);
      setAiAnswerData(response.data);
      toast.success("AI answered your question!");
      
      // Clear search after successful AI query
      setSearchQuery("");
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage = error.response?.data?.error || 
        "Our maritime intelligence system is currently undergoing maintenance. Please try again in a moment.";
      setAiAnswer(errorMessage);
      toast.error("Failed to get AI answer");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#003566] h-12 w-12 mb-4" />
        <p className="text-[10px] uppercase tracking-widest text-slate-400">
          Loading maritime knowledge...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-[#003566]">
      <Toaster position="top-right" />
      
      {/* --- HERO --- */}
      <section className="relative min-h-[40vh] md:h-[45vh] flex items-center justify-center overflow-hidden bg-[#001D3D] pt-16">
        <Image 
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073" 
          alt="Ocean" 
          fill 
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tight mb-3">
            Maritime Knowledge Hub
          </h1>
          <p className="text-blue-100/60 text-[10px] md:text-xs font-light uppercase tracking-[0.3em]">
            {stats?.total_faqs || 0} FAQs • AI-Powered Assistance
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-40">
        {/* --- STATS --- */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 -mt-8">
            <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">FAQs</p>
                  <p className="text-xl font-serif text-[#003566]">{stats.total_faqs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Sparkles className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Views</p>
                  <p className="text-xl font-serif text-[#003566]">{stats.total_views}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ThumbsUp className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Helpful</p>
                  <p className="text-xl font-serif text-[#003566]">{stats.total_helpful}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 shadow-sm rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <ThumbsDown className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Categories</p>
                  <p className="text-xl font-serif text-[#003566]">{stats.categories?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SEARCH / AI INPUT --- */}
        <div className="relative mb-16">
          <div className="bg-white shadow-2xl border border-slate-100 rounded-xl p-2">
            <div className="flex flex-col md:flex-row items-stretch md:items-center">
              <div className="flex items-center flex-1">
                <Search className="ml-4 text-slate-300 shrink-0" size={20} />
                <input 
                  className="w-full h-12 md:h-16 px-4 text-base md:text-lg font-medium outline-none placeholder:text-slate-400"
                  placeholder="Search FAQs or ask the AI anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                />
              </div>
              <button 
                onClick={handleAiSearch}
                disabled={isAiLoading}
                className="bg-[#003566] text-white px-6 h-12 md:h-16 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isAiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Sparkles size={14}/> Ask AI</>}
              </button>
            </div>
          </div>
        </div>

        {/* --- CATEGORY FILTERS --- */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categoryList.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === "All" ? "all" : category)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all rounded-full ${
                selectedCategory === (category === "All" ? "all" : category)
                  ? "bg-[#003566] text-white border-[#003566]"
                  : "bg-white text-slate-400 border-slate-200 hover:border-blue-400"
              }`}
            >
              {category}
            </button>
          ))}
          {(selectedCategory !== "all" || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* --- AI ANSWER PANEL --- */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-16 p-6 md:p-8 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-xl shadow-lg relative"
            >
              <button 
                onClick={() => setShowAiPanel(false)} 
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black">
                    Maritime AI Assistant
                  </p>
                  <p className="text-sm text-slate-600">
                    Powered by Gemini AI • Trained on {stats?.total_faqs || 0} FAQs
                  </p>
                </div>
              </div>
              
              {isAiLoading ? (
                <div className="flex items-center gap-3 text-slate-500 py-8">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="font-medium">Analyzing maritime database...</span>
                </div>
              ) : aiAnswer ? (
                <>
                  <div className="bg-white p-6 rounded-lg border border-slate-200 mb-4">
                    <p className="text-lg font-serif text-[#003566] mb-2">Question:</p>
                    <p className="text-slate-700 mb-4">{aiAnswerData?.question || searchQuery}</p>
                    
                    <p className="text-lg font-serif text-[#003566] mb-2">Answer:</p>
                    <p className="text-slate-700 whitespace-pre-wrap">{aiAnswer}</p>
                  </div>
                  
                  {aiAnswerData && (
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>
                        Sources: {aiAnswerData.sources || 0} FAQs • {aiAnswerData.timestamp ? new Date(aiAnswerData.timestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiAnswer);
                          toast.success("Answer copied to clipboard!");
                        }}
                        className="text-[10px] uppercase tracking-widest text-blue-600 hover:text-blue-700"
                      >
                        Copy answer
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FAQ LIST --- */}
        {faqs.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="mx-auto text-slate-300 h-16 w-16 mb-4" />
            <h3 className="text-xl font-serif text-slate-400 mb-2">No FAQs found</h3>
            <p className="text-slate-500">
              {searchQuery || selectedCategory !== "all" 
                ? "Try a different search or category" 
                : "No FAQs available yet"}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-[#003566] text-[10px] uppercase tracking-widest font-black"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.name} className="mb-12">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 pb-4 border-b border-slate-100">
                  {category.name} ({category.items.length})
                </h2>
                
                <div className="space-y-6">
                  {category.items.map((item: FaqItem) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => setExpandedItems(prev => ({
                          ...prev,
                          [item.id]: !prev[item.id]
                        }))}
                        className="w-full p-6 text-left flex justify-between items-start group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                              {item.category}
                            </span>
                            <span className="text-[8px] text-slate-400">
                              {item.views} views • {item.helpful} helpful
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                            {item.question}
                          </h3>
                        </div>
                        
                        <div className="ml-4 text-slate-400">
                          {expandedItems[item.id] ? (
                            <Minus size={24} className="text-blue-600" />
                          ) : (
                            <Plus size={24} className="text-slate-300 group-hover:text-blue-400" />
                          )}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedItems[item.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                              <div className="text-slate-700 mb-6 whitespace-pre-wrap leading-relaxed">
                                {item.answer}
                              </div>
                              
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => rateHelpful(item.id)}
                                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                                  >
                                    <ThumbsUp size={14} /> Helpful ({item.helpful})
                                  </button>
                                  <button
                                    onClick={() => rateNotHelpful(item.id)}
                                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-[10px] font-black uppercase tracking-widest"
                                  >
                                    <ThumbsDown size={14} /> Not Helpful ({item.not_helpful})
                                  </button>
                                </div>
                                
                                <p className="text-[8px] text-slate-400">
                                  Added {new Date(item.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- FOOTER --- */}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
            Need more help? Contact our maritime support team
          </p>
          <p className="text-sm text-slate-600 mt-2">
            support@schepen-kring.nl • +31 20 123 4567
          </p>
        </div>
      </main>
    </div>
  );
}