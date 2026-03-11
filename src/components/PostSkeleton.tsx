export default function PostSkeleton() {
  return (
    <div className="bg-black border border-white/5 p-6 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-sm bg-slate-900 flex-shrink-0"></div>
        <div className="space-y-2 flex-1">
          <div className="h-3 w-32 bg-slate-900 rounded"></div>
          <div className="h-2.5 w-20 bg-slate-900 rounded"></div>
        </div>
      </div>
      <div className="space-y-3 pl-[72px]">
        <div className="h-3.5 w-full bg-slate-900 rounded"></div>
        <div className="h-3.5 w-[90%] bg-slate-900 rounded"></div>
        <div className="h-3.5 w-[70%] bg-slate-900 rounded"></div>
      </div>
      <div className="aspect-video w-full bg-slate-900/50 rounded-sm border border-white/5"></div>
    </div>
  );
}
