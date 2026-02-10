"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }
      
      const result = await response.json();
      const allBlogs = result.data.map((blog: any) => ({
        ...blog,
        blog_image: blog.featured_image,
        published_at: blog.created_at
      }));
      
      setBlogs(allBlogs);
      setFilteredBlogs(allBlogs);
      
      if (allBlogs.length > 0) {
        setFeaturedBlog(allBlogs[0]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="h-12 w-48 bg-gray-100 animate-pulse mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[16/9] bg-gray-100 animate-pulse" />
                <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center space-y-4">
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchBlogs} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-serif text-gray-900">No articles yet</h1>
          <p className="text-gray-600">Check back soon for new content.</p>
        </div>
      </div>
    );
  }

  const otherBlogs = filteredBlogs.filter(blog => 
    !featuredBlog || blog.id !== featuredBlog.id
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-serif text-gray-900 leading-tight">
              Insights & Perspectives
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Thoughtful articles on strategy, innovation, and industry trends.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-gray-300 rounded-lg focus:border-gray-400 focus:ring-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Featured Article */}
        {featuredBlog && (
          <section className="mb-20">
            <Link href={`/blog/${featuredBlog.slug}`} className="group block">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-[16/9] lg:aspect-square overflow-hidden bg-gray-50">
                  {featuredBlog.blog_image && (
                    <Image
                      src={featuredBlog.blog_image}
                      alt={featuredBlog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredBlog.published_at && new Date(featuredBlog.published_at).toLocaleDateString(locale, { 
                        month: "short", day: "numeric", year: "numeric" 
                      })}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-serif text-gray-900 group-hover:text-[#003566] transition-colors leading-tight">
                    {featuredBlog.title}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {featuredBlog.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-2 text-[#003566] font-medium group-hover:gap-3 transition-all">
                    Read article
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Articles Grid */}
        {otherBlogs.length > 0 ? (
          <section>
            <h2 className="text-2xl font-serif text-gray-900 mb-8">
              Latest Articles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
                      {post.blog_image && (
                        <Image
                          src={post.blog_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {post.published_at && new Date(post.published_at).toLocaleDateString(locale, { 
                          month: "short", day: "numeric" 
                        })}
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#003566] transition-colors leading-snug">
                        {post.title}
                      </h3>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 space-y-4">
            <p className="text-gray-600">No articles found for "{searchQuery}"</p>
            <Button 
              onClick={() => setSearchQuery("")}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Newsletter CTA */}
        <section className="mt-32 pt-12 border-t border-gray-100">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-gray-900">
                Stay Updated
              </h3>
              <p className="text-gray-600">
                Subscribe to receive our latest insights directly in your inbox.
              </p>
            </div>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-12 border-gray-300 rounded-lg"
                required
              />
              <Button className="h-12 px-8 bg-[#003566] hover:bg-[#002244] text-white">
                Subscribe
              </Button>
            </form>
            
            <p className="text-xs text-gray-500">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogComponent;