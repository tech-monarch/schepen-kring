"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "@/components/blog/BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const API_BASE = "https://schepen-kring.nl/api";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const t = useTranslations("BlogPage");
  const locale = useLocale();

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/public/blogs?status=published`);
      if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
      
      const result = await response.json();
      const allBlogs = result.data.map((blog: any) => ({
        ...blog,
        blog_image: blog.featured_image,
        published_at: blog.created_at
      }));
      
      setBlogs(allBlogs);
      setFilteredBlogs(allBlogs);
      
      try {
        const featuredResponse = await fetch(`${API_BASE}/public/blogs/featured`);
        if (featuredResponse.ok) {
          const featuredResult = await featuredResponse.json();
          setFeaturedBlog({
            ...featuredResult.data,
            blog_image: featuredResult.data.featured_image,
            published_at: featuredResult.data.created_at
          });
        } else if (allBlogs.length > 0) {
            setFeaturedBlog(allBlogs[0]);
        }
      } catch (featuredError) {
        if (allBlogs.length > 0) setFeaturedBlog(allBlogs[0]);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(t("error_fetch"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  if (isLoading) return <BlogSkeleton />;
  
  if (error) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-slate-600">
      {error}
    </div>
  );

  const otherBlogs = filteredBlogs.filter(blog => !featuredBlog || blog.id !== featuredBlog.id);

  return (
    <div className="min-h-screen bg-gray-50/50 text-slate-800 font-sans selection:bg-blue-100">
      
      {/* --- Clean Hero Section --- */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-3xl mx-auto space-y-6"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase">
            {t("new_updates_label") || "Our Blog"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#003566] tracking-tight leading-tight">
            Insights & <span className="text-blue-600">Updates</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Search Pill */}
          <div className="relative max-w-md mx-auto mt-8 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              placeholder={t("search_placeholder") || "Search articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-white border-slate-200 rounded-full shadow-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-400 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        
        {/* --- Featured Entry: Modern Card --- */}
        {featuredBlog && !searchQuery && (
          <div className="mb-24">
            <Link href={`/blog/${featuredBlog.slug}`} className="group block relative">
              <div className="grid lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-4 md:p-6 shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={featuredBlog.blog_image || featuredBlog.featured_image || BLOGIMAGEPLACEHOLDER}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 md:p-8">
                  <div className="flex items-center gap-2 mb-4 text-sm font-medium text-blue-600">
                    <Calendar size={14} />
                    {featuredBlog.published_at && new Date(featuredBlog.published_at).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif text-[#003566] mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-slate-500 text-lg mb-8 line-clamp-3 leading-relaxed">
                    {featuredBlog.excerpt}
                  </p>
                  <span className="inline-flex items-center text-sm font-semibold text-[#003566] group-hover:text-blue-600 transition-colors">
                    Read Article <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* --- Secondary Feed: Clean Grid --- */}
        {otherBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherBlogs.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`} 
                className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <Image 
                    src={post.blog_image || post.featured_image || BLOGIMAGEPLACEHOLDER} 
                    alt={post.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3 text-xs font-medium text-slate-400">
                    {post.published_at && new Date(post.published_at).toLocaleDateString(locale)}
                  </div>
                  <h3 className="text-xl font-serif text-[#003566] mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-4 mt-auto border-t border-slate-50 flex items-center text-blue-600 text-xs font-bold uppercase tracking-wide">
                    {t("read_more") || "Read more"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500 mb-4">No articles found matching your search.</p>
            <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-full">
              Clear Search
            </Button>
          </div>
        )}

        {/* --- Simple Newsletter --- */}
        <div className="mt-32 bg-[#003566] rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">
              Stay in the loop
            </h2>
            <p className="text-blue-100 text-lg mb-10 font-light">
              {t("newsletter_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
               <Input 
                 placeholder="Email Address" 
                 className="h-12 w-full sm:w-80 rounded-full border-transparent bg-white/10 text-white placeholder:text-blue-200/70 px-6 focus-visible:ring-1 focus-visible:ring-white focus-visible:bg-white/20"
               />
               <Button className="h-12 px-8 rounded-full bg-white text-[#003566] font-bold hover:bg-blue-50 transition-all">
                {t("subscribed")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogComponent;