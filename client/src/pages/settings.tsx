import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Share2, 
  HelpCircle,
  CheckCircle2,
  Save,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/me"]
  });

  const handleSaveChanges = (formType: string) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Settings saved",
        description: `Your ${formType} settings have been updated.`,
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Account Settings</h1>
            <p className="text-sm text-slate-500">Manage your account preferences and settings</p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden md:inline">Support</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details and business information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="name">Full Name</Label>
                      {userLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Input 
                          id="name" 
                          defaultValue={user?.username || "Sarah Johnson"} 
                        />
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="email">Email Address</Label>
                      {userLoading ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user?.email || "sarah@coastalcreations.com"} 
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    {userLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="business-name" 
                        defaultValue={user?.businessName || "Coastal Creations"} 
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business-description">Business Description</Label>
                    <Textarea 
                      id="business-description" 
                      rows={4}
                      defaultValue="We create handcrafted coastal-inspired jewelry using sustainable materials. Our pieces are designed to capture the beauty of the ocean and beach lifestyle."
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="industry">Industry</Label>
                      <Select defaultValue="jewelry">
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jewelry">Jewelry & Accessories</SelectItem>
                          <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                          <SelectItem value="home">Home & Decor</SelectItem>
                          <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                          <SelectItem value="art">Art & Collectibles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="business-size">Business Size</Label>
                      <Select defaultValue="small">
                        <SelectTrigger id="business-size">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Solo Entrepreneur</SelectItem>
                          <SelectItem value="small">Small Business (1-10)</SelectItem>
                          <SelectItem value="medium">Medium Business (11-50)</SelectItem>
                          <SelectItem value="large">Large Business (51+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input 
                      id="website" 
                      type="url" 
                      placeholder="https://www.yourwebsite.com" 
                      defaultValue="https://www.coastalcreations.com"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveChanges("profile")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">Current Plan</h3>
                        <div className="flex items-center mt-1">
                          <Badge className="mr-2 bg-primary">Pro</Badge>
                          <span className="text-sm text-slate-500">$49/month</span>
                        </div>
                      </div>
                      <Button variant="outline">Change Plan</Button>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>Unlimited campaigns</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>Advanced analytics</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                        <span>AI-powered optimization</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Payment Methods</h3>
                    <div className="border rounded-lg p-4 mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-8 bg-slate-800 rounded mr-4 flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <div className="font-medium">Visa ending in 4242</div>
                          <div className="text-sm text-slate-500">Expires 12/2025</div>
                        </div>
                      </div>
                      <Badge variant="outline">Default</Badge>
                    </div>
                    <Button variant="outline">Add Payment Method</Button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Billing History</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">May 15, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">$49.00</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">April 15, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">$49.00</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">March 15, 2023</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">$49.00</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">Download</Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Campaign Performance Updates</div>
                          <div className="text-sm text-slate-500">Receive weekly summary reports of your campaigns</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Budget Alerts</div>
                          <div className="text-sm text-slate-500">Get notified when you reach 80% of your campaign budget</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">AI Optimization Suggestions</div>
                          <div className="text-sm text-slate-500">Recommendations for improving your campaigns</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Marketing Tips & News</div>
                          <div className="text-sm text-slate-500">Educational content and industry updates</div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg mb-2">Notification Frequency</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="frequency-realtime"
                          name="notification-frequency"
                          className="h-4 w-4 rounded-full border-slate-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="frequency-realtime" className="ml-2 block text-sm font-medium">
                          Real-time (as they happen)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="frequency-daily"
                          name="notification-frequency"
                          className="h-4 w-4 rounded-full border-slate-300 text-primary focus:ring-primary"
                          checked
                        />
                        <label htmlFor="frequency-daily" className="ml-2 block text-sm font-medium">
                          Daily digest
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="frequency-weekly"
                          name="notification-frequency"
                          className="h-4 w-4 rounded-full border-slate-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="frequency-weekly" className="ml-2 block text-sm font-medium">
                          Weekly summary
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveChanges("notification")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>
                    Manage your account security and data privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Account Security</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" className="mt-1" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" className="mt-1" />
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        Password must be at least 8 characters and include a number and a special character.
                      </div>
                      <div>
                        <Button>Update Password</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Enable Two-Factor Authentication</div>
                        <div className="text-sm text-slate-500">Add an extra layer of security to your account</div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Data Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Data Analytics Sharing</div>
                          <div className="text-sm text-slate-500">Allow anonymized data to improve our services</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Third-Party Cookies</div>
                          <div className="text-sm text-slate-500">Enable cookies for better ad targeting</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline">Download My Data</Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={() => handleSaveChanges("privacy")}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Integrations & API</CardTitle>
                  <CardDescription>
                    Connect with other services and manage API access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-4">Connected Platforms</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Facebook</div>
                            <div className="text-sm text-slate-500">Connected on May 10, 2023</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mr-4">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.897 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.897-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Instagram</div>
                            <div className="text-sm text-slate-500">Connected on May 10, 2023</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-4">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">YouTube</div>
                            <div className="text-sm text-slate-500">Not connected</div>
                          </div>
                        </div>
                        <Button>Connect</Button>
                      </div>
                      
                      <div className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mr-4">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Twitter</div>
                            <div className="text-sm text-slate-500">Not connected</div>
                          </div>
                        </div>
                        <Button>Connect</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">API Access</h3>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <div className="font-medium">API Key</div>
                        <div className="mt-2 flex">
                          <Input 
                            readOnly 
                            defaultValue="sk_********************************************" 
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" className="ml-2">Show</Button>
                          <Button variant="outline" className="ml-2">Copy</Button>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button>Regenerate API Key</Button>
                        <div className="mt-2 text-sm text-slate-500">
                          Last regenerated on April 30, 2023. Regenerating will invalidate your existing key.
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View API Documentation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle>Help & Support</CardTitle>
                  <CardDescription>
                    Get help and learn more about Thirty Twenty
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6 space-y-4">
                      <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Knowledge Base</h3>
                      <p className="text-sm text-slate-500">
                        Browse our comprehensive guides and tutorials to get the most out of Thirty Twenty.
                      </p>
                      <Button variant="outline" className="w-full">
                        Browse Articles <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-6 space-y-4">
                      <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium">Contact Support</h3>
                      <p className="text-sm text-slate-500">
                        Need personalized help? Our support team is ready to assist you.
                      </p>
                      <Button className="w-full">
                        Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">How do I create my first campaign?</h4>
                        <p className="mt-2 text-sm text-slate-500">
                          To create your first campaign, click on the "New Campaign" button in the top navigation bar or from the dashboard. Follow the step-by-step wizard to set up your campaign.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">How does the AI optimization work?</h4>
                        <p className="mt-2 text-sm text-slate-500">
                          Our AI analyzes your campaign performance data and audience behavior to provide recommendations for keywords, targeting, and budget allocation to maximize your ROI.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Can I connect my social media accounts?</h4>
                        <p className="mt-2 text-sm text-slate-500">
                          Yes, you can connect your Facebook, Instagram, Twitter, and other social media accounts through the Integrations tab in your settings.
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">How do I upgrade my subscription?</h4>
                        <p className="mt-2 text-sm text-slate-500">
                          You can upgrade your subscription in the Billing section of your settings. Choose from our various plans to find the one that best fits your needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function MessageCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
