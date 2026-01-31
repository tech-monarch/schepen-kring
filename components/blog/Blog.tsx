"use client";
import { useEffect, useState } from "react";
import { Search, Calendar, BookOpen, ChevronRight, ArrowRight, Loader2, Zap } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "./BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
import { getAllBlogs } from "@/app/[locale]/actions/blog";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-[#c5a572] font-serif italic">
      {error}
    </div>
  );

  const [featuredPost, ...otherPosts] = blogs;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* --- Elite Hero Section --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1 border border-[#c5a572]/30 rounded-full mb-8">
            <Zap size={12} className="text-[#c5a572] fill-[#c5a572]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c5a572]">{t("new_updates_label")}</span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-serif italic text-white mb-8 tracking-tight">
            {t.rich("title", { span: (c) => <span className="text-slate-500 not-italic">{c}</span> })}
          </h1>
          
          <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto mb-16 tracking-wide leading-relaxed">
            {t("subtitle")}
          </p>

          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-[#c5a572] transition-colors" />
            <Input
              placeholder={t("search_placeholder")}
              className="w-full h-16 pl-14 bg-white/[0.03] border-white/10 rounded-none text-white placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-[#c5a572] transition-all"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* --- Featured Bento Grid --- */}
        {blogs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-32">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="lg:col-span-8 group relative bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-700 hover:border-[#c5a572]/30"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={featuredPost.blog_image || BLOGIMAGEPLACEHOLDER}
                  alt={featuredPost.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a572] flex items-center gap-2">
                  <Calendar size={12} />
                  {new Date(featuredPost.published_at as any).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div className="p-10 md:p-14">
                <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-6 group-hover:text-[#c5a572] transition-colors duration-500">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-400 text-lg font-light mb-10 line-clamp-2 max-w-2xl leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="inline-flex items-center gap-2 text-[#c5a572] text-[10px] font-bold uppercase tracking-[0.3em] group-hover:gap-4 transition-all">
                  {t("read_more")} <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            <div className="lg:col-span-4 flex flex-col gap-10">
              {otherPosts.slice(0, 2).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col bg-white/[0.02] border border-white/5 p-6 transition-all hover:border-[#c5a572]/30">
                  <div className="relative aspect-video overflow-hidden mb-6">
                    <Image src={post.blog_image || BLOGIMAGEPLACEHOLDER} alt={post.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="text-xl font-serif italic text-white mb-4 group-hover:text-[#c5a572] transition-colors">{post.title}</h3>
                  <div className="mt-auto text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-[#c5a572]">
                    {t("read_more")} →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- Secondary Feed --- */}
        {otherPosts.length > 2 && (
          <div className="space-y-16">
            <div className="flex items-center gap-6">
              <h2 className="text-xs uppercase tracking-[0.5em] text-slate-500 font-bold">{t("more_articles")}</h2>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {otherPosts.slice(2).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden mb-8 border border-white/5">
                    <Image src={post.blog_image || BLOGIMAGEPLACEHOLDER} alt={post.title} fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>
                  <h3 className="text-xl font-serif italic text-white mb-4 group-hover:text-[#c5a572] transition-colors leading-snug">{post.title}</h3>
                  <p className="text-slate-500 text-sm font-light line-clamp-2 leading-relaxed mb-6">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-600 font-bold border-t border-white/5 pt-4">
                    <span>{t("read_time", { min: 5 })}</span>
                    <span>{new Date(post.published_at as any).toLocaleDateString(locale)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- Newsletter CTA --- */}
        <div className="mt-40 relative border border-[#c5a572]/20 bg-white/[0.02] p-12 md:p-24 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a572]/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <BookOpen className="h-10 w-10 text-[#c5a572] mx-auto mb-8 opacity-50" />
            <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6">{t("newsletter_title")}</h2>
            <p className="text-slate-400 text-lg font-light mb-12 tracking-wide leading-relaxed">{t("newsletter_subtitle")}</p>
            <Button asChild size="lg" className="h-14 px-12 rounded-none bg-[#c5a572] text-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all">
              <Link href="/signup">{t("subscribed")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogComponent;