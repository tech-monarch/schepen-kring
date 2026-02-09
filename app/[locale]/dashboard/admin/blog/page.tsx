"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Calendar, User,
  Search, Loader2, Image as ImageIcon, X, Check,
  ChevronLeft, ChevronRight, Filter, FileText,
  BarChart3, Upload, Save, Globe, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string | null;
  status: 'draft' | 'published';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    status: "draft" as "draft" | "published",
    featured_image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const API_BASE = "https://schepen-kring.nl/api";
  const getHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`, 
      Accept: "application/json",
      'Content-Type': 'multipart/form-data',
    },
  });

  const fetchBlogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        sort: sortField,
        order: sortOrder,
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await axios.get(`${API_BASE}/blogs?${params}`, getHeaders());
      setBlogs(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, sortField, sortOrder, pagination.per_page]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('status', formData.status);
      if (formData.featured_image) {
        formDataToSend.append('featured_image', formData.featured_image);
      }

      if (selectedBlog) {
        // Update existing blog
        await axios.post(
          `${API_BASE}/blogs/${selectedBlog.id}?_method=PUT`,
          formDataToSend,
          getHeaders()
        );
        toast.success("Blog updated successfully");
      } else {
        // Create new blog
        await axios.post(`${API_BASE}/blogs`, formDataToSend, getHeaders());
        toast.success("Blog created successfully");
      }

      setIsModalOpen(false);
      resetForm();
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save blog");
    }
  };

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

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || "",
      content: blog.content,
      author: blog.author || "",
      status: blog.status,
      featured_image: null,
    });
    setImagePreview(blog.featured_image ? `${API_BASE}/storage/${blog.featured_image}` : null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, featured_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setSelectedBlog(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      status: "draft",
      featured_image: null,
    });
    setImagePreview(null);
  };

  const handleStatusChange = async (blog: Blog, newStatus: 'draft' | 'published') => {
    try {
      await axios.put(
        `${API_BASE}/blogs/${blog.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}`, Accept: "application/json" } }
      );
      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to update blog status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-serif italic text-[#003566]">Blog Command</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black mt-2">
            Content Publishing & Management
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8 h-12"
        >
          <Plus className="mr-2 w-4 h-4" /> New Article
        </Button>
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
              onKeyPress={(e) => e.key === 'Enter' && fetchBlogs()}
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

          <select
            className="bg-white border border-slate-200 px-4 py-3 text-[10px] font-bold tracking-widest uppercase outline-none focus:border-blue-400"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="created_at">SORT BY DATE</option>
            <option value="title">SORT BY TITLE</option>
            <option value="views">SORT BY VIEWS</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Showing {blogs.length} of {pagination.total} articles</span>
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
              {searchQuery ? "Try a different search term" : "Create your first blog post"}
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
                    <div className={cn(
                      "px-3 py-1 text-[8px] font-black uppercase tracking-widest",
                      blog.status === 'published'
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}>
                      {blog.status.toUpperCase()}
                    </div>
                  </div>

                  {blog.excerpt && (
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange(
                        blog,
                        blog.status === 'published' ? 'draft' : 'published'
                      )}
                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-600"
                    >
                      {blog.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm("Delete this blog permanently?")) {
                          handleDelete(blog.id);
                        }
                      }}
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

      {/* BLOG EDITOR MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl p-8 shadow-2xl relative z-10 border border-slate-200 rounded-none max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <h2 className="text-2xl font-serif italic text-[#003566]">
                  {selectedBlog ? "Edit Article" : "Create New Article"}
                </h2>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">
                  {selectedBlog ? "Update your blog post" : "Craft a new blog post"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Title *
                    </label>
                    <input
                      required
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="ENTER ARTICLE TITLE"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Author
                    </label>
                    <input
                      className="w-full border-b border-slate-200 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-400"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="AUTHOR NAME (OPTIONAL)"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Excerpt (Short Description)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-slate-200 p-3 text-[10px] font-bold uppercase outline-none focus:border-blue-400 resize-none"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="BRIEF DESCRIPTION OF THE ARTICLE"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all">
                      <ImageIcon size={14} />
                      {imagePreview ? "CHANGE IMAGE" : "UPLOAD IMAGE"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    
                    {imagePreview && (
                      <div className="relative w-32 h-32 border border-slate-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, featured_image: null });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Content *
                  </label>
                  <div className="border border-slate-200">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      className="h-64"
                      placeholder="Write your article content here..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Publication Status
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "draft" })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 border text-[10px] font-black uppercase tracking-widest transition-all",
                          formData.status === "draft"
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Lock size={14} /> Save as Draft
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "published" })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 border text-[10px] font-black uppercase tracking-widest transition-all",
                          formData.status === "published"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <Globe size={14} /> Publish Now
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                      Current Status
                    </label>
                    <div className={cn(
                      "px-4 py-3 border text-[10px] font-black uppercase tracking-widest",
                      formData.status === "published"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-blue-100 text-blue-700 border-blue-300"
                    )}>
                      {formData.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#003566] text-white rounded-none h-14 uppercase text-[10px] tracking-widest font-black"
                  >
                    <Save className="mr-2 w-4 h-4" />
                    {selectedBlog ? "UPDATE ARTICLE" : "PUBLISH ARTICLE"}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-100 text-slate-600 rounded-none h-14 uppercase text-[10px] tracking-widest font-black"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}