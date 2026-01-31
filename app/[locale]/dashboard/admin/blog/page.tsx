import BlogManagement from "@/components/admin/blog/BlogManagement";

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'nl' },
  ];
}

const AdminBlogPage = () => {
  // Assuming user role is available in a context or session
  const user = { role: "admin" }; // Mock user with admin role

  if (user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <BlogManagement />;
};

export default AdminBlogPage;
