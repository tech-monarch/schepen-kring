"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useLocale } from "next-intl";

const API_BASE = "https://schepen-kring.nl/api";

export default function BlogDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/blogs/slug/${slug}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setPost({ ...data.data, blog_image: data.data.featured_image });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [slug]);

  if (loading) return <div className="h-screen bg-white" />;
  if (!post) return <div className="h-screen flex items-center justify-center">Post not found</div>;

  return (
    <article className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* --- 35vh Hero Header (Post Title & Image) --- */}
      <header className="relative h-[35vh] min-h-[300px] flex items-center justify-center text-center px-4">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={post.blog_image || "/placeholder.png"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          {/* Heavy Overlay for Text Readability */}
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>

        {/* Title Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-white space-y-4 pt-10">
            <Link href="/blog" className="inline-flex items-center text-blue-200 hover:text-white text-sm font-semibold uppercase tracking-wide mb-2 transition-colors">
              <ArrowLeft size={14} className="mr-2" /> Back to Articles
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-serif font-medium leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-sm text-blue-100/80 font-medium">
               <span>{new Date(post.created_at || Date.now()).toLocaleDateString(locale, { dateStyle: 'long' })}</span>
               <span>•</span>
               <span className="flex items-center gap-1"><Clock size={14} /> 5 min read</span>
            </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        
        {/* Author / Share Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#003566] font-bold font-serif">
                {(post.author?.[0] || "A").toUpperCase()}
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900">{post.author || "Author"}</p>
               <p className="text-xs text-slate-500">Editor</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-[#003566]">
            <Share2 size={18} /> <span className="ml-2 hidden sm:inline">Share</span>
          </Button>
        </div>

        {/* Text Content */}
        <div className="prose prose-lg prose-slate max-w-none 
          prose-headings:font-serif prose-headings:text-[#003566] 
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-lg prose-img:shadow-sm">
          
          {post.excerpt && (
            <p className="text-xl text-slate-700 font-serif leading-relaxed italic border-l-4 border-[#003566] pl-4 mb-10">
              {post.excerpt}
            </p>
          )}
          
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
        </div>

        {/* Simple Footer Link */}
        <div className="mt-16 pt-10 border-t border-slate-100 text-center">
            <Link href="/blog">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <ArrowLeft className="mr-2 h-4 w-4" /> View all articles
              </Button>
            </Link>
        </div>

      </div>
    </article>
  );
}