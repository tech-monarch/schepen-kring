"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, User, Eye } from "lucide-react";
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
  const [isSaved, setIsSaved] = useState(false);
  const t = useTranslations("BlogDetails");
  const locale = useLocale();

  useEffect(() => {
    fetchBlogData();
  }, [slug]);

  const fetchBlogData = async () => {
    setLoading(true);
    try {
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
      
      // Fetch related posts
      const relatedResponse = await fetch(`${API_BASE}/public/blogs?status=published&per_page=3`);
      
      if (relatedResponse.ok) {
        const relatedResult = await relatedResponse.json();
        const relatedBlogs = relatedResult.data
          .filter((blog: any) => blog.slug !== slug)
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
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Add actual save functionality here
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
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-2 border-t-[#003566] border-gray-200 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md space-y-6">
          <h1 className="text-3xl font-serif text-gray-900">Article Not Found</h1>
          <p className="text-gray-600">{error || "The article you're looking for doesn't exist."}</p>
          <Link href="/blog">
            <Button className="bg-[#003566] text-white hover:bg-[#002244] px-8">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content || "");

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="group flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "p-2 transition-colors",
                isSaved ? "text-amber-500" : "text-gray-500 hover:text-gray-900"
              )}
              aria-label="Save"
            >
              <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.published_at && new Date(post.published_at).toLocaleDateString(locale, {
                month: "long", day: "numeric", year: "numeric"
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views || 0} views
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Written by</p>
              <p className="font-medium text-gray-900">
                {post.author || t("editorial_team")}
              </p>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.blog_image && (
          <div className="mb-12">
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-50">
              <Image
                src={post.blog_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-24 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-serif text-gray-900 mb-8">
              Continue Reading
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link 
                  key={related.id} 
                  href={`/blog/${related.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 mb-4">
                    {related.blog_image && (
                      <Image
                        src={related.blog_image}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#003566] transition-colors mb-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {related.published_at && new Date(related.published_at).toLocaleDateString(locale)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}