"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

const API_BASE = "https://schepen-kring.nl/api";

export default function BlogDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Blog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("BlogDetails");
  const locale = useLocale();

  useEffect(() => {
    fetchBlogData();
  }, [slug]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
      const blogResponse = await fetch(`${API_BASE}/public/blogs/slug/${slug}`);
      if (!blogResponse.ok) throw new Error("Blog not found");
      
      const blogResult = await blogResponse.json();
      const blogData = {
        ...blogResult.data,
        blog_image: blogResult.data.featured_image,
        published_at: blogResult.data.created_at
      };
      setPost(blogData);
      
      const relatedResponse = await fetch(`${API_BASE}/public/blogs?status=published&per_page=4`);
      if (relatedResponse.ok) {
        const relatedResult = await relatedResponse.json();
        const relatedBlogs = relatedResult.data
          .filter((blog: any) => blog.slug !== slug)
          .slice(0, 3)
          .map((blog: any) => ({
            ...blog,
            blog_image: blog.featured_image,
            published_at: blog.created_at
          }));
        setRelatedPosts(relatedBlogs);
      }
      
      // View count increment (silent)
      fetch(`${API_BASE}/public/blogs/${blogResult.data.id}/view`, { method: 'POST' }).catch(() => {});
      
    } catch (err: any) {
      setError(err.message || "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You might want to add a toast notification here
      alert("Link copied!");
    }
  };

  const calculateReadTime = (content: string) => Math.ceil(content.split(/\s+/).length / 200);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 text-[#003566] animate-spin mb-4" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-4">
        <h1 className="text-3xl font-serif text-[#003566] mb-4">Article Not Found</h1>
        <Button asChild className="rounded-full bg-[#003566]">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content || "");

  return (
    <article className="min-h-screen bg-white text-slate-800">
      
      {/* --- Minimal Navbar --- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="text-sm font-medium text-slate-500 hover:text-[#003566] flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> {t("back_to_insights") || "Back"}
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-slate-500 hover:text-[#003566] hover:bg-blue-50 rounded-full">
              <Share2 size={18} />
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Header Section --- */}
      <header className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <span className="font-medium text-blue-600">
              {post.published_at && new Date(post.published_at).toLocaleDateString(locale, { month: "long", year: "numeric" })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {t("read_time", { min: readTime }) || `${readTime} min read`}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#003566] leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          {/* Author Block */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#003566] font-serif font-bold text-lg">
              {(post.author?.[0] || "E").toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[#003566] leading-none">{post.author || "Editorial Team"}</p>
              <p className="text-xs text-slate-500 mt-1">Author</p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* --- Hero Image (Rounded, not full bleed) --- */}
      {post.blog_image && (
        <div className="max-w-5xl mx-auto px-4 md:px-6 mb-16">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={post.blog_image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <div className="max-w-3xl mx-auto px-6 mb-24">
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:font-serif prose-headings:text-[#003566]
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-md
          prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg">
          
          {post.excerpt && (
            <p className="lead text-xl text-slate-600 mb-10 font-light">
              {post.excerpt}
            </p>
          )}

          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>
        
        {/* Share Footer */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">Share this article</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full gap-2">
               <Twitter size={16} className="text-blue-400" /> Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full gap-2">
               <Linkedin size={16} className="text-blue-700" /> LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full gap-2">
               <Facebook size={16} className="text-blue-600" /> Facebook
            </Button>
          </div>
        </div>
      </div>

      {/* --- Related Articles --- */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <h3 className="text-2xl font-serif text-[#003566] mb-10">Read Next</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group block bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <Image 
                      src={related.blog_image || "/placeholder.png"} 
                      alt={related.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-serif text-lg text-[#003566] group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {related.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {related.published_at && new Date(related.published_at).toLocaleDateString(locale)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}