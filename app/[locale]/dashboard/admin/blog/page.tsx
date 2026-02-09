"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Search,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string | null;
  status: "draft" | "published";
  views: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const router = useRouter();

  const API_BASE = "https://schepen-kring.nl/api";
  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      Accept: "application/json",
    },
  });

  const fetchBlogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: pagination.per_page.toString(),
        });

        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const res = await axios.get(
          `${API_BASE}/blogs?${params}`,
          getHeaders(),
        );
        setBlogs(res.data.data);
        setPagination(res.data.meta);
      } catch (err) {
        toast.error("Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, statusFilter, pagination.per_page],
  );

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${API_BASE}/blogs/${id}`, getHeaders());
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  const handleStatusChange = async (
    blog: Blog,
    newStatus: "draft" | "published",
  ) => {
    try {
      await axios.put(
        `${API_BASE}/blogs/${blog.id}`,
        { status: newStatus },
        getHeaders(),
      );
      toast.success(
        `Blog ${newStatus === "published" ? "published" : "moved to drafts"}`,
      );
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to update blog status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">
            Blog Command
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
            Content Publishing & Management
          </p>
        </div>
        <Link href="/nl/dashboard/admin/blog/create">
          <Button className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8 h-12">
            <Plus className="mr-2 w-4 h-4" /> New Article
          </Button>
        </Link>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH ARTICLES..."
              className="bg-white border border-slate-200 pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchBlogs()}
            />
          </div>

          <select
            className="bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">ALL STATUS</option>
            <option value="draft">DRAFTS</option>
            <option value="published">PUBLISHED</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>
            Showing {blogs.length} of {pagination.total} articles
          </span>
        </div>
      </div>

      {/* BLOG LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {loading ? (
          <div className="col-span-2 flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-slate-200" size={48} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="col-span-2 text-center py-20">
            <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No blogs found
            </p>
            <p className="text-[8px] text-slate-300 mt-2">
              {searchQuery
                ? "Try a different search term"
                : "Create your first blog post"}
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {blog.featured_image && (
                  <div className="lg:w-1/3">
                    <div className="w-full h-48 overflow-hidden bg-slate-50 border border-slate-200">
                      <img
                        src={`${API_BASE}/storage/${blog.featured_image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}

                <div className={blog.featured_image ? "lg:w-2/3" : "w-full"}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-serif italic text-[#003566] mb-2 line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(blog.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {blog.author || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={12} />
                          {blog.views} views
                        </span>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 text-[8px] font-black uppercase tracking-widest",
                        blog.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700",
                      )}
                    >
                      {blog.status.toUpperCase()}
                    </div>
                  </div>

                  {blog.excerpt && (
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                    <Link href={`/dashboard/admin/blog/${blog.id}/edit`}>
                      <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600">
                        <Edit size={14} /> Edit
                      </button>
                    </Link>

                    <button
                      onClick={() =>
                        handleStatusChange(
                          blog,
                          blog.status === "published" ? "draft" : "published",
                        )
                      }
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-600"
                    >
                      {blog.status === "published" ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                      {blog.status === "published" ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {pagination.last_page > 1 && (
        <div className="flex justify-center items-center gap-4 py-8">
          <Button
            onClick={() => fetchBlogs(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
            variant="outline"
          >
            <ChevronLeft size={14} /> Prev
          </Button>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page {pagination.current_page} of {pagination.last_page}
          </div>

          <Button
            onClick={() => fetchBlogs(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
            variant="outline"
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
