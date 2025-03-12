import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { Campaign } from "@shared/schema";

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [timeframe, setTimeframe] = useState("7"); // 7, 30, 90, 365 days
  
  // Get campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"]
  });

  // Get metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/metrics", { campaignId: selectedCampaign, timeframe }]
  });

  // Format data for charts
  const prepareChartData = () => {
    if (!metrics) return [];
    
    // Sort by date ascending
    return [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(metric => ({
        date: format(new Date(metric.date), 'MMM dd'),
        impressions: metric.impressions,
        clicks: metric.clicks,
        conversions: metric.conversions,
        conversionRate: parseFloat(metric.conversionRate),
        roi: parseFloat(metric.roi)
      }));
  };

  const chartData = prepareChartData();

  // Calculate summary metrics
  const calculateSummary = () => {
    if (!metrics || metrics.length === 0) return {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      avgConversionRate: '0%',
      avgRoi: '0%'
    };
    
    const totalImpressions = metrics.reduce((sum, metric) => sum + metric.impressions, 0);
    const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
    const totalConversions = metrics.reduce((sum, metric) => sum + metric.conversions, 0);
    
    const avgConversionRate = totalClicks > 0 
      ? ((totalConversions / totalClicks) * 100).toFixed(1) + '%'
      : '0%';
      
    const avgRoi = metrics.reduce((sum, metric) => sum + parseFloat(metric.roi), 0) / metrics.length;
    
    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      avgConversionRate,
      avgRoi: avgRoi.toFixed(0) + '%'
    };
  };

  const summary = calculateSummary();
  
  // Mock platform distribution data
  const platformData = [
    { name: "Google Ads", value: 45 },
    { name: "Facebook", value: 25 },
    { name: "Instagram", value: 20 },
    { name: "TikTok", value: 10 }
  ];
  
  // Colors for charts
  const COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444"];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Analytics" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-slate-800">Campaign Analytics</h1>
            <p className="text-sm text-slate-500">Track and analyze your marketing performance</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download report</span>
            </Button>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-500 mb-1">Impressions</div>
              {metricsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(summary.totalImpressions)}</div>
              )}
              <div className="mt-2 flex items-baseline text-sm">
                <div className="text-success">+12.3%</div>
                <div className="ml-1 text-slate-500">vs previous period</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-500 mb-1">Clicks</div>
              {metricsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatNumber(summary.totalClicks)}</div>
              )}
              <div className="mt-2 flex items-baseline text-sm">
                <div className="text-success">+8.7%</div>
                <div className="ml-1 text-slate-500">vs previous period</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-500 mb-1">Conversion Rate</div>
              {metricsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{summary.avgConversionRate}</div>
              )}
              <div className="mt-2 flex items-baseline text-sm">
                <div className="text-error">-2.1%</div>
                <div className="ml-1 text-slate-500">vs previous period</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-slate-500 mb-1">ROI</div>
              {metricsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{summary.avgRoi}</div>
              )}
              <div className="mt-2 flex items-baseline text-sm">
                <div className="text-success">+15.2%</div>
                <div className="ml-1 text-slate-500">vs previous period</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Impressions, clicks, and conversions over time</CardDescription>
                </div>
                <Select 
                  value={selectedCampaign} 
                  onValueChange={setSelectedCampaign}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All campaigns</SelectItem>
                    {campaignsLoading ? (
                      <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                    ) : campaigns?.length > 0 ? (
                      campaigns.map((campaign: Campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id.toString()}>
                          {campaign.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No campaigns found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : chartData.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
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
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="impressions" 
                        name="Impressions" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="clicks" 
                        name="Clicks" 
                        stroke="#14B8A6" 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="conversions" 
                        name="Conversions" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <div className="text-center p-4">
                    <Filter className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No data available</h3>
                    <p className="mt-1 text-sm text-slate-500">Try selecting a different timeframe or campaign.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>Ad performance by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Click-Through Rate</CardTitle>
                  <CardDescription>CTR trend over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : chartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Area
                            type="monotone"
                            dataKey="conversionRate"
                            name="CTR"
                            stroke="#6366F1"
                            fillOpacity={1}
                            fill="url(#colorCtr)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-slate-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>ROI Performance</CardTitle>
                  <CardDescription>Return on investment over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : chartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Bar dataKey="roi" name="ROI" fill="#14B8A6" barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-slate-500">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Comparative analysis of all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaigns?.map((campaign: Campaign) => ({
                        name: campaign.name,
                        impressions: Math.floor(Math.random() * 50000) + 10000,
                        clicks: Math.floor(Math.random() * 5000) + 500,
                        conversions: Math.floor(Math.random() * 500) + 50,
                        roi: Math.floor(Math.random() * 400) + 100
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis yAxisId="left" orientation="left" stroke="#6366F1" />
                      <YAxis yAxisId="right" orientation="right" stroke="#14B8A6" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#6366F1" />
                      <Bar yAxisId="right" dataKey="clicks" name="Clicks" fill="#14B8A6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roi">
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
                <CardDescription>Detailed return on investment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="roi"
                        name="ROI"
                        stroke="#6366F1"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="conversion">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Track user journey from impression to conversion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { stage: "Impressions", value: summary.totalImpressions },
                        { stage: "Clicks", value: summary.totalClicks },
                        { stage: "Sign-ups", value: Math.round(summary.totalClicks * 0.3) },
                        { stage: "Conversions", value: summary.totalConversions }
                      ].reverse()}
                      margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={formatNumber} />
                      <YAxis type="category" dataKey="stage" />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Bar dataKey="value" name="Count" fill="#6366F1">
                        {[
                          { value: summary.totalImpressions },
                          { value: summary.totalClicks },
                          { value: Math.round(summary.totalClicks * 0.3) },
                          { value: summary.totalConversions }
                        ].reverse().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
