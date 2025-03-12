import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartData {
  date: string;
  impressions: number;
  clicks: number;
}

export function PerformanceChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics"],
  });

  useEffect(() => {
    if (metrics) {
      // Format data for the chart
      const formattedData = metrics.map((metric: any) => ({
        date: new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: metric.impressions,
        clicks: metric.clicks,
      })).reverse(); // Reverse to show oldest to newest
      
      setChartData(formattedData);
    }
  }, [metrics]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
        <div className="flex flex-wrap items-center space-x-2">
          <div className="flex items-center space-x-1 mr-3">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-xs text-slate-600">Impressions</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-teal-400"></span>
            <span className="text-xs text-slate-600">Clicks</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[320px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString()}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="hsl(235 81% 58%)"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="hsl(160 67% 45%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
