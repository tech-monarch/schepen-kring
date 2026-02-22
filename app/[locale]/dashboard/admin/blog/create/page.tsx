"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Save,
  X,
  Image as ImageIcon,
  Globe,
  Lock,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    status: "draft" as "draft" | "published",
    featured_image: null as File | null,
  });

  const API_BASE = "https://schepen-kring.nl/api";

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      "Content-Type": "multipart/form-data",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("author", formData.author);
      formDataToSend.append("status", formData.status);

      if (formData.featured_image) {
        formDataToSend.append("featured_image", formData.featured_image);
      }

      await axios.post(`${API_BASE}/blogs`, formDataToSend, getHeaders());

      toast.success("Blog created successfully");
      router.push("/dashboard/admin/blog");
    } catch (err: any) {
      console.error("Error creating blog:", err);
      toast.error(err.response?.data?.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, featured_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <Toaster position="top-right" />
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <div>
          <Link
            href="/nl/dashboard/admin/blog"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 mb-4"
          >
            <ArrowLeft size={14} /> BACK TO BLOGS
          </Link>
          <h1 className="text-4xl font-serif italic text-[#003566]">
            Create New Article
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
            Craft & Publish New Content
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TITLE */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            TITLE *
          </label>
          <input
            required
            className="w-full border-b-2 border-slate-200 py-4 text-lg font-bold uppercase outline-none focus:border-blue-400 transition-colors"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="ENTER ARTICLE TITLE"
          />
        </div>

        {/* AUTHOR */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            AUTHOR (OPTIONAL)
          </label>
          <input
            className="w-full border-b-2 border-slate-200 py-4 text-[10px] font-bold uppercase outline-none focus:border-blue-400 transition-colors"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            placeholder="AUTHOR NAME"
          />
        </div>

        {/* EXCERPT */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            EXCERPT (SHORT DESCRIPTION)
          </label>
          <textarea
            rows={3}
            className="w-full border-2 border-slate-200 p-4 text-[10px] font-bold uppercase outline-none focus:border-blue-400 transition-colors resize-none"
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            placeholder="BRIEF DESCRIPTION OF THE ARTICLE"
          />
        </div>

        {/* FEATURED IMAGE */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            FEATURED IMAGE
          </label>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 px-6 py-4 border-2 border-slate-200 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all group">
              <Upload
                size={16}
                className="text-slate-400 group-hover:text-blue-400"
              />
              {imagePreview ? "CHANGE IMAGE" : "UPLOAD FEATURED IMAGE"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {imagePreview && (
              <div className="relative w-full max-w-md">
                <div className="border-2 border-slate-200 p-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, featured_image: null });
                  }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            CONTENT *
          </label>
          <textarea
            required
            rows={20}
            className="w-full border-2 border-slate-200 p-6 text-sm font-normal outline-none focus:border-blue-400 transition-colors resize-none font-sans"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Write your article content here..."
          />
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
            Use plain text or basic HTML tags for formatting
          </p>
        </div>

        {/* PUBLICATION STATUS */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            PUBLICATION STATUS
          </label>
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "draft" })}
              className={cn(
                "flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 text-[10px] font-black uppercase tracking-widest transition-all h-32",
                formData.status === "draft"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50",
              )}
            >
              <Lock size={24} />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "published" })}
              className={cn(
                "flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 text-[10px] font-black uppercase tracking-widest transition-all h-32",
                formData.status === "published"
                  ? "bg-green-50 text-green-700 border-green-300"
                  : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50",
              )}
            >
              <Globe size={24} />
              Publish Now
            </button>
          </div>

          <div
            className={cn(
              "px-6 py-4 border-2 text-[10px] font-black uppercase tracking-widest max-w-md",
              formData.status === "published"
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-blue-50 text-blue-700 border-blue-300",
            )}
          >
            CURRENT STATUS: {formData.status.toUpperCase()}
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex gap-6 pt-10 border-t border-slate-100">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#003566] text-white rounded-none h-16 uppercase text-[10px] tracking-widest font-black text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                PUBLISHING...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save size={20} />
                {formData.status === "published"
                  ? "PUBLISH ARTICLE"
                  : "SAVE AS DRAFT"}
              </span>
            )}
          </Button>

          <Link href="/nl/dashboard/admin/blog" className="flex-1">
            <Button
              type="button"
              className="w-full bg-slate-100 text-slate-600 rounded-none h-16 uppercase text-[10px] tracking-widest font-black text-lg"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
