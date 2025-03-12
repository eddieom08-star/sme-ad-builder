import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, Eye, MousePointerClick, Percent, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  changeValue: string;
  changeDirection: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconBgClass: string;
  iconColor: string;
  isLoading: boolean;
}

function MetricCard({
  title,
  value,
  changeValue,
  changeDirection,
  icon,
  iconBgClass,
  iconColor,
  isLoading
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            )}
            <div className="flex items-center mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <>
                  <span className={`flex items-center text-sm font-medium ${
                    changeDirection === "up" 
                      ? "text-green-600" 
                      : changeDirection === "down" 
                        ? "text-red-600" 
                        : "text-slate-600"
                  }`}>
                    {changeDirection === "up" && <ArrowUp className="mr-1 h-3 w-3" />}
                    {changeDirection === "down" && <ArrowDown className="mr-1 h-3 w-3" />}
                    {changeValue}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">vs last period</span>
                </>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-lg ${iconBgClass} ${iconColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceSummary() {
  const [timeframe, setTimeframe] = useState("7");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/metrics", { timeframe }],
  });

  // Get the most recent metrics data for display
  const recentMetrics = metrics ? metrics[0] : null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Performance Summary</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Impressions"
          value={isLoading ? "" : recentMetrics?.impressions.toLocaleString() || "24,563"}
          changeValue="12.5%"
          changeDirection="up"
          icon={<Eye className="h-5 w-5" />}
          iconBgClass="bg-primary-50"
          iconColor="text-primary"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Clicks"
          value={isLoading ? "" : recentMetrics?.clicks.toLocaleString() || "1,728"}
          changeValue="8.3%"
          changeDirection="up"
          icon={<MousePointerClick className="h-5 w-5" />}
          iconBgClass="bg-teal-100"
          iconColor="text-teal-500"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Conversion Rate"
          value={isLoading ? "" : recentMetrics?.conversionRate || "4.2%"}
          changeValue="1.2%"
          changeDirection="down"
          icon={<Percent className="h-5 w-5" />}
          iconBgClass="bg-amber-100"
          iconColor="text-amber-500"
          isLoading={isLoading}
        />
        
        <MetricCard 
          title="Marketing ROI"
          value={isLoading ? "" : recentMetrics?.roi || "320%"}
          changeValue="15.8%"
          changeDirection="up"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBgClass="bg-green-100"
          iconColor="text-green-600"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
