import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CampaignForm } from "@/components/campaign/campaign-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "@shared/schema";

interface CampaignItemProps {
  campaign: Campaign;
  isLoading?: boolean;
}

function CampaignItem({ campaign, isLoading = false }: CampaignItemProps) {
  // Calculate progress as percentage
  const progress = Math.round((campaign.spent / campaign.budget) * 100);
  
  // Format the budget values
  const formatBudget = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };
  
  // Determine status badge color
  const getBadgeVariant = (status: string) => {
    switch(status) {
      case "active": return "success";
      case "review": return "warning";
      case "paused": return "secondary";
      case "ended": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full" />
      </div>
    );
  }

  return (
    <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-800">{campaign.name}</h4>
        <Badge variant={getBadgeVariant(campaign.status)}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{campaign.platforms.join(", ")}</span>
        <span className="text-xs font-medium text-slate-700">
          {formatBudget(campaign.spent)} / {formatBudget(campaign.budget)}
        </span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
}

export function ActiveCampaigns() {
  const queryClient = useQueryClient();
  
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns"]
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Active Campaigns</CardTitle>
        <Button variant="link" asChild>
          <Link href="/campaigns">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <CampaignItem key={i} campaign={{} as Campaign} isLoading={true} />
          ))
        ) : campaigns && campaigns.length > 0 ? (
          campaigns.slice(0, 3).map((campaign: Campaign) => (
            <CampaignItem key={campaign.id} campaign={campaign} />
          ))
        ) : (
          <p className="text-sm text-slate-500 py-2">No active campaigns found.</p>
        )}
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-3" size="lg">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CampaignForm onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
            }} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
