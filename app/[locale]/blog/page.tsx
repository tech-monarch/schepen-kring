"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "@/components/blog/BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_BASE = "https://schepen-kring.nl/api";

const BlogComponent = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const t = useTranslations("BlogPage");
  const locale = useLocale();

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/public/blogs?status=published`);
      if (!response.ok) throw new Error("Failed");
      
      const result = await response.json();
      const allBlogs = result.data.map((blog: any) => ({
        ...blog,
        blog_image: blog.featured_image,
        published_at: blog.created_at
      }));
      
      setBlogs(allBlogs);
      setFilteredBlogs(allBlogs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  if (isLoading) return <BlogSkeleton />;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* --- 30vh Hero Section --- */}
      <section className="relative h-[35vh] flex flex-col items-center justify-center text-center px-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={BLOGIMAGEPLACEHOLDER} 
            alt="Blog Background" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#003566]/80" /> 
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-white space-y-6">
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
            Insights & Updates
          </h1>
          <p className="text-blue-100 text-lg font-light max-w-2xl mx-auto">
            Latest news, maritime insights, and stories from our team.
          </p>
          
          {/* Simple Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white text-slate-900 border-0 rounded-md focus-visible:ring-2 focus-visible:ring-blue-400"
            />
             {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* --- Main Grid Layout --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`} 
                className="group flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Image */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <Image 
                    src={post.blog_image || BLOGIMAGEPLACEHOLDER} 
                    alt={post.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    <Calendar size={12} />
                    {post.published_at && new Date(post.published_at).toLocaleDateString(locale)}
                  </div>
                  
                  <h3 className="text-xl font-serif font-medium text-[#003566] mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center text-sm font-semibold text-[#003566] group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No articles found.</p>
            <Button onClick={() => setSearchQuery("")} variant="link" className="text-blue-600 mt-2">
              Clear search
            </Button>
          </div>
        )}
      </div>

      {/* --- Simple Newsletter Section --- */}
      <section className="bg-slate-50 py-20 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-serif text-[#003566] mb-4">Subscribe to our newsletter</h2>
          <p className="text-slate-500 mb-8">Get the latest updates directly to your inbox. No spam, just value.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="bg-white border-slate-300" />
            <Button className="bg-[#003566] hover:bg-blue-800 text-white px-8">Subscribe</Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default BlogComponent;