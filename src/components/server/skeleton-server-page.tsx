import { Skeleton } from '@/components/ui/skeleton';

export function ServerStatsSkeleton() {
  return (
    <aside className="hidden space-y-4 px-4 py-8 lg:block">
      <div className="space-y-6 pb-8 md:sticky md:top-24">
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </aside>
  );
}