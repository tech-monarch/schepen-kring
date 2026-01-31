"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useTranslations, useLocale } from "next-intl";

interface BlogDetailsProps {
  post: Blog;
  relatedPosts?: Blog[];
  className?: string;
}

const BlogDetails = ({ post, relatedPosts = [], className }: BlogDetailsProps) => {
  const t = useTranslations("BlogDetails");
  const locale = useLocale();

  return (
    <article className={cn("min-h-screen bg-[#0a0a0a] pb-24", className)}>
      {/* --- Sticky Navigation --- */}
      <nav className="sticky top-16 z-40 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="hover:bg-white/5 rounded-none group">
            <Link href="/blog" className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a572]">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {t("back_to_insights")}
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-none border-white/10 hover:border-[#c5a572]/50 bg-transparent text-slate-400">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-none border-white/10 hover:border-[#c5a572]/50 bg-transparent text-slate-400">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Editorial Header --- */}
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-left">
        <div className="flex items-center gap-6 text-[10px] font-bold text-[#c5a572] mb-10 uppercase tracking-[0.3em]">
          <span className="flex items-center border-l border-[#c5a572] pl-4">
            <Calendar className="h-3 w-3 mr-2" />
            {post.published_at && new Date(post.published_at).toLocaleDateString(locale, {
              month: "long", day: "numeric", year: "numeric"
            })}
          </span>
          <span className="flex items-center text-slate-500">
            <Clock className="h-3 w-3 mr-2" />
            {t("read_time", { min: 6 })}
          </span>
        </div>

        <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-12 leading-[1.1] tracking-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-none bg-white/5 flex items-center justify-center border border-white/10">
              <User className="h-5 w-5 text-[#c5a572]" />
           </div>
           <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t("published_by")}</p>
              <p className="font-serif italic text-white text-lg">{t("editorial_team")}</p>
           </div>
        </div>
      </header>

      {/* --- Immersive Wide Hero --- */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="relative aspect-[21/9] border border-white/5 overflow-hidden">
          <Image
            src={post.blog_image || "/placeholder.png"}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* --- Content Layout --- */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-8">
          <div className="prose prose-invert prose-lg max-w-none 
            prose-headings:font-serif prose-headings:italic prose-headings:text-white
            prose-p:font-light prose-p:leading-[2] prose-p:text-slate-400
            prose-strong:text-[#c5a572] prose-strong:font-bold
            prose-blockquote:border-[#c5a572] prose-blockquote:bg-white/[0.02] prose-blockquote:font-serif prose-blockquote:italic">
            
            <p className="text-xl md:text-2xl font-serif italic text-slate-300 mb-16 leading-relaxed border-l-2 border-[#c5a572] pl-8 py-2">
              {post.excerpt}
            </p>

            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>

        {/* --- Sidebar --- */}
        <aside className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-40 space-y-16">
            <div className="border-t border-white/10 pt-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c5a572] mb-10">{t("related_reading")}</h4>
              <div className="space-y-10">
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group flex flex-col gap-4">
                    <div className="relative aspect-video w-full overflow-hidden border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <Image src={relatedPost.blog_image || "/placeholder.png"} alt={relatedPost.title} fill className="object-cover" />
                    </div>
                    <h5 className="font-serif italic text-white group-hover:text-[#c5a572] transition-colors leading-snug">{relatedPost.title}</h5>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* --- Bottom Related Section --- */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-40 pt-20 border-t border-white/5">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-serif italic text-white">{t("further_reading")}</h2>
            <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-[#c5a572] hover:bg-white/5 gap-2" asChild>
              <Link href="/blog">{t("view_all")} <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {relatedPosts.slice(0, 3).map((related) => (
              <Link key={related.id} href={`/blog/${related.slug}`} className="group space-y-6">
                <div className="relative aspect-[16/10] border border-white/5 overflow-hidden">
                  <Image src={related.blog_image || "/placeholder.png"} alt={related.title} fill className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <h3 className="font-serif italic text-xl text-white group-hover:text-[#c5a572] transition-colors">{related.title}</h3>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {new Date(related.published_at as any).toLocaleDateString(locale)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default BlogDetails;