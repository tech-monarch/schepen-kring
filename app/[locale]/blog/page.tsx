"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Calendar, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Blog } from "@/types/blog.d";
import BlogSkeleton from "@/components/blog/BlogSkeleton";
import BLOGIMAGEPLACEHOLDER from "@/public/image.png";
// Import the yacht image
import YACHT_BG from "@/components/homepage/yacht.jpg";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-[#f5f6f7] text-[#626262] font-['Roboto',sans-serif]">
      {/* --- Magazine-style Header --- */}
      <header className="bg-white shadow-sm border-t-4 border-t-[#003566]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#16161a]">
            Smart<span className="text-[#003566]">Mag</span>
          </Link>
          <div className="flex items-center gap-4">
            <button className="text-[#16161a] hover:text-[#003566] transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* --- Hero Section with yacht background --- */}
      <section className="relative bg-[#16161a] text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={YACHT_BG}
            alt="Yacht background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#003566]/80" /> {/* Blue overlay */}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="text-blue-300 text-sm font-bold uppercase tracking-wider">
              Insights & Updates
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4 text-white">
              Latest News & Maritime Insights
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Stay informed with our team's latest articles and industry updates.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white text-[#16161a] border-0 rounded-sm focus-visible:ring-2 focus-visible:ring-[#003566]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Trending Ticker (optional) --- */}
      {filteredBlogs.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center gap-4 text-sm">
            <span className="font-bold text-[#003566] uppercase tracking-wider">
              🔥 Trending
            </span>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee inline-block">
                {filteredBlogs.slice(0, 5).map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="inline-block mr-8 text-[#16161a] hover:text-[#003566] transition-colors"
                  >
                    {blog.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Grid --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {filteredBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                    <Image
                      src={post.blog_image || BLOGIMAGEPLACEHOLDER}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#003566] mb-3">
                      <Calendar size={12} />
                      {post.published_at && new Date(post.published_at).toLocaleDateString(locale)}
                    </div>
                    <h3 className="text-xl font-bold text-[#16161a] mb-3 leading-snug group-hover:text-[#003566] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[#626262] text-sm line-clamp-3 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center text-sm font-semibold text-[#16161a] group-hover:text-[#003566] transition-colors">
                      Read Article <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#626262] text-lg">No articles found.</p>
            <Button
              onClick={() => setSearchQuery("")}
              variant="link"
              className="text-[#003566] mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default BlogComponent;