import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, ArrowRight } from 'lucide-react';
import type { Post } from './LeftBlog';
import { Badge } from '../ui/badge';
import { Link } from '@/i18n/navigation';

type RightBlogProps = {
  posts: Post[];
  className?: string;
  variant?: 'list' | 'grid' | 'compact';
};

const RightBlog = ({ posts, className, variant = 'list' }: RightBlogProps) => {
  const isGrid = variant === 'grid';
  
  if (isGrid) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {posts.map((post) => (
          <Link href={`/blog/${post.id}`} className='cursor-pointer'>
          <article key={post.id} className="group relative overflow-hidden rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {post.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary mr-2">
                    {post.author.charAt(0)}
                  </div>
                  <span className="text-xs">{post.author}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.readTime} min read
                </div>
              </div>
            </div>
          </article>
          </Link>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link href={`/blog/${post.id}`} className="block">
              <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-2">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>{post.category}</span>
                  <span className="mx-1.5">•</span>
                  <span>{post.readTime} min read</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    );
  }

  // Default grid variant
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {posts.map((post) => (
        <article key={post.id} className="group">
          <div className="h-full flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
            <Link href={`/blog/${post.id}`} className="relative block aspect-video overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary/90 text-white rounded-full">
                  {post.category}
                </span>
              </div>
            </Link>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="mx-1.5">•</span>
                <span>{post.readTime} min read</span>
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">
                <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.description}
              </p>
              
              <div className="mt-auto pt-3 flex items-center">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {post.author.charAt(0)}
                </div>
                <span className="ml-2 text-sm">{post.author}</span>
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto text-xs h-8 px-3 text-primary hover:bg-primary/10"
                >
                  <Link href={`/blog/${post.id}`}>
                    Read
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export { RightBlog };
export type { RightBlogProps };