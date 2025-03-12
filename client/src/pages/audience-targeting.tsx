import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Users,
  Filter,
  Lightbulb,
  PieChart,
  Target,
  MapPin,
  Clock,
  Languages,
  UserSearch,
  Smartphone,
  Globe2
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import type { Audience } from "@shared/schema";

export default function AudienceTargeting() {
  const [selectedTab, setSelectedTab] = useState("insights");
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [genderBalance, setGenderBalance] = useState(50);
  
  const { data: audience, isLoading } = useQuery({
    queryKey: ["/api/audience"]
  });

  // Convert audience age distribution to recharts format
  const getAgeData = () => {
    if (!audience?.ageDistribution) return [];
    
    return Object.entries(audience.ageDistribution).map(([range, value]) => ({
      name: range,
      value: value
    }));
  };

  // Convert audience gender distribution to recharts format
  const getGenderData = () => {
    if (!audience?.genderDistribution) return [];
    
    return [
      { name: "Female", value: audience.genderDistribution.female },
      { name: "Male", value: audience.genderDistribution.male }
    ];
  };

  // Prepare interests data for bar chart
  const getInterestsData = () => {
    if (!audience?.interests) return [];
    
    return audience.interests.sort((a, b) => b.percentage - a.percentage);
  };

  // Colors for pie chart
  const GENDER_COLORS = ["#6366F1", "#14B8A6"];

  // Mocked location data for targeting
  const locationData = [
    { name: "United States", percentage: 65 },
    { name: "Canada", percentage: 15 },
    { name: "United Kingdom", percentage: 10 },
    { name: "Australia", percentage: 5 },
    { name: "Other", percentage: 5 }
  ];
  
  // Mocked device data
  const deviceData = [
    { name: "Mobile", value: 58 },
    { name: "Desktop", value: 36 },
    { name: "Tablet", value: 6 }
  ];

  // Mocked time data
  const timeData = [
    { name: "Morning (6am-12pm)", value: 25 },
    { name: "Afternoon (12pm-5pm)", value: 30 },
    { name: "Evening (5pm-10pm)", value: 35 },
    { name: "Night (10pm-6am)", value: 10 }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Audience Targeting" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insights">Audience Insights</TabsTrigger>
            <TabsTrigger value="targeting">Targeting Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Demographics</CardTitle>
                  <CardDescription>
                    Age and gender distribution of your audience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-6">
                      <Skeleton className="h-40 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-3">Age Distribution</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={getAgeData()}
                              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => `${value}%`} />
                              <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                              <Bar dataKey="value" fill="#6366F1" barSize={30} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-slate-500 mb-3">Gender Distribution</h3>
                        <div className="h-48 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={getGenderData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                              >
                                {getGenderData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Top Interests</CardTitle>
                  <CardDescription>
                    What your audience cares about most.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={getInterestsData()}
                          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip formatter={(value) => [`${value}%`, "Interest Level"]} />
                          <Bar dataKey="percentage" fill="#14B8A6" barSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Alert className="bg-primary-50 border-primary-100">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm font-medium text-primary-700">Targeting Tip</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      Focus your ad messaging on the top 3 interests to maximize engagement and conversion rates.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Location</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationData.map((location) => (
                      <div key={location.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{location.name}</span>
                          <span className="font-medium">{location.percentage}%</span>
                        </div>
                        <Progress value={location.percentage} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Devices</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          fill="#6366F1"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          <Cell fill="#6366F1" />
                          <Cell fill="#14B8A6" />
                          <Cell fill="#F59E0B" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Active Times</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeData.map((time) => (
                      <div key={time.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{time.name}</span>
                          <span className="font-medium">{time.value}%</span>
                        </div>
                        <Progress value={time.value} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="targeting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Targeting Tools</CardTitle>
                <CardDescription>
                  Fine-tune your audience parameters to reach ideal customers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
                        <span className="text-xs text-slate-500">Selected: {ageRange[1] - ageRange[0]} years</span>
                      </div>
                      <Slider
                        defaultValue={ageRange}
                        min={13}
                        max={65}
                        step={1}
                        onValueChange={(values: number[]) => setAgeRange(values)}
                        className="my-4"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Gender Balance</Label>
                        <span className="text-xs text-slate-500">Female: {100 - genderBalance}% / Male: {genderBalance}%</span>
                      </div>
                      <Slider
                        defaultValue={[genderBalance]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(values: number[]) => setGenderBalance(values[0])}
                        className="my-4"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Locations</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="Select locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="custom">Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Languages</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All languages</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="custom">Multiple...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Interest Categories</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer border-primary bg-primary-50">
                          <span>Fashion</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-primary">
                            <span>✓</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer">
                          <span>Sports</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                            <span>+</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer border-primary bg-primary-50">
                          <span>Travel</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-primary">
                            <span>✓</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer border-primary bg-primary-50">
                          <span>Home Decor</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-primary">
                            <span>✓</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer">
                          <span>Technology</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                            <span>+</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer">
                          <span>Beauty</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                            <span>+</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer border-primary bg-primary-50">
                          <span>DIY Crafts</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-primary">
                            <span>✓</span>
                          </Button>
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-between px-3 py-2 cursor-pointer">
                          <span>Food</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                            <span>+</span>
                          </Button>
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Devices</Label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="device-mobile"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="device-mobile" className="ml-2 text-sm">Mobile Devices</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="device-desktop"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="device-desktop" className="ml-2 text-sm">Desktop Computers</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="device-tablet"
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <label htmlFor="device-tablet" className="ml-2 text-sm">Tablets</label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Advanced Targeting</Label>
                      <Select defaultValue="browsing">
                        <SelectTrigger>
                          <SelectValue placeholder="Select targeting approach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="browsing">Browsing Behavior</SelectItem>
                          <SelectItem value="lookalike">Lookalike Audiences</SelectItem>
                          <SelectItem value="custom">Custom Segments</SelectItem>
                          <SelectItem value="retargeting">Retargeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Default</Button>
                <Button>Apply to Campaigns</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Audience Targeting Recommendations</CardTitle>
                <CardDescription>
                  AI-powered suggestions to improve your campaign targeting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-primary-50 border-primary-100">
                    <UserSearch className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm font-medium text-primary-700">Coastal Lifestyle Enthusiasts</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      Your ads are performing 43% better with coastal lifestyle enthusiasts. Consider refining your targeting to focus more on this audience segment.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-amber-50 border-amber-100">
                    <Target className="h-4 w-4 text-amber-500" />
                    <AlertTitle className="text-sm font-medium text-amber-700">Age Group Optimization</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      The 25-34 age group shows the highest engagement rate. Consider allocating more budget to this demographic.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-teal-50 border-teal-100">
                    <Globe2 className="h-4 w-4 text-teal-500" />
                    <AlertTitle className="text-sm font-medium text-teal-700">Geographic Opportunity</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      There's untapped potential in west coast metropolitan areas. Expanding your targeting to include San Francisco, Seattle, and Portland could increase conversions.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-blue-50 border-blue-100">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <AlertTitle className="text-sm font-medium text-blue-700">Timing Adjustment</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      Your audience is most active between 6-9pm. Scheduling your ads to run during this timeframe could improve engagement by up to 28%.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
