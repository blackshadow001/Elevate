import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-[60vh] bg-[#FFFDF9] px-4 py-12" aria-label="Loading page">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
