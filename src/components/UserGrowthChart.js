"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const UserGrowthChart = ({ data = [] }) => {
  return (
    <div className="w-full h-64">
      {data.length > 0 ? (
        <ChartContainer>
          <LineChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis
              dataKey="users"
              domain={["auto", "auto"]}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="monotone"
              dataKey="users"
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
          No user growth data available.
        </p>
      )}
    </div>
  );
};

export default UserGrowthChart;