import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, BarChart3, Clock, Target, ArrowRight } from "lucide-react";
import { AdPreview } from "./ad-preview";

interface AdVariant {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  format: "square" | "landscape" | "story";
  platform: "facebook" | "instagram" | "google";
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: string;
    conversion: string;
    cost: string;
  };
}

interface AdVariantTesterProps {
  variants: AdVariant[];
  onSelect: (variant: AdVariant) => void;
  onDuplicate: (variant: AdVariant) => void;
}

export function AdVariantTester({
  variants = [],
  onSelect,
  onDuplicate
}: AdVariantTesterProps) {
  const [activeTab, setActiveTab] = useState('creative');

  if (variants.length === 0) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Ad Variants</h3>
          <p className="text-sm text-slate-500 mb-4">
            Create multiple variants of your ad to test which performs best.
          </p>
        </CardContent>
      </Card>
    );
  }

  const bestPerformer = variants.length > 1 ? 
    variants.reduce((prev, current) => 
      (parseFloat(prev.metrics?.ctr || "0") > parseFloat(current.metrics?.ctr || "0")) ? prev : current
    ) : 
    null;

  const getMetricVariation = (variant: AdVariant, metric: string) => {
    if (!bestPerformer || variant.id === bestPerformer.id) return null;
    
    if (metric === 'ctr') {
      const variantCTR = parseFloat(variant.metrics?.ctr || "0");
      const bestCTR = parseFloat(bestPerformer.metrics?.ctr || "0");
      
      if (variantCTR === 0 || bestCTR === 0) return null;
      
      const difference = ((variantCTR - bestCTR) / bestCTR) * 100;
      return difference.toFixed(1);
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Variant Testing</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="creative">Creative</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="creative" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {variants.map((variant) => (
                <div key={variant.id} className="border rounded-md overflow-hidden">
                  <div className="p-4">
                    <AdPreview
                      title={variant.title}
                      description={variant.description}
                      imageUrl={variant.imageUrl}
                      ctaText={variant.ctaText}
                      format={variant.format}
                      platform={variant.platform}
                    />
                  </div>
                  <div className="p-4 bg-slate-50 border-t flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => onDuplicate(variant)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button size="sm" onClick={() => onSelect(variant)}>
                      Use This Version
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-500">Variant</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Impressions</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Clicks</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">CTR</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Conv. Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-500">Cost/Conv.</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => {
                    const isTopPerformer = bestPerformer?.id === variant.id;
                    const ctrVariation = getMetricVariation(variant, 'ctr');
                    
                    return (
                      <tr key={variant.id} className={`border-b ${isTopPerformer ? 'bg-green-50' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {isTopPerformer && (
                              <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs mr-2">
                                ★
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Variant {index + 1}</span>
                              {isTopPerformer && (
                                <div className="text-xs text-green-600">Top performer</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{variant.metrics?.impressions.toLocaleString() || '-'}</td>
                        <td className="text-center py-3 px-4">{variant.metrics?.clicks.toLocaleString() || '-'}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span>{variant.metrics?.ctr || '-'}</span>
                            {ctrVariation && (
                              <span className={`text-xs ml-1 ${parseFloat(ctrVariation) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {parseFloat(ctrVariation) >= 0 ? '+' : ''}{ctrVariation}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{variant.metrics?.conversion || '-'}</td>
                        <td className="text-center py-3 px-4">{variant.metrics?.cost || '-'}</td>
                        <td className="text-right py-3 px-4">
                          <Button size="sm" variant="ghost" onClick={() => onSelect(variant)}>
                            Select
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 bg-primary-50 text-primary rounded-full mr-3">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Avg. CTR Improvement</div>
                    <div className="text-2xl font-bold">+12.4%</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 bg-primary-50 text-primary rounded-full mr-3">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Top Performer</div>
                    <div className="text-2xl font-bold">Variant {variants.indexOf(bestPerformer || variants[0]) + 1}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="p-2 bg-primary-50 text-primary rounded-full mr-3">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-500 mb-1">Test Duration</div>
                    <div className="text-2xl font-bold">7 days</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}