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
    <div className="relative w-[500px] overflow-hidden shadow-md rounded-md transition-all duration-300 ease-in-out">
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