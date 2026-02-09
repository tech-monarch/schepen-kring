'use client';
import BlogForm from '@/components/admin/blog/BlogForm';

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const CreateBlogPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Blog Post</h1>
      <BlogForm />
    </div>
  );
};

export default CreateBlogPage;
