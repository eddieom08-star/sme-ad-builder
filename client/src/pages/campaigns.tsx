import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CampaignForm } from "@/components/campaign/campaign-form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreHorizontal, PlusCircle, Eye, Edit, Pause, Play, Trash } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function Campaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["/api/campaigns"]
  });

  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Campaign> }) => {
      const res = await apiRequest("PATCH", `/api/campaigns/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign updated",
        description: "The campaign has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete campaign: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaignMutation.mutate({
      id: campaign.id,
      data: { status: newStatus }
    });
  };

  // Format budget values from cents to dollars
  const formatBudget = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  // Format date values
  const formatDate = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  // Get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active": return "success";
      case "paused": return "secondary";
      case "ended": return "destructive";
      case "review": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Campaigns" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Campaigns</CardTitle>
              <CardDescription>
                Manage and track all your advertising campaigns.
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <CampaignForm onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
                }} />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-[40px] w-full" />
                <Skeleton className="h-[40px] w-full" />
                <Skeleton className="h-[40px] w-full" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign: Campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.platforms.join(", ")}</TableCell>
                      <TableCell>
                        {formatBudget(campaign.spent)} / {formatBudget(campaign.budget)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-500">
                          <div>{formatDate(campaign.startDate)}</div>
                          <div>to {formatDate(campaign.endDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <Progress
                            value={Math.round((campaign.spent / campaign.budget) * 100)}
                            className="h-1.5"
                          />
                          <div className="text-xs text-slate-500 mt-1">
                            {Math.round((campaign.spent / campaign.budget) * 100)}% spent
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(campaign)}>
                              {campaign.status === "active" ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Campaign
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate Campaign
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium text-slate-900">No campaigns yet</h3>
                <p className="mt-1 text-sm text-slate-500">Get started by creating a new campaign.</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <CampaignForm onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
