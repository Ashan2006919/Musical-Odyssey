import { Skeleton } from "@/components/ui/skeleton";

export function ArtistSkeleton() {
  return (
    <div className="cursor-pointer flex-col whitespace-nowrap shadow-md rounded-lg overflow-hidden relative transition-transform duration-300 hover:scale-105 hover:shadow-lg">
      <div className="relative">
        {/* Ranking Badge Skeleton */}
        <Skeleton className="absolute top-2 left-2 h-8 w-16 rounded-full" />

        {/* Image Skeleton */}
        <Skeleton className="w-full aspect-square object-cover" />
      </div>

      <div className="flex flex-col mt-4 px-4">
        {/* Artist Name Skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Rating Label Skeleton */}
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4 px-4 pb-4">
        {/* Buttons Skeleton */}
        <Skeleton className="h-10 w-full sm:w-1/2 rounded-lg" />
        <Skeleton className="h-10 w-full sm:w-1/2 rounded-lg" />
      </div>
    </div>
  );
}