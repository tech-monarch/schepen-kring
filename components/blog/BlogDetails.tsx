"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, User, Eye, ChevronRight, Tag } from "lucide-react";
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
  const [isSharing, setIsSharing] = useState(false);
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

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share && post) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    } finally {
      setIsSharing(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-6 glass-card p-12 rounded-3xl">
          <div className="h-16 w-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-8 glass-card p-12 rounded-3xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Article Not Found
          </h1>
          <p className="text-gray-600">{error || "The article you're looking for doesn't exist."}</p>
          <Link href="/blog">
            <Button className="glass-button px-10 py-6 text-lg font-semibold hover:scale-105 transition-transform">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent -z-10" />
      <div className="fixed bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-purple-500/5 to-transparent -z-10" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <Link 
              href="/blog" 
              className="group flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors glass-tag px-4 py-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Blog</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="glass-button p-3 rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                className={cn(
                  "glass-button p-3 rounded-xl hover:scale-105 transition-all",
                  isSaved && "bg-amber-50/50"
                )}
                aria-label="Save"
              >
                <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 pt-32 pb-20 relative">
        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="flex items-center gap-2 glass-tag px-4 py-2 rounded-full text-sm">
              <Calendar className="h-4 w-4" />
              {post.published_at && new Date(post.published_at).toLocaleDateString(locale, {
                month: "long", day: "numeric", year: "numeric"
              })}
            </span>
            <span className="flex items-center gap-2 glass-tag px-4 py-2 rounded-full text-sm">
              <Clock className="h-4 w-4" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-2 glass-tag px-4 py-2 rounded-full text-sm">
              <Eye className="h-4 w-4" />
              {post.views || 0} views
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-12 leading-relaxed glass-card p-8 rounded-2xl">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-6 pt-8 border-t border-gray-200/50">
            <div className="glass-card h-14 w-14 rounded-full flex items-center justify-center overflow-hidden">
              <User className="h-7 w-7 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Written by</p>
              <p className="font-semibold text-gray-900 text-lg">
                {post.author || t("editorial_team")}
              </p>
            </div>
          </div>
        </motion.header>

        {/* Hero Image */}
        {post.blog_image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="glass-card rounded-3xl overflow-hidden p-2">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl">
                <Image
                  src={post.blog_image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none"
        >
          <div className="glass-card rounded-3xl p-12">
            <div 
              className="text-gray-700 leading-relaxed space-y-8 text-lg"
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-24"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900">
                Continue Reading
              </h2>
              <ChevronRight className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={`/blog/${related.slug}`}
                    className="group block"
                  >
                    <div className="glass-card rounded-2xl overflow-hidden h-full hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {related.blog_image && (
                          <Image
                            src={related.blog_image}
                            alt={related.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors mb-3 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {related.published_at && new Date(related.published_at).toLocaleDateString(locale)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </article>
    </div>
  );
}