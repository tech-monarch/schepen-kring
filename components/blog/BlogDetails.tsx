"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ChevronRight, User, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";

const API_BASE = "https://schepen-kring.nl/api";


export default function BlogDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
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
      // Fetch the main blog post
      const blogResponse = await fetch(`${API_BASE}/public/blogs/slug/${slug}`);
      
      if (!blogResponse.ok) {
        if (blogResponse.status === 404) {
          throw new Error("Blog not found");
        }
        throw new Error(`Failed to fetch blog: ${blogResponse.status}`);
      }
      
      const blogResult = await blogResponse.json();
      const blogData = {
        ...blogResult.data,
        blog_image: blogResult.data.featured_image,
        published_at: blogResult.data.created_at
      };
      
      setPost(blogData);
      
      // Fetch related posts (other published blogs)
      const relatedResponse = await fetch(`${API_BASE}/public/blogs?status=published&per_page=10`);
      
      if (relatedResponse.ok) {
        const relatedResult = await relatedResponse.json();
        const relatedBlogs = relatedResult.data
          .filter((blog: any) => blog.slug !== slug)
          .slice(0, 6)
          .map((blog: any) => ({
            ...blog,
            blog_image: blog.featured_image,
            published_at: blog.created_at
          }));
        
        setRelatedPosts(relatedBlogs);
      }
      
      // Increment view count
      try {
        await fetch(`${API_BASE}/public/blogs/${blogResult.data.id}/view`, {
          method: 'POST',
        });
      } catch (viewError) {
        console.error("Failed to increment view count:", viewError);
      }
      
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setError(err.message || "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#003566] animate-spin mx-auto mb-4" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
            Loading Article...
          </p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white text-[#003566] p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-screen -mt-20">
          <h1 className="text-4xl font-serif italic text-[#003566] mb-6">Article Not Found</h1>
          <p className="text-slate-500 mb-8">{error || "The article you're looking for doesn't exist."}</p>
          <Link href="/blog">
            <Button className="bg-[#003566] text-white rounded-none uppercase text-[10px] tracking-widest font-black px-8 h-12">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content || "");

  return (
    <article className="min-h-screen bg-white pb-24 text-[#003566]">
      {/* --- Sticky Navigation --- */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b-2 border-slate-100 transition-all">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-slate-50 rounded-none group">
            <Link href="/blog" className="flex items-center text-[11px] font-black uppercase tracking-[0.3em] text-[#003566]">
              <ArrowLeft className="h-4 w-4 mr-3 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
              {t("back_to_insights")}
            </Link>
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-none border-2 border-slate-100 hover:border-[#003566] bg-transparent text-[#003566] transition-all"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-none border-2 border-slate-100 hover:border-[#003566] bg-transparent text-[#003566] transition-all">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Editorial Header --- */}
      <header className="max-w-5xl mx-auto px-6 pt-32 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-6 text-[11px] font-black text-blue-600 mb-12 uppercase tracking-[0.4em]"
        >
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-2" strokeWidth={3} />
            {post.published_at && new Date(post.published_at).toLocaleDateString(locale, {
              month: "long", day: "numeric", year: "numeric"
            })}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="flex items-center text-slate-400">
            <Clock className="h-3 w-3 mr-2" strokeWidth={3} />
            {t("read_time", { min: readTime })}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <span className="flex items-center text-slate-400">
            <Eye className="h-3 w-3 mr-2" strokeWidth={3} />
            {post.views || 0} views
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-serif text-[#003566] mb-16 leading-[0.9] tracking-tighter"
        >
          {post.title}
        </motion.h1>

        <div className="flex items-center justify-center gap-4 border-y border-slate-100 py-8 max-w-xs mx-auto">
           <div className="h-12 w-12 rounded-none bg-[#003566] flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
           </div>
           <div className="text-left">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">
                {t("published_by")}
              </p>
              <p className="font-serif italic text-[#003566] text-xl leading-none">
                {post.author || t("editorial_team")}
              </p>
           </div>
        </div>
      </header>

      {/* --- Immersive Wide Hero --- */}
      {post.blog_image && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-32">
          <div className="relative aspect-21/9 border-[3px] border-[#003566] shadow-[0_40px_80px_-20px_rgba(0,53,102,0.15)] overflow-hidden bg-slate-50">
            <Image
              src={post.blog_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1400px) 100vw, 1400px"
            />
          </div>
        </div>
      )}

      {/* --- Content Layout --- */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-24">
        <div className="lg:col-span-8">
          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-serif prose-headings:text-[#003566] prose-headings:tracking-tight
            prose-p:font-light prose-p:leading-[2] prose-p:text-slate-600
            prose-strong:text-[#003566] prose-strong:font-black
            prose-blockquote:border-l-[3px] prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-blue-900 prose-blockquote:py-2">
            
            {post.excerpt && (
              <p className="text-2xl md:text-3xl font-serif text-slate-400 mb-20 leading-snug">
                {post.excerpt}
              </p>
            )}

            <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
          </div>
        </div>

        {/* --- Sidebar --- */}
        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-40 space-y-16">
            <div className="border-t-[3px] border-[#003566] pt-10">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#003566] mb-12">
                {t("related_reading")}
              </h4>
              <div className="space-y-12">
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group flex flex-col gap-5">
                    <div className="relative aspect-video w-full overflow-hidden border-[3px] border-slate-100 group-hover:border-[#003566] transition-all duration-500">
                      <Image 
                        src={relatedPost.blog_image || "/placeholder.png"} 
                        alt={relatedPost.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        sizes="(max-width: 400px) 100vw, 400px"
                      />
                    </div>
                    <h5 className="font-serif text-xl text-[#003566] group-hover:text-blue-600 transition-colors leading-tight">
                      {relatedPost.title}
                    </h5>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* --- Further Reading --- */}
      {relatedPosts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 mt-48 pt-24 border-t border-slate-100">
          <div className="flex items-center justify-between mb-20">
            <h2 className="text-4xl md:text-5xl font-serif text-[#003566] tracking-tight">
              {t("further_reading")}
            </h2>
            <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-3" asChild>
              <Link href="/blog">
                {t("view_all")} <ChevronRight className="h-4 w-4" strokeWidth={3} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {relatedPosts.slice(0, 3).map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`} className="group block">
                <div className="relative aspect-16/10 border-[3px] border-slate-100 group-hover:border-[#003566] overflow-hidden transition-all duration-500 mb-8">
                  <Image 
                    src={related.blog_image || "/placeholder.png"} 
                    alt={related.title} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <h3 className="font-serif text-2xl text-[#003566] group-hover:text-blue-600 transition-colors mb-4">
                  {related.title}
                </h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {related.published_at && new Date(related.published_at).toLocaleDateString(locale)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}