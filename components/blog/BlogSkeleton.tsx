import { Skeleton } from "@/components/ui/skeleton";

const BlogSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Editorial Header Skeleton */}
      <section className="pt-48 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6 w-full max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-slate-200" />
              <Skeleton className="h-3 w-32 bg-slate-100 rounded-none" />
            </div>
            <Skeleton className="h-24 w-3/4 bg-slate-200 rounded-none" />
            <Skeleton className="h-6 w-1/2 bg-slate-100 rounded-none" />
          </div>
          <Skeleton className="h-14 w-full lg:w-96 bg-slate-50 border border-slate-100 rounded-none" />
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        {/* 2. Featured Entry Skeleton (Thick Border) */}
        <div className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-[3px] border-slate-100">
            <Skeleton className="lg:col-span-7 aspect-16/10 lg:aspect-auto w-full bg-slate-100 rounded-none" />
            <div className="lg:col-span-5 p-12 md:p-20 space-y-8 bg-white">
              <Skeleton className="h-3 w-32 bg-blue-50 rounded-none" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full bg-slate-200 rounded-none" />
                <Skeleton className="h-12 w-3/4 bg-slate-200 rounded-none" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-slate-100 rounded-none" />
                <Skeleton className="h-4 w-full bg-slate-100 rounded-none" />
                <Skeleton className="h-4 w-2/3 bg-slate-100 rounded-none" />
              </div>
              <Skeleton className="h-4 w-32 bg-slate-200 rounded-none pt-4" />
            </div>
          </div>
        </div>

        {/* 3. Secondary Feed Grid Skeletons (Thick Borders) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col border-[3px] border-slate-100 bg-white">
              <Skeleton className="relative aspect-video w-full bg-slate-100 rounded-none border-b-[3px] border-slate-100" />
              <div className="p-8 space-y-6">
                <Skeleton className="h-8 w-full bg-slate-200 rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-slate-100 rounded-none" />
                  <Skeleton className="h-4 w-3/4 bg-slate-100 rounded-none" />
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-between">
                  <Skeleton className="h-3 w-20 bg-slate-100 rounded-none" />
                  <Skeleton className="h-4 w-4 bg-slate-200 rounded-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;