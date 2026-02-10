// app/faq/page.js or pages/faq.js
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MessageSquare, HelpCircle, ThumbsUp, ThumbsDown, Filter, BookOpen, Bot, RefreshCw, ChevronDown, ChevronUp, Plus, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

const API_BASE = "https://schepen-kring.nl/api";

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "General" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchFaqs();
    fetchStats();
    checkAdminStatus();
  }, [selectedCategory, searchQuery]);

  const checkAdminStatus = () => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsed = JSON.parse(userData);
      setIsAdmin(parsed.role === "Admin" || parsed.userType === "Admin");
    }
  };

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await axios.get(`${API_BASE}/faqs?${params.toString()}`);
      setFaqs(response.data.faqs.data || response.data.faqs);
      setCategories(response.data.categories || ["General", "Booking", "Technical", "Payment"]);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/faqs/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const askGemini = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/faqs/ask-gemini`, {
        question: aiQuery
      });
      
      setAiAnswer({
        question: aiQuery,
        answer: response.data.answer,
        sources: response.data.sources,
        timestamp: response.data.timestamp
      });
      
      setAiQuery("");
      toast.success("AI answered your question!");
    } catch (error) {
      console.error("Error asking Gemini:", error);
      toast.error("Failed to get AI answer");
    } finally {
      setAiLoading(false);
    }
  };

  const rateHelpful = async (id) => {
    try {
      await axios.post(`${API_BASE}/faqs/${id}/rate-helpful`);
      fetchFaqs(); // Refresh to update counts
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Error rating:", error);
    }
  };

  const rateNotHelpful = async (id) => {
    try {
      await axios.post(`${API_BASE}/faqs/${id}/rate-not-helpful`);
      fetchFaqs();
      toast.success("Thanks for your feedback!");
    } catch (error) {
      console.error("Error rating:", error);
    }
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_BASE}/faqs`, newFaq, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("FAQ added successfully!");
      setNewFaq({ question: "", answer: "", category: "General" });
      setShowAddForm(false);
      fetchFaqs();
      fetchStats();
    } catch (error) {
      toast.error("Failed to add FAQ");
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      await axios.delete(`${API_BASE}/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("FAQ deleted!");
      fetchFaqs();
      fetchStats();
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const trainGemini = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_BASE}/faqs/train-gemini`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Gemini AI trained with latest FAQs!");
    } catch (error) {
      toast.error("Failed to train AI");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#003566]">
              Maritime Knowledge Hub
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
              Powered by Gemini AI • {stats?.total_faqs || 0} FAQs Available
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex gap-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-emerald-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={14} /> Add FAQ
              </button>
              <button
                onClick={trainGemini}
                className="bg-purple-600 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <RefreshCw size={14} /> Train AI
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-6 border border-slate-200">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Total FAQs</p>
              <p className="text-3xl font-serif text-[#003566] mt-2">{stats.total_faqs}</p>
            </div>
            <div className="bg-white p-6 border border-slate-200">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Total Views</p>
              <p className="text-3xl font-serif text-[#003566] mt-2">{stats.total_views}</p>
            </div>
            <div className="bg-white p-6 border border-slate-200">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Helpful Votes</p>
              <p className="text-3xl font-serif text-[#003566] mt-2">{stats.total_helpful}</p>
            </div>
            <div className="bg-white p-6 border border-slate-200">
              <p className="text-[8px] uppercase tracking-widest text-slate-400 font-black">Categories</p>
              <p className="text-3xl font-serif text-[#003566] mt-2">{stats.categories?.length || 0}</p>
            </div>
          </div>
        )}

        {/* AI Chat Section */}
        <div className="bg-white border border-slate-200 p-8 mb-10 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#003566]">Ask Maritime AI Assistant</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                Trained on {stats?.total_faqs || 0} FAQs
              </p>
            </div>
          </div>
          
          <form onSubmit={askGemini} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask anything about yachts, bookings, or maritime services..."
                className="w-full border-2 border-slate-200 p-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-400 pr-32"
                disabled={aiLoading}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="absolute right-2 top-2 bg-[#003566] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {aiLoading ? "Thinking..." : "Ask AI"}
              </button>
            </div>
          </form>
          
          {/* AI Answer */}
          {aiAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-600 font-black">AI Answer</p>
                  <p className="text-sm text-slate-700 mt-2 font-medium">{aiAnswer.question}</p>
                </div>
                <p className="text-[8px] text-slate-400">{aiAnswer.timestamp}</p>
              </div>
              <div className="bg-white p-4 border border-slate-100">
                <p className="text-slate-700 whitespace-pre-wrap">{aiAnswer.answer}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-[8px] text-slate-400">
                  Sources: {aiAnswer.sources} FAQs • Gemini Pro
                </p>
                <button
                  onClick={() => setAiAnswer(null)}
                  className="text-[8px] uppercase tracking-widest text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Add FAQ Form (Admin only) */}
        <AnimatePresence>
          {showAddForm && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-200 p-8 mb-10 overflow-hidden"
            >
              <h3 className="text-xl font-serif text-[#003566] mb-6">Add New FAQ</h3>
              <form onSubmit={handleAddFaq} className="space-y-6">
                <div>
                  <label className="text-[8px] uppercase tracking-widest text-slate-400 font-black block mb-2">
                    Question
                  </label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                    className="w-full border-b border-slate-200 py-3 text-sm outline-none focus:border-blue-400"
                    placeholder="Enter question..."
                    required
                  />
                </div>
                
                <div>
                  <label className="text-[8px] uppercase tracking-widest text-slate-400 font-black block mb-2">
                    Answer
                  </label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    className="w-full border border-slate-200 p-4 text-sm outline-none focus:border-blue-400 min-h-[150px]"
                    placeholder="Enter detailed answer..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[8px] uppercase tracking-widest text-slate-400 font-black block mb-2">
                      Category
                    </label>
                    <select
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                      className="w-full border-b border-slate-200 py-3 text-sm outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end gap-4">
                    <button
                      type="submit"
                      className="bg-[#003566] text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                      Add FAQ
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH FAQs..."
              className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-400"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${
                selectedCategory === "all"
                  ? "bg-[#003566] text-white border-[#003566]"
                  : "bg-white text-slate-400 border-slate-200 hover:border-blue-400"
              }`}
            >
              All Categories
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-slate-400 border-slate-200 hover:border-blue-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003566] mx-auto"></div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-4">Loading Maritime Knowledge...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200">
            <HelpCircle className="mx-auto text-slate-300" size={48} />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-4">No FAQs found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-slate-200 hover:border-blue-200 transition-all"
              >
                <div
                  className="p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-widest px-3 py-1">
                        {faq.category}
                      </span>
                      <span className="text-[8px] text-slate-400">
                        {faq.views} views • {faq.helpful || 0} helpful
                      </span>
                    </div>
                    <h3 className="text-lg font-serif text-[#003566]">{faq.question}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this FAQ?")) handleDeleteFaq(faq.id);
                          }}
                          className="text-red-400 hover:text-red-600"
                          title="Delete FAQ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                    {expandedId === faq.id ? (
                      <ChevronUp className="text-slate-400" />
                    ) : (
                      <ChevronDown className="text-slate-400" />
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                        <div className="prose max-w-none text-slate-700 mb-6">
                          {faq.answer.split('\n').map((line, i) => (
                            <p key={i} className="mb-3">{line}</p>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                            <button
                              onClick={() => rateHelpful(faq.id)}
                              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                            >
                              <ThumbsUp size={14} /> Helpful ({faq.helpful || 0})
                            </button>
                            <button
                              onClick={() => rateNotHelpful(faq.id)}
                              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-[10px] font-black uppercase tracking-widest"
                            >
                              <ThumbsDown size={14} /> Not Helpful ({faq.not_helpful || 0})
                            </button>
                          </div>
                          
                          <p className="text-[8px] text-slate-400">
                            Added {new Date(faq.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-20 pt-10 border-t border-slate-200 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
            Need more help? Contact our maritime support team
          </p>
          <p className="text-sm text-slate-600 mt-2">
            support@schepen-kring.nl • +31 20 123 4567
          </p>
        </div>
      </div>
    </div>
  );
}