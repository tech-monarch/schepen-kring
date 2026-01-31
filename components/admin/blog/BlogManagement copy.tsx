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
import Image from 'next/image';
import { toast } from "react-toastify";
import { Blog } from '@/types/blog.d';
import { deleteBlog, getAllBlogs } from "@/app/[locale]/actions/blog-utils";
import { updateBlog } from "@/app/[locale]/actions/blog";
import BlogSkeleton from '@/components/blog/BlogSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';

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
        setBlogs(blogData.data);
      } catch (err) {
        setError('Failed to fetch blogs.');
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      const result = await deleteBlog(blogToDelete, token);
      
      if (result && 'errors' in result && result.errors) {
        console.error('Delete errors:', result.errors);
        const errorMessages = (result.errors as any)._form || [];
        setError(Array.isArray(errorMessages) ? errorMessages.join('\n') : 'An error occurred');
        return;
      }
      
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete));
      setIsDeleteDialogOpen(false);
      toast.success("Blog post deleted successfully");
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError('An unexpected error occurred while deleting the blog post.');
      toast.error("Failed to delete the blog post. Please try again.");
    }
  };

  const toggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('title', blog.title);
      formData.append('slug', blog.slug || '');
      formData.append('content', blog.content);
      formData.append('excerpt', blog.excerpt || '');
      formData.append('status', newStatus);
      formData.append('_method', 'PATCH');

      const result = await updateBlog(blog.id, formData, token);
      
      if (result.success && result.data) {
        setBlogs(blogs.map((b) => (b.id === blog.id ? result.data as Blog : b)));
        toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      } else {
        const errorMsg = result.errors || 'Failed to update blog status';
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error updating blog status:', err);
      toast.error('Failed to update blog status');
    }
  };

  if (isLoading) return <BlogSkeleton/>;

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
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error && (
          <Alert className='mb-6 border-red-200 bg-red-50'>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Blog Management</h1>
            <p className="text-slate-600 mt-1">Manage your blog posts and content</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
              <div className="text-sm text-slate-600">Total Posts</div>
              <div className="text-2xl font-semibold text-slate-900">{blogs.length}</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
              <div className="text-sm text-slate-600">Published</div>
              <div className="text-2xl font-semibold text-green-600">{blogs.filter(b => b.status === 'published').length}</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 border shadow-sm">
              <div className="text-sm text-slate-600">Drafts</div>
              <div className="text-2xl font-semibold text-amber-600">{blogs.filter(b => b.status === 'draft').length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              
              <Link href="/dashboard/admin/blog/create" passHref>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <b>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    New Post
                  </b>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {filteredBlogs.length > 0 ? (
          viewMode === 'table' ? (
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded overflow-hidden bg-slate-100">
                          {blog.blog_image ? (
                            <img
                              src={blog.blog_image}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileImage className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-900 line-clamp-1">{blog.title}</div>
                          <div className="text-sm text-slate-500 line-clamp-1">{blog.excerpt}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={blog.status === 'published' ? 'default' : 'secondary'}
                          className={`cursor-pointer ${blog.status === 'published' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                          onClick={() => toggleStatus(blog)}
                        >
                          {blog.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(blog.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/blog/update/${blog.slug}`} passHref>
                              <DropdownMenuItem asChild>
                                <a>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </a>
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => toggleStatus(blog)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteClick(blog.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                    {blog.blog_image ? (
                      <img
                        src={blog.blog_image}
                        alt={blog.title}
                        // fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <FileImage className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <Badge 
                        variant={blog.status === 'published' ? 'default' : 'secondary'}
                        className={`${blog.status === 'published' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-amber-600 hover:bg-amber-700'
                        } text-white`}
                      >
                        {blog.status}
                      </Badge>
                    </div>
                    
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/dashboard/admin/blog/update/${blog.slug}`} passHref>
                            <DropdownMenuItem asChild>
                              <b>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </b>
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => toggleStatus(blog)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClick(blog.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(blog.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/blog/update/${blog.slug}`} passHref>
                        <Button asChild variant="outline" size="sm" className="h-7 px-2">
                          <b>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </b>
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No posts found' : 'No blog posts yet'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Get started by creating your first blog post to share your thoughts and ideas.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Link href="/dashboard/admin/blog/create" passHref>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <b>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Post
                    </b>
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
