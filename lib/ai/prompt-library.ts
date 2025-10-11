import { BusinessCategory } from "@/lib/store/onboarding";

// Prohibited terms that trigger safety warnings
export const PROHIBITED_TERMS = [
  // Competitors
  "angi", "homeadvisor", "thumbtack", "taskrabbit", "handy", "porch",

  // Guarantees (not allowed by most ad platforms)
  "guarantee", "guaranteed", "100%", "always", "never fail", "promise",

  // Before/after (medical/health claims)
  "before and after", "before/after", "transformation",

  // Superlatives without proof
  "#1", "best", "top rated", "highest quality", "cheapest", "lowest price",

  // Medical claims
  "cure", "heal", "treatment", "therapy",
] as const;

// Brand color integration based on industry
export const INDUSTRY_COLORS = {
  Plumber: ["blue", "navy blue", "royal blue"],
  Electrician: ["yellow", "orange", "bright yellow"],
  HVAC: ["blue", "cool blue", "ice blue"],
  "General Contractor": ["orange", "construction orange", "safety orange"],
  Carpenter: ["brown", "wood brown", "natural wood tones"],
  Painter: ["rainbow", "colorful", "paint splash"],
  Landscaper: ["green", "forest green", "nature green"],
  Roofer: ["gray", "charcoal", "slate gray"],
  "Flooring Specialist": ["brown", "natural wood", "oak"],
  Handyman: ["red", "tool red", "workshop red"],
  "Pool Service": ["cyan", "pool blue", "turquoise"],
  "Cleaning Service": ["white", "fresh white", "clean blue"],
  Other: ["blue", "professional blue"],
} as const;

// Style presets for different business types
export const STYLE_PRESETS = {
  professional: "professional, clean, modern, high-quality photography",
  lifestyle: "lifestyle photography, natural lighting, authentic, relatable",
  technical: "technical, detailed, precise, industrial",
  friendly: "friendly, welcoming, approachable, warm lighting",
  luxury: "luxury, premium, high-end, sophisticated",
  action: "action shot, dynamic, energetic, work in progress",
} as const;

export interface PromptTemplate {
  id: string;
  category: BusinessCategory | "All";
  name: string;
  description: string;
  basePrompt: string;
  style: keyof typeof STYLE_PRESETS;
  placeholders: string[]; // Variables that can be customized
  example: string;
}

export const PROMPT_LIBRARY: PromptTemplate[] = [
  // Plumber Templates
  {
    id: "plumber-hero",
    category: "Plumber",
    name: "Professional Plumber Hero Shot",
    description: "A professional plumber in uniform showing confidence and expertise",
    basePrompt: "Professional plumber in {uniform_color} uniform with tool belt, standing confidently with arms crossed, {background}, {style}",
    style: "professional",
    placeholders: ["uniform_color", "background"],
    example: "Professional plumber in navy blue uniform with tool belt, standing confidently with arms crossed, modern bathroom background, professional, clean, modern, high-quality photography",
  },
  {
    id: "plumber-tools",
    category: "Plumber",
    name: "Plumbing Tools & Equipment",
    description: "Clean layout of professional plumbing tools",
    basePrompt: "Organized display of {tool_type} plumbing tools on {surface}, {lighting}, {style}",
    style: "technical",
    placeholders: ["tool_type", "surface", "lighting"],
    example: "Organized display of modern plumbing tools on white workbench, bright studio lighting, technical, detailed, precise, industrial",
  },
  {
    id: "plumber-service",
    category: "Plumber",
    name: "Service Call Action",
    description: "Plumber actively working on a repair",
    basePrompt: "Plumber installing {fixture} in {location}, focused on work, {angle}, {style}",
    style: "action",
    placeholders: ["fixture", "location", "angle"],
    example: "Plumber installing modern faucet in bright kitchen, focused on work, over-the-shoulder angle, action shot, dynamic, energetic, work in progress",
  },

  // Electrician Templates
  {
    id: "electrician-hero",
    category: "Electrician",
    name: "Certified Electrician Portrait",
    description: "Professional electrician with safety gear",
    basePrompt: "Professional electrician wearing {safety_gear}, holding {tool}, {background}, {style}",
    style: "professional",
    placeholders: ["safety_gear", "tool", "background"],
    example: "Professional electrician wearing safety glasses and hard hat, holding voltage tester, electrical panel background, professional, clean, modern, high-quality photography",
  },
  {
    id: "electrician-panel",
    category: "Electrician",
    name: "Electrical Panel Work",
    description: "Electrician working on modern electrical panel",
    basePrompt: "Electrician installing {component} in {panel_type} electrical panel, {lighting}, {style}",
    style: "technical",
    placeholders: ["component", "panel_type", "lighting"],
    example: "Electrician installing circuit breaker in modern electrical panel, bright LED lighting, technical, detailed, precise, industrial",
  },

  // HVAC Templates
  {
    id: "hvac-hero",
    category: "HVAC",
    name: "HVAC Technician Professional",
    description: "HVAC technician with AC unit",
    basePrompt: "HVAC technician in {uniform}, standing next to {equipment}, {setting}, {style}",
    style: "professional",
    placeholders: ["uniform", "equipment", "setting"],
    example: "HVAC technician in blue uniform, standing next to modern AC unit, residential home setting, professional, clean, modern, high-quality photography",
  },
  {
    id: "hvac-maintenance",
    category: "HVAC",
    name: "System Maintenance",
    description: "Technician performing maintenance",
    basePrompt: "HVAC technician performing {service} on {system_type}, {angle}, {style}",
    style: "action",
    placeholders: ["service", "system_type", "angle"],
    example: "HVAC technician performing filter replacement on residential AC system, close-up angle, action shot, dynamic, energetic, work in progress",
  },

  // General Contractor Templates
  {
    id: "contractor-hero",
    category: "General Contractor",
    name: "Contractor Leadership Shot",
    description: "Contractor at construction site showing leadership",
    basePrompt: "General contractor wearing {attire} at {location}, {pose}, {style}",
    style: "professional",
    placeholders: ["attire", "location", "pose"],
    example: "General contractor wearing hard hat and safety vest at modern construction site, reviewing blueprints, professional, clean, modern, high-quality photography",
  },
  {
    id: "contractor-team",
    category: "General Contractor",
    name: "Construction Team",
    description: "Team of contractors working together",
    basePrompt: "Team of contractors {activity} at {project_type}, {perspective}, {style}",
    style: "action",
    placeholders: ["activity", "project_type", "perspective"],
    example: "Team of contractors building frame structure at residential project, wide angle perspective, action shot, dynamic, energetic, work in progress",
  },

  // Carpenter Templates
  {
    id: "carpenter-hero",
    category: "Carpenter",
    name: "Master Carpenter Portrait",
    description: "Skilled carpenter with woodworking tools",
    basePrompt: "Experienced carpenter in {workshop_setting}, holding {tool}, {background}, {style}",
    style: "professional",
    placeholders: ["workshop_setting", "tool", "background"],
    example: "Experienced carpenter in professional workshop, holding quality chisel, wood grain background, professional, clean, modern, high-quality photography",
  },
  {
    id: "carpenter-craft",
    category: "Carpenter",
    name: "Craftsmanship Detail",
    description: "Close-up of fine woodworking",
    basePrompt: "Close-up of carpenter {action} on {wood_type}, {lighting}, {style}",
    style: "technical",
    placeholders: ["action", "wood_type", "lighting"],
    example: "Close-up of carpenter hand-sanding oak wood, natural window lighting, technical, detailed, precise, industrial",
  },

  // Painter Templates
  {
    id: "painter-hero",
    category: "Painter",
    name: "Professional Painter",
    description: "Painter with painting equipment",
    basePrompt: "Professional painter in {attire}, holding {equipment}, {background}, {style}",
    style: "professional",
    placeholders: ["attire", "equipment", "background"],
    example: "Professional painter in white overalls, holding paint roller and bucket, freshly painted wall background, professional, clean, modern, high-quality photography",
  },
  {
    id: "painter-colors",
    category: "Painter",
    name: "Color Palette Display",
    description: "Paint colors and swatches",
    basePrompt: "Display of {color_scheme} paint samples and {tools}, {arrangement}, {style}",
    style: "lifestyle",
    placeholders: ["color_scheme", "tools", "arrangement"],
    example: "Display of neutral tone paint samples and brushes, artistic arrangement on table, lifestyle photography, natural lighting, authentic, relatable",
  },

  // Landscaper Templates
  {
    id: "landscaper-hero",
    category: "Landscaper",
    name: "Landscaping Professional",
    description: "Landscaper in outdoor setting",
    basePrompt: "Professional landscaper in {setting}, {activity}, {time_of_day}, {style}",
    style: "lifestyle",
    placeholders: ["setting", "activity", "time_of_day"],
    example: "Professional landscaper in beautiful garden, planting flowers, golden hour lighting, lifestyle photography, natural lighting, authentic, relatable",
  },
  {
    id: "landscaper-results",
    category: "Landscaper",
    name: "Beautiful Landscape",
    description: "Finished landscaping work",
    basePrompt: "{landscape_type} with {features}, {season}, {style}",
    style: "lifestyle",
    placeholders: ["landscape_type", "features", "season"],
    example: "Manicured front lawn with colorful flower beds and stone pathway, spring season, lifestyle photography, natural lighting, authentic, relatable",
  },

  // Universal Templates
  {
    id: "universal-tools",
    category: "All",
    name: "Professional Tools Layout",
    description: "Clean tool arrangement for any trade",
    basePrompt: "Organized arrangement of {trade} tools on {surface}, {lighting}, {style}",
    style: "technical",
    placeholders: ["trade", "surface", "lighting"],
    example: "Organized arrangement of professional tools on wooden workbench, bright studio lighting, technical, detailed, precise, industrial",
  },
  {
    id: "universal-handshake",
    category: "All",
    name: "Trust & Partnership",
    description: "Professional handshake representing customer service",
    basePrompt: "Professional handshake between {professional} and customer, {setting}, {style}",
    style: "friendly",
    placeholders: ["professional", "setting"],
    example: "Professional handshake between service technician and happy homeowner, home entrance setting, friendly, welcoming, approachable, warm lighting",
  },
  {
    id: "universal-truck",
    category: "All",
    name: "Service Vehicle",
    description: "Professional service vehicle/truck",
    basePrompt: "{vehicle_type} service truck with {branding}, {location}, {style}",
    style: "professional",
    placeholders: ["vehicle_type", "branding", "location"],
    example: "White service van with professional logo, parked at residential driveway, professional, clean, modern, high-quality photography",
  },
  {
    id: "universal-customer",
    category: "All",
    name: "Happy Customer",
    description: "Satisfied customer with service professional",
    basePrompt: "Satisfied homeowner with {professional} after {service}, {emotion}, {style}",
    style: "friendly",
    placeholders: ["professional", "service", "emotion"],
    example: "Satisfied homeowner smiling with service professional after repair, relieved and happy, friendly, welcoming, approachable, warm lighting",
  },
  {
    id: "universal-home",
    category: "All",
    name: "Beautiful Home Exterior",
    description: "Well-maintained home showing quality work",
    basePrompt: "{home_style} house exterior with {feature}, {time_of_day}, {style}",
    style: "lifestyle",
    placeholders: ["home_style", "feature", "time_of_day"],
    example: "Modern suburban house exterior with manicured lawn, golden hour sunset, lifestyle photography, natural lighting, authentic, relatable",
  },
  {
    id: "universal-quality",
    category: "All",
    name: "Quality Workmanship",
    description: "Close-up of quality work detail",
    basePrompt: "Close-up detail of {work_type} showing quality craftsmanship, {material}, {style}",
    style: "technical",
    placeholders: ["work_type", "material"],
    example: "Close-up detail of finished installation showing quality craftsmanship, premium materials, technical, detailed, precise, industrial",
  },
];

// Helper function to get prompts by category
export function getPromptsByCategory(category: BusinessCategory | "All"): PromptTemplate[] {
  return PROMPT_LIBRARY.filter(
    (template) => template.category === category || template.category === "All"
  );
}

// Helper function to check for prohibited terms
export function containsProhibitedTerms(text: string): {
  hasProhibited: boolean;
  foundTerms: string[]
} {
  const lowerText = text.toLowerCase();
  const foundTerms = PROHIBITED_TERMS.filter((term) =>
    lowerText.includes(term.toLowerCase())
  );

  return {
    hasProhibited: foundTerms.length > 0,
    foundTerms,
  };
}

// Helper function to build final prompt
export function buildPrompt(
  template: PromptTemplate,
  placeholders: Record<string, string>,
  businessCategory: BusinessCategory
): string {
  let prompt = template.basePrompt;

  // Replace placeholders
  Object.entries(placeholders).forEach(([key, value]) => {
    prompt = prompt.replace(`{${key}}`, value);
  });

  // Replace style
  prompt = prompt.replace("{style}", STYLE_PRESETS[template.style]);

  // Add industry colors if not specified
  const colors = INDUSTRY_COLORS[businessCategory];
  if (colors && !prompt.includes("color")) {
    const colorHint = `, incorporating ${colors[0]} brand colors`;
    prompt = prompt + colorHint;
  }

  // Add quality enhancers
  prompt = prompt + ", professional photography, 4k quality, sharp focus, well-lit";

  return prompt;
}

// Export types
export type PromptLibraryTemplate = (typeof PROMPT_LIBRARY)[number];
export type StylePreset = keyof typeof STYLE_PRESETS;
