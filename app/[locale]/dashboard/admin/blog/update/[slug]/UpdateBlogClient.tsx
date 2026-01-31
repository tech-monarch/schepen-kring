'use client';
import { use, useEffect, useState } from 'react';
import { getBlogBySlug } from '@/app/[locale]/actions/blog-utils';
import BlogForm from '@/components/admin/blog/BlogForm';
import { Blog } from '@/types/blog.d';
import BlogSkeleton from '@/components/blog/BlogSkeleton';
import { useParams } from 'next/navigation';

const UpdateBlogClient = () => {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const blogResponse = await getBlogBySlug(slug);
        if (blogResponse && blogResponse.success && blogResponse.data) {
          setBlog(blogResponse.data);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return <BlogSkeleton />;
  }

  if (!blog) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Update Blog Post</h1>
        <p className="text-gray-600">Edit the blog post details below</p>
      </div>
      
      <BlogForm blog={blog} />
    </div>
  );
};

export default UpdateBlogClient;
