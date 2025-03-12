import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowUp, ArrowDown, ArrowRight, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface KeywordItemProps {
  text: string;
  clicks: number;
  ctr: string;
  status: string;
  isLoading?: boolean;
}

function KeywordItem({ text, clicks, ctr, status, isLoading = false }: KeywordItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "growing":
        return <ArrowUp className="mr-1 h-3 w-3" />;
      case "declining":
        return <ArrowDown className="mr-1 h-3 w-3" />;
      case "stable":
        return <ArrowRight className="mr-1 h-3 w-3" />;
      case "new":
        return <Plus className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "growing":
        return "bg-green-100 text-green-600";
      case "declining":
        return "bg-red-100 text-red-600";
      case "stable":
        return "bg-amber-100 text-amber-600";
      case "new":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (isLoading) {
    return (
      <tr className="border-t border-slate-200">
        <td className="py-3">
          <Skeleton className="h-5 w-24" />
        </td>
        <td className="py-3 text-center">
          <Skeleton className="h-5 w-12 mx-auto" />
        </td>
        <td className="py-3 text-center">
          <Skeleton className="h-5 w-12 mx-auto" />
        </td>
        <td className="py-3 text-center">
          <Skeleton className="h-5 w-16 mx-auto" />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-slate-200">
      <td className="py-3 text-sm font-medium text-slate-800">{text}</td>
      <td className="py-3 text-sm text-center text-slate-600">{clicks}</td>
      <td className="py-3 text-sm text-center text-slate-600">{ctr}</td>
      <td className="py-3 text-center">
        <Badge variant="outline" className={`inline-flex items-center ${getStatusColor()}`}>
          {getStatusIcon()}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </td>
    </tr>
  );
}

export function KeywordPerformance() {
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"]
  });

  const { data: keywords, isLoading: keywordsLoading } = useQuery({
    queryKey: [
      "/api/campaigns/1/keywords",
      // Use the first campaign ID if available
      campaigns && campaigns.length > 0 ? campaigns[0].id : undefined,
    ],
    enabled: !!campaigns && campaigns.length > 0,
  });

  const isLoading = campaignsLoading || keywordsLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Keyword Performance</CardTitle>
        <Button variant="link">Optimize Now</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-xs font-medium text-slate-500 text-left pb-3">Keyword</th>
                <th className="text-xs font-medium text-slate-500 text-center pb-3">Clicks</th>
                <th className="text-xs font-medium text-slate-500 text-center pb-3">CTR</th>
                <th className="text-xs font-medium text-slate-500 text-center pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <KeywordItem 
                    key={i}
                    text=""
                    clicks={0}
                    ctr=""
                    status=""
                    isLoading={true}
                  />
                ))
              ) : keywords && keywords.length > 0 ? (
                keywords.map((keyword: any) => (
                  <KeywordItem 
                    key={keyword.id}
                    text={keyword.text}
                    clicks={keyword.clicks}
                    ctr={keyword.ctr}
                    status={keyword.status}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                    No keywords found. Start by adding keywords to your campaigns.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter>
        <Alert className="mt-4 bg-primary-50 border-primary-100">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-medium text-primary-700">AI Suggestion</AlertTitle>
          <AlertDescription className="text-xs text-slate-700">
            Consider adding "bohemian jewelry" and "coastal accessories" to your keyword targeting based on your audience interests.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}
