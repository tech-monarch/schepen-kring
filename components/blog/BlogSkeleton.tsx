import { Skeleton } from "@/components/ui/skeleton";

const BlogSkeleton = () => {
  return (
    <div className="container mx-auto px-6 py-24 bg-[#0a0a0a]">
      {/* Editorial Header Skeleton */}
      <div className="mb-20 space-y-4">
        <Skeleton className="h-3 w-32 bg-white/5 rounded-none" />
        <Skeleton className="h-16 w-3/4 bg-white/5 rounded-none" />
        <Skeleton className="h-4 w-1/2 bg-white/5 rounded-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
        {/* Featured Insight Skeleton */}
        <div className="md:col-span-2 lg:row-span-1">
          <div className="h-full flex flex-col bg-transparent border border-white/5 rounded-none overflow-hidden">
            <Skeleton className="relative aspect-[21/9] w-full bg-white/5 rounded-none" />
            <div className="p-8 flex-1 flex flex-col">
              <Skeleton className="h-3 w-24 mb-6 bg-[#c5a572]/20 rounded-none" />
              <Skeleton className="h-10 w-full mb-4 bg-white/10 rounded-none" />
              <Skeleton className="h-4 w-full mb-2 bg-white/5 rounded-none" />
              <Skeleton className="h-4 w-2/3 mb-6 bg-white/5 rounded-none" />
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 bg-white/5 rounded-none" />
                  <Skeleton className="h-3 w-24 bg-white/5 rounded-none" />
                </div>
                <Skeleton className="h-10 w-32 bg-[#c5a572]/10 rounded-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Insights Skeletons */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col border border-white/5 bg-transparent rounded-none">
            <Skeleton className="relative aspect-video w-full bg-white/5 rounded-none" />
            <div className="p-6 flex-1">
              <Skeleton className="h-3 w-20 mb-4 bg-[#c5a572]/20 rounded-none" />
              <Skeleton className="h-6 w-full mb-3 bg-white/10 rounded-none" />
              <Skeleton className="h-4 w-full mb-1 bg-white/5 rounded-none" />
              <Skeleton className="h-4 w-3/4 bg-white/5 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Archive Grid Skeletons */}
      <div className="mt-32 pt-16 border-t border-white/10">
        <div className="flex justify-between items-end mb-12">
          <Skeleton className="h-8 w-64 bg-white/10 rounded-none" />
          <Skeleton className="h-4 w-24 bg-white/5 rounded-none" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="relative aspect-[16/10] w-full bg-white/5 border border-white/5 rounded-none" />
              <div className="px-2 space-y-3">
                <Skeleton className="h-6 w-full bg-white/10 rounded-none" />
                <Skeleton className="h-4 w-5/6 bg-white/5 rounded-none" />
                <Skeleton className="h-3 w-1/3 bg-white/5 rounded-none pt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;