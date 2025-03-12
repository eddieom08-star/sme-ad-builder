import { Header } from "@/components/layout/header";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { PerformanceSummary } from "@/components/dashboard/performance-summary";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ActiveCampaigns } from "@/components/dashboard/active-campaigns";
import { KeywordPerformance } from "@/components/dashboard/keyword-performance";
import { AudienceInsights } from "@/components/dashboard/audience-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard Overview" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <WelcomeCard />
        
        <PerformanceSummary />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <PerformanceChart />
          <ActiveCampaigns />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <KeywordPerformance />
          <AudienceInsights />
        </div>
        
        <RecentActivity />
      </main>
    </div>
  );
}
