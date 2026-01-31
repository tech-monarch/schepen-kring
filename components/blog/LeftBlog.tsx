import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

export interface Post {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  tags?: string[];
}

interface LeftBlogProps {
  post: Post;
  className?: string;
  variant?: 'default' | 'featured';
}

export const LeftBlog = ({ post, className, variant = 'default' }: LeftBlogProps) => {
  return (
    <Link href={`/blog/${post.id}`} className='cursor-pointer'>
       <article className={cn(
      "group bg-card rounded-2xl overflow-hidden border border-border",
      variant === 'featured' ? 'md:col-span-2 lg:row-span-2' : '',
      className
    )}>
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/90 text-white rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      <div className={cn(
        "p-6 flex flex-col",
        variant === 'featured' ? 'h-[calc(100%-16rem)]' : 'h-auto'
      )}>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {post.readTime} min read
          </span>
        </div>
        
        <h2 className={cn(
          "font-bold mb-3 line-clamp-2",
          variant === 'featured' ? 'text-2xl' : 'text-xl'
        )}>
          <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
            {post.title}
          </Link>
        </h2>
        
        <p className={cn(
          "text-muted-foreground mb-4",
          variant === 'featured' ? 'line-clamp-3' : 'line-clamp-2'
        )}>
          {post.description}
        </p>
        
        <div className="mt-auto pt-4 flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {post.author.charAt(0)}
          </div>
          <span className="ml-2 text-sm font-medium">{post.author}</span>
          <Button 
            asChild
            variant="ghost" 
            size="sm" 
            className="ml-auto text-primary hover:bg-primary/10 hover:gap-2 transition-all duration-300"
          >
            <Link href={`/blog/${post.id}`} className='cursor-pointer'>
              Read more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
    </Link>
 
  );
};

export default LeftBlog;