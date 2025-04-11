"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react"; // Import useSession
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartSkeleton } from "./AlbumSkeleton";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const RatingTrendChart = ({ albumId }) => {
  console.log("Rendering RatingTrendChart with albumId:", albumId); // Debugging log
  const { data: session } = useSession(); // Get session data
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!albumId || !session?.user?.omid) return; // Ensure albumId and OMID are available

      try {
        const response = await axios.get(
          `/api/ratings/history?albumId=${albumId}&userOmid=${session.user.omid}` // Pass OMID to the API
        );
        const formattedData = response.data.history.map((entry) => ({
          ...entry,
          date: new Date(entry.date).toISOString().slice(0, 10),
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch rating history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatingHistory();
  }, [albumId, session?.user?.omid]); // Add session.user.omid as a dependency

  if (loading) {
    return <ChartSkeleton />; // Show skeleton while loading
  }

  return (
    <div className="w-full h-64">
      {chartData.length > 0 ? (
        <ChartContainer config={chartConfig}>
          <LineChart
            width={500}
            height={500}
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="averageRating"
              domain={[0, 10]}
              tickCount={11}
              tickFormatter={(value) => value.toFixed(1)}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="natural"
              dataKey="averageRating"
              stroke="var(--color-desktop)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <p className="text-center text-gray-500">
          No rating history available.
        </p>
      )}
    </div>
  );
};

export default RatingTrendChart;
