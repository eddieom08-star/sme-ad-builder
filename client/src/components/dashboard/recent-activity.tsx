import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket, LineChart, Lightbulb, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface ActivityItemProps {
  description: string;
  timestamp: string;
  type: string;
  isLoading?: boolean;
}

function ActivityItem({ description, timestamp, type, isLoading = false }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case "campaign_launched":
      case "campaign_created":
        return <Rocket className="text-xs text-primary" />;
      case "report_ready":
        return <LineChart className="text-xs text-teal-500" />;
      case "ai_suggestion":
        return <Lightbulb className="text-xs text-amber-500" />;
      case "budget_changed":
        return <TrendingUp className="text-xs text-green-600" />;
      default:
        return <Rocket className="text-xs text-primary" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "campaign_launched":
      case "campaign_created":
        return "border-primary";
      case "report_ready":
        return "border-teal-400";
      case "ai_suggestion":
        return "border-amber-500";
      case "budget_changed":
        return "border-green-600";
      default:
        return "border-slate-300";
    }
  };

  if (isLoading) {
    return (
      <div className="relative mb-4">
        <div className="absolute -left-3 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 border-slate-200">
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
        <div className="pl-4">
          <Skeleton className="h-5 w-full max-w-md mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mb-4">
      <div className={`absolute -left-3 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 ${getBorderColor()}`}>
        {getIcon()}
      </div>
      <div className="pl-4">
        <p className="text-sm font-medium text-slate-800">{description}</p>
        <p className="text-xs text-slate-500 mt-1">{timestamp}</p>
      </div>
    </div>
  );
}

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"]
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="link">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 pb-1">
          <div className="absolute top-0 left-0 h-full w-px bg-slate-200"></div>
          
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <ActivityItem 
                key={i}
                description=""
                timestamp=""
                type=""
                isLoading={true}
              />
            ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity: any) => (
              <ActivityItem 
                key={activity.id}
                description={activity.description}
                timestamp={formatTimestamp(activity.timestamp)}
                type={activity.type}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500 py-4">No recent activities found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
