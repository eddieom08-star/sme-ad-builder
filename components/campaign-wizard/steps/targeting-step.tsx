'use client';

import { useWizardStore, type Gender, type Location } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Users, MapPin, Heart, TrendingUp, Plus, X, Globe, Briefcase, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Mock popular locations
const POPULAR_LOCATIONS = [
  { type: 'country' as const, name: 'United States' },
  { type: 'country' as const, name: 'United Kingdom' },
  { type: 'country' as const, name: 'Canada' },
  { type: 'country' as const, name: 'Australia' },
  { type: 'city' as const, name: 'New York, NY' },
  { type: 'city' as const, name: 'Los Angeles, CA' },
  { type: 'city' as const, name: 'London, UK' },
  { type: 'city' as const, name: 'Toronto, Canada' },
];

// Mock popular interests
const POPULAR_INTERESTS = [
  'Fashion', 'Technology', 'Fitness', 'Travel', 'Food & Dining',
  'Home Decor', 'Beauty', 'Sports', 'Gaming', 'Music',
  'Books', 'Art', 'Photography', 'Pets', 'Environment',
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function TargetingStep() {
  const {
    targeting,
    updateTargeting,
    validationErrors,
    platforms,
  } = useWizardStore();

  const [locationInput, setLocationInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [companySizeInput, setCompanySizeInput] = useState('');

  const handleUpdateLinkedinTargeting = (field: 'jobTitles' | 'industries' | 'companySizes', value: string[]) => {
    updateTargeting({
      linkedinTargeting: {
        jobTitles: targeting.linkedinTargeting?.jobTitles || [],
        industries: targeting.linkedinTargeting?.industries || [],
        companySizes: targeting.linkedinTargeting?.companySizes || [],
        [field]: value
      }
    });
  };

  const addItem = (field: 'jobTitles' | 'industries' | 'companySizes', item: string, setInput: (s: string) => void) => {
    if (!item.trim()) return;
    const currentList = targeting.linkedinTargeting?.[field] || [];
    if (!currentList.includes(item.trim())) {
      handleUpdateLinkedinTargeting(field, [...currentList, item.trim()]);
    }
    setInput('');
  };

  const removeItem = (field: 'jobTitles' | 'industries' | 'companySizes', item: string) => {
    const currentList = targeting.linkedinTargeting?.[field] || [];
    handleUpdateLinkedinTargeting(field, currentList.filter(i => i !== item));
  };

  const handleAddLocation = (location: Location) => {
    if (!targeting.locations.find(l => l.name === location.name)) {
      updateTargeting({
        locations: [...targeting.locations, location],
      });
    }
  };

  const handleRemoveLocation = (locationName: string) => {
    updateTargeting({
      locations: targeting.locations.filter(l => l.name !== locationName),
    });
  };

  const handleAddInterest = (interest: string) => {
    if (!targeting.interests.includes(interest)) {
      updateTargeting({
        interests: [...targeting.interests, interest],
      });
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (interest: string) => {
    updateTargeting({
      interests: targeting.interests.filter(i => i !== interest),
    });
  };

  const handleGenderToggle = (gender: Gender) => {
    let newGenders: Gender[];

    if (gender === 'all') {
      newGenders = ['all'];
    } else {
      const withoutAll = targeting.genders.filter(g => g !== 'all');
      if (withoutAll.includes(gender)) {
        newGenders = withoutAll.filter(g => g !== gender);
        if (newGenders.length === 0) newGenders = ['all'];
      } else {
        newGenders = [...withoutAll, gender];
      }
    }

    updateTargeting({ genders: newGenders });
  };

  const estimatedAudienceSize = targeting.locations.length * 500000 *
    (targeting.interests.length > 0 ? 0.7 : 1) *
    ((targeting.ageMax - targeting.ageMin) / 47);

  return (
    <div className="space-y-6 p-6">
      {/* Age Range */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Age Range *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select the age range of your target audience
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="ageMin" className="text-sm">Minimum Age</Label>
              <Input
                id="ageMin"
                type="number"
                min="13"
                max="65"
                value={targeting.ageMin}
                onChange={(e) => updateTargeting({ ageMin: parseInt(e.target.value) || 18 })}
                className={cn(validationErrors.ageMin && 'border-destructive')}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="ageMax" className="text-sm">Maximum Age</Label>
              <Input
                id="ageMax"
                type="number"
                min="13"
                max="65"
                value={targeting.ageMax}
                onChange={(e) => updateTargeting({ ageMax: parseInt(e.target.value) || 65 })}
                className={cn(validationErrors.ageMax && 'border-destructive')}
              />
            </div>
          </div>

          <Slider
            value={[targeting.ageMin, targeting.ageMax]}
            min={13}
            max={65}
            step={1}
            onValueChange={([min, max]) => updateTargeting({ ageMin: min, ageMax: max })}
            className="py-4"
          />

          <p className="text-sm text-center text-muted-foreground">
            Targeting ages <span className="font-semibold">{targeting.ageMin} - {targeting.ageMax}</span>
          </p>

          {(validationErrors.ageMin || validationErrors.ageMax || validationErrors.ageRange) && (
            <p className="text-sm text-destructive">
              {validationErrors.ageMin?.[0] || validationErrors.ageMax?.[0] || validationErrors.ageRange?.[0]}
            </p>
          )}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Gender *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select gender demographics to target
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => {
            const isSelected = targeting.genders.includes(option.value);

            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGenderToggle(option.value)}
                className="transition-all"
              >
                {isSelected && <Check className="h-4 w-4 mr-2" />}
                {option.label}
              </Button>
            );
          })}

        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations *
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Where should your ads be shown?
          </p>
        </div>

        {/* Selected Locations */}
        {targeting.locations.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            {targeting.locations.map((location) => (
              <Badge key={location.name} variant="secondary" className="gap-1 pr-1">
                <Globe className="h-3 w-3" />
                {location.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveLocation(location.name)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Popular Locations */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Popular Locations:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_LOCATIONS.map((location) => (
              <Button
                key={location.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddLocation(location)}
                disabled={targeting.locations.some(l => l.name === location.name)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {location.name}
              </Button>
            ))}
          </div>
        </div>

        {validationErrors.locations && (
          <p className="text-sm text-destructive">
            {validationErrors.locations[0]}
          </p>
        )}
      </div>

      {/* Interests */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Interests <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Target people based on their interests and hobbies
          </p>
        </div>

        {/* Selected Interests */}
        {targeting.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
            {targeting.interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="gap-1 pr-1">
                {interest}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveInterest(interest)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Add Custom Interest */}
        <div className="flex gap-2">
          <Input
            placeholder="Type an interest and press Enter"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && interestInput.trim()) {
                e.preventDefault();
                handleAddInterest(interestInput.trim());
              }
            }}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => interestInput.trim() && handleAddInterest(interestInput.trim())}
            disabled={!interestInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Popular Interests */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Popular Interests:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INTERESTS.map((interest) => (
              <Button
                key={interest}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddInterest(interest)}
                disabled={targeting.interests.includes(interest)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {interest}
              </Button>
            ))}
          </div>
        </div>

        {validationErrors.interests && (
          <p className="text-sm text-muted-foreground italic">
            {validationErrors.interests[0]}
          </p>
        )}
      </div>

      {/* Professional Targeting (LinkedIn Only) */}
      {platforms.includes('linkedin') && (
        <div className="space-y-3">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional Targeting <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">LinkedIn</span>
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Target professionals based on their career attributes
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {/* Job Titles */}
            <div className="space-y-2">
              <Label className="text-sm">Job Titles</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg min-h-[40px]">
                {targeting.linkedinTargeting?.jobTitles.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-200 hover:text-blue-800"
                      onClick={() => removeItem('jobTitles', item)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                <div className="flex-1 min-w-[120px] flex gap-2">
                  <Input
                    placeholder="Add job title..."
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('jobTitles', jobTitleInput, setJobTitleInput);
                      }
                    }}
                    className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => addItem('jobTitles', jobTitleInput, setJobTitleInput)}
                    disabled={!jobTitleInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Industries */}
            <div className="space-y-2">
              <Label className="text-sm">Industries</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg min-h-[40px]">
                {targeting.linkedinTargeting?.industries.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-200 hover:text-blue-800"
                      onClick={() => removeItem('industries', item)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                <div className="flex-1 min-w-[120px] flex gap-2">
                  <Input
                    placeholder="Add industry..."
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('industries', industryInput, setIndustryInput);
                      }
                    }}
                    className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => addItem('industries', industryInput, setIndustryInput)}
                    disabled={!industryInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Company Sizes */}
            <div className="space-y-2">
              <Label className="text-sm">Company Sizes</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg min-h-[40px]">
                {targeting.linkedinTargeting?.companySizes.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-blue-200 hover:text-blue-800"
                      onClick={() => removeItem('companySizes', item)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                <div className="flex-1 min-w-[120px] flex gap-2">
                  <Input
                    placeholder="Add company size (e.g. 51-200)..."
                    value={companySizeInput}
                    onChange={(e) => setCompanySizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('companySizes', companySizeInput, setCompanySizeInput);
                      }
                    }}
                    className="h-8 text-sm border-0 bg-transparent focus-visible:ring-0 px-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => addItem('companySizes', companySizeInput, setCompanySizeInput)}
                    disabled={!companySizeInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {validationErrors.linkedinTargeting && (
            <p className="text-sm text-destructive">
              {validationErrors.linkedinTargeting[0]}
            </p>
          )}
        </div>
      )}

      {/* Audience Size Estimate */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Estimated Audience Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-primary mb-2">
              {estimatedAudienceSize.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              People in your target audience
            </p>
          </div>

          <div className="border-t border-primary/20 pt-3 mt-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                {estimatedAudienceSize > 1000000 ? (
                  <span className="text-green-600 font-semibold">Broad audience</span>
                ) : estimatedAudienceSize > 100000 ? (
                  <span className="text-blue-600 font-semibold">Balanced audience</span>
                ) : (
                  <span className="text-orange-600 font-semibold">Narrow audience</span>
                )} - {estimatedAudienceSize > 1000000
                  ? 'Great reach potential, may be less targeted'
                  : estimatedAudienceSize > 100000
                    ? 'Good balance of reach and targeting'
                    : 'Highly targeted, consider broadening if needed'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Targeting Tips</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Start broad, then narrow based on performance</li>
                <li>• Aim for at least 50,000 people in your audience</li>
                <li>• More interests = narrower audience</li>
                <li>• Test different age ranges to find your sweet spot</li>
                <li>• City targeting is more precise but reaches fewer people</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
