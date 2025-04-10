import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const fakeChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
};

export function AlbumSkeletonRandom() {
  return (
    <div className="relative w-[450px] overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out">
      <Skeleton className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm" />
      <div className="absolute inset-0 bg-black/10 rounded-xl before:absolute before:bottom-0 before:left-0 before:w-full before:h-1/3 before:bg-gradient-to-t before:to-transparent"></div>
      <div className="relative flex items-center gap-x-6 p-6 flex-nowrap">
        <Skeleton className="w-32 h-32 object-cover rounded-lg shadow-lg" />
        <div className="flex flex-col items-start text-left w-full">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
          <div className="flex gap-3 mt-4 w-full">
            <Skeleton className="flex-1 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlbumSkeletonSearch() {
  return (
    <div className="relative w-[675px] h-[275px] overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out pt-10">
      <Skeleton className="absolute inset-0 w-full h-full bg-cover bg-center blur-sm" />
      <div className="absolute inset-0 bg-black/10 rounded-xl before:absolute before:bottom-0 before:left-0 before:w-full before:h-1/3 before:bg-gradient-to-t before:to-transparent"></div>
      <div className="relative flex items-center gap-x-6 p-6 flex-nowrap">
        <Skeleton className="w-32 h-32 object-cover rounded-lg shadow-lg" />
        <div className="flex flex-col items-start text-left w-full">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
          <div className="flex gap-3 mt-4 w-full">
            <Skeleton className="flex-1 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RatingSkeleton() {
  return (
    <div className="relative w-full overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out p-6">
      <Skeleton className="h-20 w-20 rounded-md mb-4" />
      <div className="flex flex-col mb-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-1" />
      </div>
      <div>
        <Skeleton className="h-6 w-1/2 mb-2" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Skeleton className="h-6 w-1/2" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <LineChart
        width={500}
        height={300}
        data={fakeChartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        className="opacity-50 blur-sm" // Add opacity and blur to create a shaded effect
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "rgba(0, 0, 0, 0.3)" }} // Faded tick labels
        />
        <Line
          type="natural"
          dataKey="desktop"
          stroke="rgba(0, 0, 0, 0.3)" // Faded line color
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </div>
  );
}

export function AlbumInfoSkeleton() {
  return (
    <div className="cursor-pointer flex-col whitespace-nowrap my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Skeleton */}
        <div className="flex justify-center items-center">
          <Skeleton className="w-64 h-64 rounded-lg" />
        </div>

        {/* Album Info Skeleton */}
        <div className="flex flex-col justify-center p-5 gap-4">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-8 w-3/4" /> {/* Album Name */}
            <Skeleton className="h-5 w-1/2" /> {/* Artist */}
            <Skeleton className="h-5 w-1/3" /> {/* Release Date */}
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4" /> {/* Producers title */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />

            <Skeleton className="h-5 w-1/4 mt-4" /> {/* Writers title */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrackListSkeleton() {
  return (
    <div className="cursor-pointer flex-col whitespace-nowrap py-2 my-6">
      <div className="min-w-full table-auto">
        {/* Header */}
        <div className="grid grid-cols-6 px-6 py-3 gap-4 text-left font-semibold">
          <Skeleton className="h-4 w-5" /> {/* # */}
          <Skeleton className="h-4 w-32" /> {/* Track */}
          <Skeleton className="h-4 w-20" /> {/* Duration */}
          <Skeleton className="h-4 w-20" /> {/* Rating */}
          <Skeleton className="h-5 w-5 rounded-full" /> {/* Checkbox */}
          <Skeleton className="h-5 w-5 rounded-full" /> {/* Eye Icon */}
        </div>

        {/* Track rows */}
        <div className="space-y-4 mt-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 px-6 gap-4 items-center">
              <Skeleton className="h-4 w-5" /> {/* Index */}
              <Skeleton className="h-4 w-32" /> {/* Track Name */}
              <Skeleton className="h-4 w-20" /> {/* Duration */}
              <Skeleton className="h-8 w-16 rounded-lg" /> {/* Rating input */}
              <Skeleton className="h-5 w-5 rounded-full" /> {/* Checkbox */}
              <Skeleton className="h-5 w-5 rounded-full" /> {/* Eye / EyeSlash */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AvailableOnSkeleton() {
  return (
    <div className="my-10">
      <div className="text-2xl font-semibold text-center mb-4 text-black">
        <Skeleton className="h-8 w-40 mx-auto" /> {/* Title placeholder */}
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 h-12 min-w-[220px] rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}

