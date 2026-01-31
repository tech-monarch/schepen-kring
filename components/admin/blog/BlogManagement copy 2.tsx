'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, FileText, FileImage, AlertCircle, Calendar, Eye, Search, MoreHorizontal } from 'lucide-react';
import { toast } from "react-toastify";
import { Blog } from '@/types/blog.d';
import BlogSkeleton from '@/components/blog/BlogSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';

const API_BASE = 'https://api.answer24.nl/api/v1/blogs';

// 🔹 Get all blogs
const getAllBlogs = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No auth token found');

  const res = await fetch(API_BASE, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch blogs');
  return await res.json();
};

// 🔹 Delete a blog
const deleteBlog = async (id: string) => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to delete blog');
  return await res.json();
};

// 🔹 Update blog (toggle publish/draft)
const updateBlog = async (id: string, formData: FormData) => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('No auth token found');

  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error('Failed to update blog');
  return await res.json();
};

const BlogManagement = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const blogData = await getAllBlogs();
        setBlogs(blogData.data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch blogs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;
    if (searchTerm) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(blog => blog.status === statusFilter);
    }
    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, statusFilter]);

  const handleDeleteClick = (id: string) => {
    setBlogToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return;
    try {
      await deleteBlog(blogToDelete);
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete));
      toast.success("Blog deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to delete blog");
    }
  };

  const toggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const formData = new FormData();
      formData.append('title', blog.title);
      formData.append('slug', blog.slug || '');
      formData.append('content', blog.content);
      formData.append('excerpt', blog.excerpt || '');
      formData.append('status', newStatus);
      formData.append('_method', 'PATCH');

      const result = await updateBlog(blog.id, formData);
      if (result.success && result.data) {
        setBlogs(blogs.map((b) => (b.id === blog.id ? result.data as Blog : b)));
        toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) return <BlogSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this blog post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error && (
          <Alert className='mb-6 border-red-200 bg-red-50'>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
            <p className="text-slate-600 mt-1">Manage your blog posts</p>
          </div>
          <Link href="/dashboard/admin/blog/create" passHref>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <b><PlusCircle className="h-4 w-4 mr-2" /> New Post</b>
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80"
          />
          <Select value={statusFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredBlogs.length > 0 ? (
          viewMode === 'table' ? (
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>{blog.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={blog.status === 'published' ? 'default' : 'secondary'}
                          onClick={() => toggleStatus(blog)}
                        >
                          {blog.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(blog.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/dashboard/admin/blog/update/${blog.slug}`} passHref>
                              <DropdownMenuItem asChild>
                                <a><Edit className="h-4 w-4 mr-2" /> Edit</a>
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => toggleStatus(blog)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(blog.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Card key={blog.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{blog.title}</CardTitle>
                  </CardHeader>
                  <CardContent>{blog.excerpt}</CardContent>
                  <CardFooter className="flex justify-between">
                    <Badge onClick={() => toggleStatus(blog)}>{blog.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClick(blog.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="border-dashed border-2 text-center py-16">
            <CardContent>
              <FileText className="mx-auto mb-4 text-slate-400 h-12 w-12" />
              <h3 className="text-lg font-semibold text-slate-700">No posts yet</h3>
              <p className="text-slate-500 mb-6">Start by creating your first blog post.</p>
              <Link href="/dashboard/admin/blog/create" passHref>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <b><PlusCircle className="h-4 w-4 mr-2" /> Create Post</b>
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
