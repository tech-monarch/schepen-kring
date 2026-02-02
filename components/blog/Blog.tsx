"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, BookOpen, ArrowRight, Zap } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "./BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
import { getAllBlogs } from "@/app/[locale]/actions/blog";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("BlogPage");
  const locale = useLocale();

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const blogData = await getAllBlogs();
        setBlogs(blogData.data);
      } catch (err) {
        setError(t("error_fetch"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [t]);

  if (isLoading) return <BlogSkeleton />;
  if (error) return (
    <div className="h-screen flex items-center justify-center bg-white text-[#003566] font-serif italic text-2xl">
      {error}
    </div>
  );

  const [featuredPost, ...otherPosts] = blogs;

  return (
    <div className="min-h-screen bg-white text-[#003566]">
      {/* --- Editorial Hero Section --- */}
      <section className="relative pt-48 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex items-center gap-4 mb-8"
            >
              <span className="w-12 h-[1px] bg-blue-600" />
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600">
                {t("new_updates_label")}
              </p>
            </motion.div>

            <h1 className="text-7xl md:text-9xl font-serif tracking-tighter leading-[0.8] mb-8">
              The <span className="italic font-light text-slate-300">Journal</span>
            </h1>
            
            <p className="text-slate-500 text-xl font-light max-w-xl tracking-tight leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              placeholder={t("search_placeholder")}
              className="w-full h-14 pl-12 bg-slate-50 border-slate-200 rounded-none text-[#003566] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-600 transition-all uppercase text-[10px] font-bold tracking-widest"
            />
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        {/* --- Featured Entry: Thick Bordered Card --- */}
        {blogs.length > 0 && (
          <div className="mb-32">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-0 border-[3px] border-[#003566] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,53,102,0.2)] transition-all duration-500"
            >
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#003566]">
                <Image
                  src={featuredPost.blog_image || BLOGIMAGEPLACEHOLDER}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="lg:col-span-5 p-12 md:p-20 flex flex-col justify-center bg-white">
                <div className="flex items-center gap-3 mb-8 text-[10px] font-black uppercase tracking-widest text-blue-600">
                  <Calendar size={14} strokeWidth={3} />
                  {new Date(featuredPost.published_at as any).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}
                </div>
                <h2 className="text-4xl md:text-6xl font-serif text-[#003566] mb-8 leading-[1.1] group-hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-500 text-lg font-light mb-12 line-clamp-3 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-[#003566] text-[11px] font-black uppercase tracking-[0.3em]">
                  {t("read_more")} <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* --- Secondary Feed: Thick Bordered Grid --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {otherPosts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`} 
              className="group flex flex-col bg-white border-[3px] border-slate-100 p-0 hover:border-[#003566] hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden border-b-[3px] border-slate-100 group-hover:border-[#003566] transition-colors">
                <Image 
                  src={post.blog_image || BLOGIMAGEPLACEHOLDER} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-serif text-[#003566] mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-slate-500 text-sm font-light line-clamp-2 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(post.published_at as any).toLocaleDateString(locale)}
                  </span>
                  <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* --- Newsletter CTA: Navy Inversion --- */}
        <div className="mt-40 bg-[#003566] p-16 md:p-32 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight">
              Stay <span className="italic font-light opacity-60">Informed</span>
            </h2>
            <p className="text-blue-100/60 text-xl font-light mb-12 tracking-wide leading-relaxed">
              {t("newsletter_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <Input 
                 placeholder="Email Address" 
                 className="h-16 w-full sm:w-80 rounded-none border-none bg-white/10 text-white placeholder:text-blue-300/50 px-8 focus-visible:ring-1 focus-visible:ring-white"
               />
               <Button className="h-16 px-12 rounded-none bg-white text-[#003566] font-black uppercase tracking-widest text-[11px] hover:bg-blue-50 transition-all">
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