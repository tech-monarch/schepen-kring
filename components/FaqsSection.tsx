"use client";

import { useEffect, useState } from "react";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  viewCount?: number;
};

export function FaqsSection() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("https://kring.answer24.nl/api/v1/faqs", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch FAQs (status: ${response.status})`);
        }

        const data = await response.json();

        // Map API response to FAQItem[]
        const items: FAQItem[] = Array.isArray(data?.data?.data)
          ? data.data.data.map((f: any) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
              category: f.categories?.[0] || "General",
              subcategory: f.subcategories?.[0] || "General",
              tags: f.tags || [],
              viewCount: f.view_count,
            }))
          : [];

        setFaqs(items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  if (loading)
    return (
      <div className="border-2 border-slate-200 rounded-2xl bg-white/80 p-6 text-center">
        <p className="text-slate-500">Loading FAQs...</p>
      </div>
    );

  if (error)
    return (
      <div className="border-2 border-red-200 rounded-2xl bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">Error loading FAQs: {error}</p>
      </div>
    );

  if (!faqs.length)
    return (
      <div className="border-2 border-slate-200 rounded-2xl bg-white/80 p-6 text-center">
        <p className="text-slate-500">No FAQs available.</p>
      </div>
    );

  return (
    <div className="border-2 border-slate-200 rounded-2xl bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-medium text-slate-800">
          Frequently Asked Questions
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {faqs.map((faq) => (
          <details key={faq.id} className="group">
            <summary className="p-6 cursor-pointer font-medium text-slate-700 hover:text-blue-600 flex justify-between items-center">
              {faq.question}
              <span className="transition-transform duration-200 group-open:rotate-180 text-slate-400">
                ▼
              </span>
            </summary>
            <div className="px-6 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
