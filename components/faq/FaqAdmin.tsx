"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  tags?: string[];
  viewCount?: number;
  is_active?: boolean;
  sort_order?: number;
};

type FAQFormData = {
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  tags: string[];
  is_active?: boolean;
  sort_order?: number;
  [key: string]: string | string[] | boolean | number | undefined;
};

const API_BASE = "https://api.answer24.nl";

const groupFAQs = (faqs: FAQItem[] | any) => {
  if (!Array.isArray(faqs)) return {};
  const grouped: Record<string, Record<string, FAQItem[]>> = {};
  faqs.forEach((faq) => {
    const cat = faq.category || "General";
    const sub = faq.subcategory || "General";
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][sub]) grouped[cat][sub] = [];
    grouped[cat][sub].push(faq);
  });
  return grouped;
};

export default function FaqAdmin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    category: "General",
    subcategory: "General",
    tags: [],
  });

  // ---------------- Fetch FAQs ----------------
  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/faqs`);
      const data = await res.json();

      // Extract the inner data array and map to FAQItem
      const items: FAQItem[] = Array.isArray(data?.data?.data)
        ? data.data.data.map((f: any) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            category: f.categories?.[0] || "General",
            subcategory: f.subcategories?.[0] || "General",
            tags: f.tags || [],
            viewCount: f.view_count,
            is_active: f.status === "approved",
            sort_order: f.sort_order,
          }))
        : [];

      setFaqs(items);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
      toast.error("Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- CRUD ----------------
  const createFaq = async (faq: FAQFormData) => {
    const res = await fetch(`${API_BASE}/api/v1/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
    return res.json();
  };

  const updateFaq = async (id: string, faq: FAQFormData) => {
    const res = await fetch(`${API_BASE}/api/v1/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faq),
    });
    return res.json();
  };

  const deleteFaq = async (id: string) => {
    await fetch(`${API_BASE}/api/v1/faqs/${id}`, { method: "DELETE" });
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const groupedFAQs = useMemo(() => groupFAQs(faqs), [faqs]);

  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const lower = searchTerm.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lower) ||
        faq.answer.toLowerCase().includes(lower) ||
        (faq.tags || []).some((tag) => tag.toLowerCase().includes(lower))
    );
  }, [faqs, searchTerm]);

  const toggleItem = (id: string) =>
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const tag = e.currentTarget.value.trim();
      if (!formData.tags.includes(tag))
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tag: string) =>
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));

  const openEditPanel = (faq: FAQItem) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      subcategory: faq.subcategory,
      tags: faq.tags || [],
    });
    setEditingFaq(faq);
    setIsPanelOpen(true);
  };

  const openCreatePanel = () => {
    setFormData({ question: "", answer: "", category: "General", subcategory: "General", tags: [] });
    setEditingFaq(null);
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        const updated = await updateFaq(editingFaq.id, formData);
        setFaqs((prev) =>
          prev.map((f) => (f.id === editingFaq.id ? updated.data : f))
        );
        toast.success("FAQ updated successfully");
      } else {
        const created = await createFaq(formData);
        setFaqs((prev) => [created.data, ...prev]);
        toast.success("FAQ created successfully");
      }
      setIsPanelOpen(false);
      setEditingFaq(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async () => {
    if (!editingFaq) return;
    try {
      await deleteFaq(editingFaq.id);
      setFaqs((prev) => prev.filter((f) => f.id !== editingFaq.id));
      setIsDeleteDialogOpen(false);
      setEditingFaq(null);
      toast.success("FAQ deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FAQ Management</h1>
          <p className="text-muted-foreground">Manage your FAQs</p>
        </div>
        <Button onClick={openCreatePanel} className="gap-2">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search FAQs..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FAQ List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="text-center p-12 border-dashed border rounded-lg">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">
            No FAQs found. Create a new FAQ to get started.
          </p>
          <Button className="mt-4" onClick={openCreatePanel}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </div>
      ) : (
        Object.entries(groupedFAQs).map(([category, subcategories]) => (
          <div key={category} className="mb-6">
            <button
              className="flex justify-between w-full text-left"
              onClick={() => toggleCategory(category)}
            >
              <h2 className="text-lg font-semibold">{category}</h2>
              {expandedCategories[category] ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedCategories[category] &&
              Object.entries(subcategories).map(([sub, items]) => (
                <div key={sub} className="pl-4 mt-2">
                  <h3 className="font-medium text-muted-foreground">{sub}</h3>
                  {items.map((faq) => (
                    <div
                      key={faq.id}
                      className="group relative rounded-lg border p-4 mt-2 hover:bg-accent/20"
                    >
                      <button
                        className="text-left w-full"
                        onClick={() => toggleItem(faq.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span>{faq.question}</span>
                          <span className="text-sm text-muted-foreground">
                            ({faq.viewCount || 0} views)
                          </span>
                        </div>
                        {expandedItems[faq.id] && (
                          <div className="mt-2 text-sm">
                            {faq.answer}
                            {faq.tags?.length && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {faq.tags.map((tag) => (
                                  <Badge key={tag}>{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </button>

                      <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditPanel(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setEditingFaq(faq);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ))
      )}

      {/* AlertDialog for delete */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Panel for create/edit */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-end">
          <form
            className="bg-white w-96 p-6 overflow-y-auto"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold mb-4">
              {editingFaq ? "Edit FAQ" : "Add FAQ"}
            </h2>
            <Input
              name="question"
              placeholder="Question"
              value={formData.question}
              onChange={handleInputChange}
              className="mb-3"
              required
            />
            <Textarea
              name="answer"
              placeholder="Answer"
              value={formData.answer}
              onChange={handleInputChange}
              className="mb-3"
              required
            />
            <Input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleInputChange}
              className="mb-3"
            />
            <Input
              name="subcategory"
              placeholder="Subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="mb-3"
            />
            <Input
              placeholder="Add tag and press enter"
              onKeyDown={handleTagInput}
              className="mb-2"
            />
            <div className="flex flex-wrap gap-1 mb-3">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} <X className="inline h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={() => setIsPanelOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingFaq ? "Update" : "Create"}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
