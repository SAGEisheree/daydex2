import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#eaf1f7]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D6BD8]" />
        <p className="text-sm font-medium text-slate-500">Loading DayDex...</p>
      </div>
    </div>
  );
}
