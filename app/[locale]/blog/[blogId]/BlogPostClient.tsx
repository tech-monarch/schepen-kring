"use client";
import React, { use, useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import BlogDetails from "@/components/blog/BlogDetails";
import { getBlogBySlug } from "@/app/[locale]/actions/blog-utils";
import { Blog } from "@/types/blog.d";

export default function BlogPostClient() {
  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const blogId = params.blogId as string;
 
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const blogResponse = await getBlogBySlug(blogId);
        if (blogResponse && blogResponse.success && blogResponse.data) {
          setPost(blogResponse.data);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return <BlogDetails post={post} />;
}
