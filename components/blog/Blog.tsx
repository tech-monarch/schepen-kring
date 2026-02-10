"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight, Filter } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card h-12 w-48 animate-pulse mb-12 rounded-2xl" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[16/9] glass-card animate-pulse rounded-2xl" />
                <div className="h-4 glass-card animate-pulse w-3/4 rounded-full" />
                <div className="h-3 glass-card animate-pulse w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30 px-4">
        <div className="text-center space-y-6 p-8 glass-card rounded-3xl max-w-md">
          <p className="text-gray-700">{error}</p>
          <Button 
            onClick={fetchBlogs} 
            className="glass-button hover:scale-105 transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center px-4">
        <div className="text-center space-y-6 p-8 glass-card rounded-3xl max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            No articles yet
          </h1>
          <p className="text-gray-600">Check back soon for new content.</p>
        </div>
      </div>
    );
  }

  const otherBlogs = filteredBlogs.filter(blog => 
    !featuredBlog || blog.id !== featuredBlog.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 -rotate-6 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/5 to-purple-500/5 rotate-12 translate-y-1/2" />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                Insights & Perspectives
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Thoughtful articles on strategy, innovation, and industry trends.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-14 h-14 rounded-2xl text-lg border-0 shadow-lg focus:shadow-xl transition-all duration-300"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Button 
                    className="glass-button h-10 w-10 p-0"
                    variant="ghost"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-24 relative">
        {/* Featured Article */}
        {featuredBlog && (
          <section className="mb-20">
            <Link href={`/blog/${featuredBlog.slug}`} className="group block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="glass-card overflow-hidden rounded-3xl p-1"
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative aspect-[16/9] lg:aspect-square overflow-hidden rounded-l-3xl">
                    {featuredBlog.blog_image && (
                      <Image
                        src={featuredBlog.blog_image}
                        alt={featuredBlog.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                  </div>
                  
                  <div className="p-10 lg:p-12 flex flex-col justify-center bg-white/70 backdrop-blur-xl">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      <span className="flex items-center gap-2 px-4 py-2 glass-tag rounded-full">
                        <Calendar className="h-4 w-4" />
                        {featuredBlog.published_at && new Date(featuredBlog.published_at).toLocaleDateString(locale, { 
                          month: "short", day: "numeric", year: "numeric" 
                        })}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-tight mb-6">
                      {featuredBlog.title}
                    </h2>
                    
                    <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                      {featuredBlog.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-3 text-blue-600 font-semibold group-hover:gap-4 transition-all">
                      <span className="relative overflow-hidden">
                        Read article
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                      </span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        {/* Articles Grid */}
        <AnimatePresence mode="wait">
          {otherBlogs.length > 0 ? (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest Articles
                </h2>
                <div className="text-sm text-gray-500 glass-tag px-4 py-2 rounded-full">
                  {otherBlogs.length} articles
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherBlogs.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <div className="glass-card rounded-2xl overflow-hidden h-full hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          {post.blog_image && (
                            <Image
                              src={post.blog_image}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="p-6 space-y-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {post.published_at && new Date(post.published_at).toLocaleDateString(locale, { 
                              month: "short", day: "numeric" 
                            })}
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>
                          
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="pt-4">
                            <span className="inline-flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                              Read more
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 space-y-6"
            >
              <div className="glass-card p-12 rounded-3xl max-w-md mx-auto">
                <p className="text-gray-700 text-lg mb-6">No articles found for "{searchQuery}"</p>
                <Button 
                  onClick={() => setSearchQuery("")}
                  className="glass-button hover:scale-105 transition-all"
                >
                  Clear Search
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter CTA */}
        <section className="mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10 p-12">
              <div className="space-y-6">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  Stay Updated
                </h3>
                <p className="text-gray-600 text-lg">
                  Subscribe to receive our latest insights directly in your inbox.
                </p>
              </div>
              
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="glass-input flex-1 h-14 rounded-2xl border-0 text-lg"
                  required
                />
                <Button className="glass-button h-14 px-10 text-lg font-semibold hover:scale-105 transition-transform">
                  Subscribe
                </Button>
              </form>
              
              <p className="text-sm text-gray-500">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default BlogComponent;