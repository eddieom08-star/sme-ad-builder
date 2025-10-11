"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Bell, Shield, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SettingsFormProps {
  user: any; // Clerk user object
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    campaignUpdates: true,
    budgetAlerts: true,
    aiSuggestions: true,
    marketingTips: false,
  });

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement profile update via Clerk
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    }, 1000);
  };

  const handleSaveBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement business settings save to database
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Business settings saved",
        description: "Your business information has been updated.",
      });
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsSubmitting(true);

    // TODO: Save notification preferences to database
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Preferences saved",
        description: "Your notification settings have been updated.",
      });
    }, 1000);
  };

  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userImage = user?.imageUrl || "";

  return (
    <Tabs defaultValue="profile" className="space-y-4 lg:space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        <TabsTrigger value="profile" className="text-xs lg:text-sm">
          <User className="h-4 w-4 mr-1 lg:mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="business" className="text-xs lg:text-sm">
          <Building2 className="h-4 w-4 mr-1 lg:mr-2" />
          Business
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs lg:text-sm">
          <Bell className="h-4 w-4 mr-1 lg:mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="security" className="text-xs lg:text-sm">
          <Shield className="h-4 w-4 mr-1 lg:mr-2" />
          Security
        </TabsTrigger>
      </TabsList>

      {/* Profile Settings */}
      <TabsContent value="profile">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your personal account details and preferences
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4 lg:space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 lg:h-20 lg:w-20">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="text-lg lg:text-xl">
                    {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <Button type="button" variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Managed by your account provider
                  </p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={user?.firstName || ""}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={user?.lastName || ""}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={userEmail}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email is managed by your authentication provider
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user?.username || ""}
                  placeholder="johndoe"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      {/* Business Settings */}
      <TabsContent value="business">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and marketing preferences
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveBusiness}>
            <CardContent className="space-y-4 lg:space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              {/* Business Description */}
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description</Label>
                <Textarea
                  id="businessDescription"
                  name="businessDescription"
                  rows={4}
                  placeholder="Tell us about your business..."
                  className="resize-none"
                />
              </div>

              {/* Industry & Size */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select name="industry" defaultValue="">
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Professional Services</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessSize">Business Size</Label>
                  <Select name="businessSize" defaultValue="">
                    <SelectTrigger id="businessSize">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Entrepreneur</SelectItem>
                      <SelectItem value="2-10">2-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201+">201+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://www.example.com"
                />
              </div>

              {/* Timezone & Currency */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select name="timezone" defaultValue="UTC">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="USD">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Business Info
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      {/* Notification Settings */}
      <TabsContent value="notifications">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what updates you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Email Notifications</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-0.5">
                    <Label htmlFor="campaignUpdates" className="font-normal">
                      Campaign Performance Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Weekly summary of your campaign performance
                    </p>
                  </div>
                  <Switch
                    id="campaignUpdates"
                    checked={notificationSettings.campaignUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, campaignUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-0.5">
                    <Label htmlFor="budgetAlerts" className="font-normal">
                      Budget Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when reaching 80% of campaign budget
                    </p>
                  </div>
                  <Switch
                    id="budgetAlerts"
                    checked={notificationSettings.budgetAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, budgetAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-0.5">
                    <Label htmlFor="aiSuggestions" className="font-normal">
                      AI Optimization Suggestions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receive AI-powered recommendations for your campaigns
                    </p>
                  </div>
                  <Switch
                    id="aiSuggestions"
                    checked={notificationSettings.aiSuggestions}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, aiSuggestions: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex-1 space-y-0.5">
                    <Label htmlFor="marketingTips" className="font-normal">
                      Marketing Tips & Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Educational content and industry best practices
                    </p>
                  </div>
                  <Switch
                    id="marketingTips"
                    checked={notificationSettings.marketingTips}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, marketingTips: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
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

      {/* Security Settings */}
      <TabsContent value="security">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clerk Managed */}
            <div className="rounded-lg border border-muted bg-muted/50 p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Authentication Security
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your password, two-factor authentication, and security settings are managed by your authentication provider.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="https://accounts.clerk.dev" target="_blank" rel="noopener noreferrer">
                      Manage Security Settings
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Active Sessions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">
                      {typeof window !== "undefined" && navigator.userAgent}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">Active now</div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
              <div className="rounded-lg border border-destructive/50 p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
