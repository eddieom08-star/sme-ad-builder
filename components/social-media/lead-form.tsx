"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Plus, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSocialMediaStore, type LeadFormField } from "@/lib/store/social-media";
import { cn } from "@/lib/utils";

interface LeadFormProps {
  onContinue: () => void;
  onBack: () => void;
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text Input" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Number" },
  { value: "select", label: "Dropdown" },
] as const;

const PREDEFINED_FIELDS = [
  { label: "Full Name", type: "text" as const, required: true },
  { label: "Email Address", type: "email" as const, required: true },
  { label: "Phone Number", type: "phone" as const, required: false },
  { label: "Company Name", type: "text" as const, required: false },
  { label: "Job Title", type: "text" as const, required: false },
];

export function LeadForm({ onContinue, onBack }: LeadFormProps) {
  const { selectedPlatforms, leadForm, setLeadForm } = useSocialMediaStore();
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "email" | "phone" | "select">("text");

  // Check if lead forms are supported on selected platforms
  const supportsLeadForms = selectedPlatforms.some((p) => p === "facebook" || p === "instagram");

  const handleToggleLeadForm = (enabled: boolean) => {
    setLeadForm({ enabled });
  };

  const handleAddPredefinedField = (field: typeof PREDEFINED_FIELDS[0]) => {
    if (leadForm.fields.some((f) => f.label === field.label)) return;

    setLeadForm({
      fields: [
        ...leadForm.fields,
        {
          id: crypto.randomUUID(),
          label: field.label,
          type: field.type,
          required: field.required,
          options: [],
        },
      ],
    });
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    if (leadForm.fields.some((f) => f.label === newFieldLabel.trim())) return;

    setLeadForm({
      fields: [
        ...leadForm.fields,
        {
          id: crypto.randomUUID(),
          label: newFieldLabel.trim(),
          type: newFieldType,
          required: false,
          options: newFieldType === "select" ? ["Option 1", "Option 2"] : [],
        },
      ],
    });

    setNewFieldLabel("");
    setNewFieldType("text");
  };

  const handleRemoveField = (id: string) => {
    setLeadForm({
      fields: leadForm.fields.filter((f) => f.id !== id),
    });
  };

  const handleToggleRequired = (id: string) => {
    setLeadForm({
      fields: leadForm.fields.map((f) =>
        f.id === id ? { ...f, required: !f.required } : f
      ),
    });
  };

  const handleUpdateFieldOptions = (id: string, options: string) => {
    setLeadForm({
      fields: leadForm.fields.map((f) =>
        f.id === id
          ? { ...f, options: options.split(",").map((o) => o.trim()).filter(Boolean) }
          : f
      ),
    });
  };

  const handlePrivacyPolicyChange = (value: string) => {
    setLeadForm({ privacyPolicyUrl: value });
  };

  const handleThankYouMessageChange = (value: string) => {
    setLeadForm({ thankYouMessage: value });
  };

  const isValid =
    !leadForm.enabled ||
    (leadForm.fields.length >= 2 &&
      leadForm.fields.some((f) => f.type === "email") &&
      leadForm.privacyPolicyUrl.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Lead Form Setup
        </h2>
        <p className="text-muted-foreground mt-2">
          Collect leads directly from your ads. Available on Facebook and Instagram.
        </p>
      </div>

      {/* Not Supported Warning */}
      {!supportsLeadForms && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Lead forms are only available for Facebook and Instagram. Please add one of these platforms to use this feature.
          </AlertDescription>
        </Alert>
      )}

      {supportsLeadForms && (
        <div className="grid lg:grid-cols-[1fr,350px] gap-6">
          {/* Left: Form Builder */}
          <div className="space-y-4">
            {/* Enable Lead Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Enable Lead Form
                  </div>
                  <Switch
                    checked={leadForm.enabled}
                    onCheckedChange={handleToggleLeadForm}
                  />
                </CardTitle>
              </CardHeader>
              {leadForm.enabled && (
                <CardContent className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Lead forms allow users to submit their information without leaving the platform
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>

            {leadForm.enabled && (
              <>
                {/* Predefined Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Add Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_FIELDS.map((field) => {
                        const isAdded = leadForm.fields.some((f) => f.label === field.label);
                        return (
                          <Button
                            key={field.label}
                            variant={isAdded ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => handleAddPredefinedField(field)}
                            disabled={isAdded}
                          >
                            {isAdded ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <Plus className="h-3 w-3 mr-1" />
                            )}
                            {field.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Field */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Custom Field</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-[1fr,150px,auto] gap-2">
                      <Input
                        placeholder="Field label..."
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddCustomField()}
                      />
                      <Select value={newFieldType} onValueChange={(v: any) => setNewFieldType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddCustomField} disabled={!newFieldLabel.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Fields List */}
                {leadForm.fields.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Form Fields ({leadForm.fields.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {leadForm.fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {index + 1}
                                </Badge>
                                <span className="font-medium">{field.label}</span>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {field.type}
                                </Badge>
                              </div>
                              <button
                                onClick={() => handleRemoveField(field.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {field.type === "select" && (
                              <div className="space-y-1">
                                <Label className="text-xs">Options (comma separated)</Label>
                                <Input
                                  value={field.options.join(", ")}
                                  onChange={(e) => handleUpdateFieldOptions(field.id, e.target.value)}
                                  placeholder="Option 1, Option 2, Option 3"
                                  className="text-sm"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={() => handleToggleRequired(field.id)}
                                id={`required-${field.id}`}
                              />
                              <Label
                                htmlFor={`required-${field.id}`}
                                className="text-xs cursor-pointer"
                              >
                                Required field
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Privacy Policy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Privacy Policy *</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                      <Input
                        id="privacy-url"
                        type="url"
                        placeholder="https://yourbusiness.com/privacy"
                        value={leadForm.privacyPolicyUrl}
                        onChange={(e) => handlePrivacyPolicyChange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required by Facebook/Instagram for lead generation
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Thank You Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thank You Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="thank-you">Message after submission</Label>
                      <Textarea
                        id="thank-you"
                        placeholder="Thank you for your interest! We'll be in touch soon."
                        value={leadForm.thankYouMessage}
                        onChange={(e) => handleThankYouMessageChange(e.target.value)}
                        rows={3}
                        maxLength={200}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Shown after form submission</span>
                        <span>{leadForm.thankYouMessage.length}/200</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lead Form Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {!leadForm.enabled ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Enable lead form to see preview</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview Header */}
                    <div className="pb-3 border-b">
                      <h3 className="font-semibold">Get More Information</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fill out this form to learn more
                      </p>
                    </div>

                    {/* Preview Fields */}
                    <div className="space-y-3">
                      {leadForm.fields.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Add fields to see them here
                        </p>
                      ) : (
                        leadForm.fields.map((field) => (
                          <div key={field.id} className="space-y-1">
                            <Label className="text-xs">
                              {field.label}
                              {field.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            {field.type === "select" ? (
                              <Select disabled>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </Select>
                            ) : (
                              <Input
                                type={field.type}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                disabled
                                className="h-8 text-xs"
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Preview Submit */}
                    <Button className="w-full" size="sm" disabled>
                      Submit
                    </Button>

                    {/* Privacy Notice */}
                    {leadForm.privacyPolicyUrl && (
                      <p className="text-[10px] text-muted-foreground">
                        By submitting, you agree to our{" "}
                        <span className="text-primary">privacy policy</span>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Checklist */}
            {leadForm.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {leadForm.fields.length >= 2 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={leadForm.fields.length >= 2 ? "text-green-600" : ""}>
                      Minimum 2 fields
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadForm.fields.some((f) => f.type === "email") ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        leadForm.fields.some((f) => f.type === "email") ? "text-green-600" : ""
                      }
                    >
                      Email field required
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {leadForm.privacyPolicyUrl.trim() ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={leadForm.privacyPolicyUrl.trim() ? "text-green-600" : ""}>
                      Privacy policy URL
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {leadForm.enabled && !isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please add at least 2 fields (including email) and a privacy policy URL
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Review & Launch
        </Button>
      </div>
    </div>
  );
}
