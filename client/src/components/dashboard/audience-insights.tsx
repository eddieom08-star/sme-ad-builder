import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserSearch } from "lucide-react";

interface AgeDistributionProps {
  distribution: Record<string, number>;
  isLoading?: boolean;
}

function AgeDistribution({ distribution, isLoading = false }: AgeDistributionProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(distribution).map(([age, percentage]) => (
        <div key={age}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">{age}</span>
            <span className="text-slate-800 font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>
      ))}
    </div>
  );
}

interface GenderDistributionProps {
  distribution: { female: number; male: number };
  isLoading?: boolean;
}

function GenderDistribution({ distribution, isLoading = false }: GenderDistributionProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Skeleton className="h-[100px] w-[200px]" />
      </div>
    );
  }

  return (
    <div className="h-[100px] flex items-center justify-center">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center"
            style={{ borderWidth: "0.25rem" }}
          >
            <span className="text-sm font-bold text-primary">{distribution.female}%</span>
          </div>
          <span className="text-xs text-slate-600 mt-1">Female</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full border-4 border-teal-400 flex items-center justify-center"
            style={{ borderWidth: "0.25rem" }}
          >
            <span className="text-sm font-bold text-teal-500">{distribution.male}%</span>
          </div>
          <span className="text-xs text-slate-600 mt-1">Male</span>
        </div>
      </div>
    </div>
  );
}

interface TopInterestsProps {
  interests: Array<{ name: string; percentage: number }>;
  isLoading?: boolean;
}

function TopInterests({ interests, isLoading = false }: TopInterestsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 w-24" />
        ))}
      </div>
    );
  }

  // Function to determine badge color
  const getBadgeColor = (index: number) => {
    const colors = [
      "w-1.5 h-1.5 inline-block bg-primary rounded-full mr-1",
      "w-1.5 h-1.5 inline-block bg-primary rounded-full mr-1",
      "w-1.5 h-1.5 inline-block bg-teal-400 rounded-full mr-1",
      "w-1.5 h-1.5 inline-block bg-teal-400 rounded-full mr-1", 
      "w-1.5 h-1.5 inline-block bg-amber-500 rounded-full mr-1"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex flex-wrap gap-2">
      {interests.map((interest, index) => (
        <span 
          key={interest.name} 
          className="px-2 py-1 bg-white text-xs font-medium text-slate-700 rounded-full border border-slate-200"
        >
          <span className={getBadgeColor(index)}></span>
          {interest.name} ({interest.percentage}%)
        </span>
      ))}
    </div>
  );
}

export function AudienceInsights() {
  const { data: audience, isLoading } = useQuery({
    queryKey: ["/api/audience"]
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Audience Insights</CardTitle>
        <Button variant="link">Refine Targeting</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-500 mb-2">Age Distribution</h4>
            <AgeDistribution 
              distribution={audience?.ageDistribution || {}} 
              isLoading={isLoading} 
            />
          </div>
          
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-medium text-slate-500 mb-2">Gender Distribution</h4>
            <GenderDistribution 
              distribution={audience?.genderDistribution || { female: 0, male: 0 }} 
              isLoading={isLoading} 
            />
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h4 className="text-sm font-medium text-slate-500 mb-3">Top Interests</h4>
          <TopInterests 
            interests={audience?.interests || []} 
            isLoading={isLoading} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Alert className="mt-2 bg-teal-50 border-teal-100">
          <UserSearch className="h-4 w-4 text-teal-500" />
          <AlertTitle className="text-sm font-medium text-teal-700">Targeting Opportunity</AlertTitle>
          <AlertDescription className="text-xs text-slate-700">
            Your ads are performing 43% better with coastal lifestyle enthusiasts. Consider refining your targeting to focus more on this audience segment.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}
