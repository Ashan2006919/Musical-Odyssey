"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Tooltip } from "recharts";
import { ChartSkeleton } from "./AlbumSkeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
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
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchRatingHistory = async () => {
      if (!albumId) return;
      try {
        const response = await axios.get(`/api/ratings/history?albumId=${albumId}`);
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
  }, [albumId]);

  if (loading) {
    return <ChartSkeleton />; // Show skeleton while loading
  }

  return (
    <div className="w-full h-64">
      {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <LineChart
                width={500}
                height={300}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid vertical={false} />

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
