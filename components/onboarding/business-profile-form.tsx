"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useOnboardingStore, BUSINESS_CATEGORIES } from "@/lib/store/onboarding";
import { businessProfileSchema, type BusinessProfileFormData } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Save, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
] as const;

export function BusinessProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const {
    businessProfile,
    updateBusinessProfile,
    markStepComplete,
    setCurrentStep,
    updateLastSaved
  } = useOnboardingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    mode: "onChange",
    defaultValues: {
      businessName: businessProfile.businessName || "",
      category: businessProfile.category || "",
      services: businessProfile.services || [],
      description: businessProfile.description || "",
      location: {
        address: businessProfile.location?.address || "",
        city: businessProfile.location?.city || "",
        state: businessProfile.location?.state || "",
        zipCode: businessProfile.location?.zipCode || "",
        serviceRadius: businessProfile.location?.serviceRadius || 10,
      },
      contact: {
        phone: businessProfile.contact?.phone || "",
        email: businessProfile.contact?.email || "",
        website: businessProfile.contact?.website || "",
      },
      hours: businessProfile.hours || {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "10:00", close: "14:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      },
    },
  });

  const formData = watch();

  // Auto-save to Zustand store
  useEffect(() => {
    const timer = setTimeout(() => {
      updateBusinessProfile(formData);
      updateLastSaved();
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, updateBusinessProfile, updateLastSaved]);

  // Handle services
  useEffect(() => {
    if (businessProfile.services) {
      setServices(businessProfile.services);
      setValue("services", businessProfile.services);
    }
  }, []);

  const addService = () => {
    if (serviceInput.trim() && services.length < 10) {
      const newServices = [...services, serviceInput.trim()];
      setServices(newServices);
      setValue("services", newServices);
      setServiceInput("");
    }
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    setValue("services", newServices);
  };

  const onSubmit = async (data: BusinessProfileFormData) => {
    try {
      setIsSaving(true);

      // Save to Zustand store
      updateBusinessProfile(data);
      markStepComplete(1);

      // TODO: Save to database via server action
      // await saveBusinessProfile(data);

      toast({
        title: "Profile saved!",
        description: "Your business profile has been saved successfully.",
      });

      // Navigate to next step
      setCurrentStep(2);
      router.push("/onboarding/target-audience");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Business Profile</h1>
        <p className="text-muted-foreground mt-2">
          Tell us about your business so we can create targeted campaigns.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your business name and category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              {...register("businessName")}
              placeholder="e.g., Smith Plumbing Services"
              className={cn(errors.businessName && "border-destructive")}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">{errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Business Category *</Label>
            <Select
              value={watch("category")}
              onValueChange={(value) => setValue("category", value as any)}
            >
              <SelectTrigger className={cn(errors.category && "border-destructive")}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of your business and what makes it unique..."
              rows={4}
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>List the main services your business provides</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={serviceInput}
              onChange={(e) => setServiceInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              placeholder="e.g., Emergency Repairs"
              maxLength={50}
            />
            <Button type="button" onClick={addService} size="icon" disabled={services.length >= 10}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                {service}
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {errors.services && (
            <p className="text-sm text-destructive">{errors.services.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Service Area</CardTitle>
          <CardDescription>Where your business is located and operates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              {...register("location.address")}
              placeholder="123 Main St"
              className={cn(errors.location?.address && "border-destructive")}
            />
            {errors.location?.address && (
              <p className="text-sm text-destructive">{errors.location.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register("location.city")}
                placeholder="City"
                className={cn(errors.location?.city && "border-destructive")}
              />
              {errors.location?.city && (
                <p className="text-sm text-destructive">{errors.location.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={watch("location.state")}
                onValueChange={(value) => setValue("location.state", value)}
              >
                <SelectTrigger className={cn(errors.location?.state && "border-destructive")}>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location?.state && (
                <p className="text-sm text-destructive">{errors.location.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                {...register("location.zipCode")}
                placeholder="12345"
                className={cn(errors.location?.zipCode && "border-destructive")}
              />
              {errors.location?.zipCode && (
                <p className="text-sm text-destructive">{errors.location.zipCode.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceRadius">Service Radius (miles) *</Label>
            <Input
              id="serviceRadius"
              type="number"
              {...register("location.serviceRadius", { valueAsNumber: true })}
              min={1}
              max={100}
              className={cn(errors.location?.serviceRadius && "border-destructive")}
            />
            {errors.location?.serviceRadius && (
              <p className="text-sm text-destructive">{errors.location.serviceRadius.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How customers can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register("contact.phone")}
              placeholder="(555) 123-4567"
              type="tel"
              className={cn(errors.contact?.phone && "border-destructive")}
            />
            {errors.contact?.phone && (
              <p className="text-sm text-destructive">{errors.contact.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              {...register("contact.email")}
              placeholder="contact@example.com"
              type="email"
              className={cn(errors.contact?.email && "border-destructive")}
            />
            {errors.contact?.email && (
              <p className="text-sm text-destructive">{errors.contact.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              {...register("contact.website")}
              placeholder="https://example.com"
              type="url"
              className={cn(errors.contact?.website && "border-destructive")}
            />
            {errors.contact?.website && (
              <p className="text-sm text-destructive">{errors.contact.website.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>When your business is open</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS_OF_WEEK.map((day) => {
            const isClosed = watch(`hours.${day}.closed`);
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b last:border-0">
                <div className="flex items-center gap-3 sm:w-32">
                  <Checkbox
                    id={`${day}-closed`}
                    checked={isClosed}
                    onCheckedChange={(checked) => {
                      setValue(`hours.${day}.closed`, checked as boolean);
                      if (checked) {
                        setValue(`hours.${day}.open`, "");
                        setValue(`hours.${day}.close`, "");
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${day}-closed`}
                    className="capitalize font-medium cursor-pointer"
                  >
                    {day}
                  </Label>
                </div>

                {!isClosed && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      {...register(`hours.${day}.open`)}
                      className="w-full sm:w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      {...register(`hours.${day}.close`)}
                      className="w-full sm:w-32"
                    />
                  </div>
                )}

                {isClosed && (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t sticky bottom-0 sm:static bg-background py-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <div className="flex-1" />

        <Button
          type="submit"
          disabled={!isValid || isSaving}
          className="flex-1 sm:flex-none"
        >
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
