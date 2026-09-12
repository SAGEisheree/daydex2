import { Skeleton } from '@/components/ui/skeleton';

export default function AppLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <Skeleton className="w-24 h-24 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <Skeleton className="h-7 w-48 bg-slate-200 rounded" />
          <Skeleton className="h-4 w-32 bg-slate-200 rounded" />
          <Skeleton className="h-4 w-64 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Main Workspace Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 min-h-[450px] shadow-xs flex flex-col lg:flex-row gap-6">
        <Skeleton className="flex-1 h-full min-h-[350px] bg-slate-100 rounded-xl" />
        <Skeleton className="w-full lg:w-[340px] h-full min-h-[350px] bg-slate-100 rounded-xl shrink-0" />
      </div>
    </div>
  );
}
