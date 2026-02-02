"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Tag,
  X,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Database,
  Save,
  Layers,
  Activity,
  Globe,
  MessageSquare,
  Info,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const API_BASE = "https://kring.answer24.nl/api/v1";

interface KnowledgeItem {
  id: number;
  type: string;
  payload: any;
  created_at?: string;
}

export default function KnowledgeBaseManager() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

  // Form State: Geen JSON meer, gewoon platte tekst
  const [formData, setFormData] = useState({ type: "informatie", content: "" });

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/knowledge`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error("Fout bij laden van kennisbank");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: KnowledgeItem | null = null) => {
    if (item) {
      setEditingItem(item);
      // Haal de tekst uit de 'content' key of pak de hele payload als string
      const textContent = item.payload.content || JSON.stringify(item.payload);
      setFormData({
        type: item.type,
        content: textContent,
      });
    } else {
      setEditingItem(null);
      setFormData({ type: "informatie", content: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_BASE}/knowledge/${editingItem.id}`
        : `${API_BASE}/knowledge`;
      const method = editingItem ? "PUT" : "POST";

      // We sturen de tekst simpelweg door als 'content'
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          content: formData.content,
        }),
      });

      if (res.ok) {
        toast.success(
          editingItem ? "Kennis bijgewerkt!" : "Kennis toegevoegd!",
        );
        setIsModalOpen(false);
        fetchKnowledge();
      }
    } catch (error) {
      toast.error("Actie mislukt");
    }
  };

  const deleteItem = async (id: number) => {
    if (
      !confirm(
        "Weet je zeker dat je deze informatie wilt verwijderen? De AI kan dit hierna niet meer gebruiken.",
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE}/knowledge/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast.info("Informatie verwijderd");
      }
    } catch (error) {
      toast.error("Verwijderen mislukt");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(item.payload)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      <DashboardHeader />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* --- ACTIE BALK --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
              <Database className="text-blue-600" /> AI Brein Configuratie
            </h1>
            <p className="text-slate-500 text-sm">
              Beheer van {items.length} actuele kennispunten voor
              GratisGenieten.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Zoek in kennis..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-blue-200"
            >
              <Plus size={18} /> Nieuwe Kennis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* --- STATISTIEKEN --- */}
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            {[
              {
                label: "Actieve Punten",
                val: items.length,
                icon: Layers,
                color: "text-blue-600",
              },
              {
                label: "Systeem Status",
                val: "Optimaal",
                icon: Activity,
                color: "text-emerald-500",
              },
              {
                label: "Connectie",
                val: "v1/knowledge",
                icon: Globe,
                color: "text-slate-400",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-lg font-black">{stat.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- HOOFD TABEL --- */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">
                        Categorie
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">
                        Inhoud
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase text-right">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading
                      ? [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={3} className="px-6 py-4">
                              <div className="h-10 bg-slate-100 rounded-lg w-full" />
                            </td>
                          </tr>
                        ))
                      : filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4 align-top w-40">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase border border-blue-100">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">
                                {item.payload.content ||
                                  JSON.stringify(item.payload)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* --- ZIJBALK: INFO --- */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold text-sm">
                <MessageSquare size={18} />
                Hoe werkt dit?
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Alles wat je hier toevoegt wordt direct door de AI gelezen.
                Gebruik duidelijke zinnen zoals:
                <br />
                <br />
                <i className="text-slate-400">
                  "De kortingscode voor januari is HAPPY20."
                </i>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="font-black text-lg">
                    {editingItem ? "Kennis Bewerken" : "Nieuwe Kennis"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                      Categorie (bijv: faq, promo, info)
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      required
                      placeholder="bijv. openingstijden"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                      Inhoud / Informatie
                    </label>
                    <textarea
                      className="w-full mt-1 h-48 px-4 py-4 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm leading-relaxed"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                      placeholder="Typ hier de informatie die de AI moet weten..."
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <Save size={18} /> Opslaan in Brein
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
