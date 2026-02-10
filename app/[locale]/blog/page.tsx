"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "@/components/blog/BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
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
      
      // Set featured blog
      try {
        const featuredResponse = await fetch(`${API_BASE}/public/blogs/featured`);
        if (featuredResponse.ok) {
          const featuredResult = await featuredResponse.json();
          setFeaturedBlog({
            ...featuredResult.data,
            blog_image: featuredResult.data.featured_image,
            published_at: featuredResult.data.created_at
          });
        } else if (allBlogs.length > 0) {
          setFeaturedBlog(allBlogs[0]);
        }
      } catch (featuredError) {
        if (allBlogs.length > 0) {
          setFeaturedBlog(allBlogs[0]);
        }
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

  if (isLoading) return <BlogSkeleton />;
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      {error}
    </div>
  );

  // Separate featured blog from others
  const otherBlogs = filteredBlogs.filter(blog => 
    !featuredBlog || blog.id !== featuredBlog.id
  );

  if (blogs.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen px-4 py-16 text-center">
        <h1 className="text-3xl font-serif text-gray-900 mb-4">The Journal</h1>
        <p className="text-gray-500">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-12 max-w-6xl mx-auto border-b">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">The Journal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("subtitle") || "Thoughts, stories, and ideas"}
          </p>
        </div>

        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("search_placeholder") || "Search articles..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 bg-gray-50 border-gray-200 rounded-lg"
          />
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Found {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12 max-w-6xl mx-auto">
        {/* Featured Article */}
        {featuredBlog && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <Link href={`/blog/${featuredBlog.slug}`} className="group block">
              <div className="relative aspect-[16/9] mb-6 overflow-hidden rounded-lg">
                <Image
                  src={featuredBlog.blog_image || featuredBlog.featured_image || BLOGIMAGEPLACEHOLDER}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar size={14} />
                {featuredBlog.published_at && new Date(featuredBlog.published_at).toLocaleDateString(locale, { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </div>
              
              <h2 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {featuredBlog.title}
              </h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {featuredBlog.excerpt}
              </p>
              
              <span className="inline-flex items-center gap-2 text-blue-600 font-medium">
                Read article
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        )}

        {/* Articles Grid */}
        {otherBlogs.length > 0 ? (
          <div>
            <h3 className="text-xl font-serif text-gray-900 mb-8">Latest Articles</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherBlogs.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
                    <Image 
                      src={post.blog_image || post.featured_image || BLOGIMAGEPLACEHOLDER} 
                      alt={post.title} 
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  
                  <h4 className="font-serif text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {post.published_at && new Date(post.published_at).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-8">
              No articles found for "{searchQuery}"
            </p>
            <Button 
              onClick={() => setSearchQuery("")}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              Clear Search
            </Button>
          </div>
        ) : null}
      </main>

      {/* Newsletter */}
      <div className="px-4 py-16 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h3 className="text-xl font-serif text-gray-900 mb-4">Stay Updated</h3>
          <p className="text-gray-600 mb-8">
            {t("newsletter_subtitle") || "Get the latest articles delivered to your inbox"}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="Your email"
              className="bg-white"
            />
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              {t("subscribed") || "Subscribe"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogComponent;