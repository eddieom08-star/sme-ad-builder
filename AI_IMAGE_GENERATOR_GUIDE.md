# AI Image Generator - Complete Guide

## Overview

The AI Image Generator is Step 2 of the onboarding flow, allowing users to create professional marketing images using OpenAI's DALL-E 3 model. The system includes content safety guardrails, a template library, image editing capabilities, and multi-platform export functionality.

## Features

### 1. **Prompt Library** 📚
- 18+ category-specific templates for different business types
- Templates for: Plumber, Electrician, HVAC, Contractor, Carpenter, Painter, Landscaper, and more
- Universal templates for all business categories
- Customizable placeholders for personalization
- Style presets: professional, lifestyle, technical, friendly, luxury, action

### 2. **Content Safety** 🛡️
- Prohibited terms blocking (27 terms)
- Categories blocked:
  - Competitor names (Angi, HomeAdvisor, Thumbtack, etc.)
  - Guarantees ("guarantee", "100%", "promise")
  - Before/after comparisons
  - Unverified superlatives ("#1", "best", "top rated")
  - Medical claims ("cure", "heal", "treatment")
- Real-time validation before generation
- OpenAI content policy enforcement

### 3. **Image Generation** 🎨
- DALL-E 3 integration via `/api/images/generate`
- 4 aspect ratios: 1:1 (1024x1024), 4:5 (1024x1280), 16:9 (1792x1024), 9:16 (1024x1792)
- Quality settings: standard, HD
- Style settings: vivid (creative), natural (realistic)
- Enhanced prompts with safety guardrails
- Revised prompt tracking

### 4. **Image Editor** ✏️
- Canvas-based editing
- Crop functionality with aspect ratio presets
- Adjustments:
  - Brightness (0-200%)
  - Contrast (0-200%)
  - Saturation (0-200%)
- Reset to original
- Save edited version
- Download functionality

### 5. **Multi-Platform Export** 📤
- Export to multiple formats in one click
- Platform-specific sizes:
  - **Instagram**: Posts (1080x1080), Portrait (1080x1350), Stories (1080x1920)
  - **Facebook**: Posts (1200x1200), Portrait (1080x1350), Stories (1080x1920), Cover (820x312)
  - **LinkedIn**: Posts (1200x1200), Banner (1584x396)
  - **Twitter**: Posts (1200x1200), Header (1500x500)
  - **YouTube**: Thumbnails (1280x720)
  - **Pinterest**: Pins (1000x1500)
  - **TikTok**: Videos (1080x1920)
  - **Snapchat**: Ads (1080x1920)
- Batch download functionality
- Automatic image resizing and cropping

## File Structure

```
lib/
  ai/
    prompt-library.ts          # Template library and safety checks
  utils/
    image-export.ts            # Multi-format export utilities

components/
  ai/
    image-generator.tsx        # Main UI component
    image-editor.tsx           # Canvas-based editor
    multi-export-modal.tsx     # Export modal

app/
  api/
    images/
      generate/
        route.ts               # DALL-E 3 API endpoint
  (onboarding)/
    onboarding/
      image-generation/
        page.tsx               # Onboarding Step 2
```

## Usage

### Basic Flow

1. **Select Template or Custom Prompt**
   - Choose from category-specific templates
   - OR write a custom prompt

2. **Customize Details**
   - Fill in placeholder values (e.g., uniform_color, background)
   - Templates auto-populate with business category context

3. **Configure Settings**
   - Aspect Ratio: Choose based on target platform
   - Quality: Standard or HD
   - Style: Vivid or Natural

4. **Generate Image**
   - Click "Generate Image"
   - System validates for prohibited terms
   - OpenAI generates image (15-30 seconds)

5. **Edit (Optional)**
   - Click "Edit" button
   - Crop to different aspect ratio
   - Adjust brightness, contrast, saturation
   - Save changes

6. **Export**
   - Single download: Click "Download"
   - Multi-platform: Click "Export for Platforms"
   - Select target platforms
   - Download all formats at once

### Code Examples

#### Using in a Component

```tsx
import { ImageGenerator } from "@/components/ai/image-generator";

export default function MyPage() {
  return <ImageGenerator />;
}
```

#### Calling the API Directly

```typescript
const response = await fetch("/api/images/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Professional plumber in blue uniform with tool belt",
    aspectRatio: "4:5",
    quality: "hd",
    style: "vivid",
  }),
});

const result = await response.json();
// result.data.imageUrl
// result.data.revisedPrompt
```

#### Using Export Utilities

```typescript
import { exportMultipleFormats, downloadAllFormats } from "@/lib/utils/image-export";

// Export for multiple platforms
const results = await exportMultipleFormats(imageUrl, "1:1");

// Download all formats
await downloadAllFormats(results, "my-ad");
```

## Prompt Library Structure

### Template Interface

```typescript
interface PromptTemplate {
  id: string;                    // Unique identifier
  category: BusinessCategory | "All";
  name: string;                  // Display name
  description: string;           // Short description
  basePrompt: string;            // Template with {placeholders}
  style: keyof typeof STYLE_PRESETS;
  placeholders: string[];        // Required inputs
  example: string;               // Example output
}
```

### Example Template

```typescript
{
  id: "plumber-hero",
  category: "Plumber",
  name: "Professional Plumber Hero Shot",
  description: "A professional plumber in uniform showing confidence",
  basePrompt: "Professional plumber in {uniform_color} uniform with tool belt, standing confidently, {background}, {style}",
  style: "professional",
  placeholders: ["uniform_color", "background"],
  example: "Professional plumber in navy blue uniform with tool belt, standing confidently, modern bathroom background, professional, clean, modern, high-quality photography"
}
```

### Helper Functions

```typescript
// Get templates for specific category
const templates = getPromptsByCategory("Plumber");

// Check for prohibited terms
const check = containsProhibitedTerms("Best plumber guaranteed!");
// check.hasProhibited === true
// check.foundTerms === ["best", "guaranteed"]

// Build final prompt
const finalPrompt = buildPrompt(
  template,
  { uniform_color: "navy blue", background: "modern bathroom" },
  "Plumber"
);
```

## API Reference

### POST `/api/images/generate`

**Request Body:**
```typescript
{
  prompt: string;              // 10-4000 characters
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:5";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}
```

**Success Response (200):**
```typescript
{
  success: true,
  data: {
    imageUrl: string;
    revisedPrompt: string;
    aspectRatio: string;
    quality: string;
    style: string;
    metadata: {
      generatedAt: string;
      userId: number;
      model: "dall-e-3";
    }
  }
}
```

**Error Responses:**
- `401` - Unauthorized (no session)
- `400` - Invalid request (short prompt, prohibited terms, content policy violation)
- `429` - Rate limit exceeded
- `500` - Server error / OpenAI API error

### GET `/api/images/generate`

Check API status and available options.

**Response (200):**
```typescript
{
  status: "ready" | "not_configured",
  message: string,
  supportedRatios: string[],
  supportedQualities: string[],
  supportedStyles: string[]
}
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (for rate limiting, usage tracking)
OPENAI_ORG_ID=org-...
```

## Content Safety Details

### Prohibited Terms List

```typescript
const PROHIBITED_TERMS = [
  // Competitors (6 terms)
  "angi", "homeadvisor", "thumbtack", "taskrabbit", "handy", "porch",

  // Guarantees (6 terms)
  "guarantee", "guaranteed", "100%", "always", "never fail", "promise",

  // Before/after (3 terms)
  "before and after", "before/after", "transformation",

  // Superlatives (6 terms)
  "#1", "best", "top rated", "highest quality", "cheapest", "lowest price",

  // Medical claims (4 terms)
  "cure", "heal", "treatment", "therapy",
];
```

### Enhanced Prompt Template

Every prompt is enhanced with:

```
Style requirements: Professional marketing image, appropriate for business advertising, family-friendly, no text or words in the image, no people's faces (unless stock photo style), high quality commercial photography.

Content restrictions: No logos, no brand names, no competitor references, no medical claims, no guarantees, no before/after comparisons.
```

### Safety Checks

1. **Client-side validation** (components/ai/image-generator.tsx:106-111)
2. **API-side validation** (app/api/images/generate/route.ts:59-69)
3. **OpenAI content policy** (automatic via DALL-E 3)
4. **Prompt similarity check** (route.ts:114-120)

## Industry Colors

Brand colors are automatically integrated based on business category:

```typescript
const INDUSTRY_COLORS = {
  Plumber: ["blue", "navy blue", "royal blue"],
  Electrician: ["yellow", "orange", "bright yellow"],
  HVAC: ["blue", "cool blue", "ice blue"],
  "General Contractor": ["orange", "construction orange"],
  Carpenter: ["brown", "wood brown", "natural wood"],
  Painter: ["rainbow", "colorful", "paint splash"],
  Landscaper: ["green", "forest green", "nature green"],
  Roofer: ["gray", "charcoal", "slate gray"],
  // ... more categories
};
```

## Style Presets

```typescript
const STYLE_PRESETS = {
  professional: "professional, clean, modern, high-quality photography",
  lifestyle: "lifestyle photography, natural lighting, authentic, relatable",
  technical: "technical, detailed, precise, industrial",
  friendly: "friendly, welcoming, approachable, warm lighting",
  luxury: "luxury, premium, high-end, sophisticated",
  action: "action shot, dynamic, energetic, work in progress",
};
```

## Export Formats Reference

### 1:1 Square

| Platform | Name | Size | Use Case |
|----------|------|------|----------|
| Instagram | Post | 1080×1080 | Feed posts |
| Facebook | Post | 1200×1200 | Feed posts |
| LinkedIn | Post | 1200×1200 | Feed posts |
| Twitter | Post | 1200×1200 | Feed posts |

### 4:5 Portrait

| Platform | Name | Size | Use Case |
|----------|------|------|----------|
| Instagram | Portrait | 1080×1350 | Portrait posts |
| Facebook | Portrait | 1080×1350 | Portrait posts |
| Pinterest | Pin | 1000×1500 | Standard pins |

### 16:9 Landscape

| Platform | Name | Size | Use Case |
|----------|------|------|----------|
| YouTube | Thumbnail | 1280×720 | Video thumbnails |
| Facebook | Cover | 820×312 | Page covers |
| Twitter | Header | 1500×500 | Profile headers |
| LinkedIn | Banner | 1584×396 | Profile banners |

### 9:16 Story

| Platform | Name | Size | Use Case |
|----------|------|------|----------|
| Instagram | Story | 1080×1920 | Stories |
| Facebook | Story | 1080×1920 | Stories |
| TikTok | Video | 1080×1920 | Vertical video |
| Snapchat | Ad | 1080×1920 | Story ads |

## Best Practices

### Prompt Writing

✅ **DO:**
- Be specific and descriptive
- Include lighting, setting, and mood
- Use professional terminology
- Reference the business category
- Keep under 4000 characters

❌ **DON'T:**
- Use competitor names
- Make guarantees or promises
- Include medical claims
- Use superlatives without proof
- Request text/words in images

### Template Selection

- **Hero Shots**: Use for homepage, about pages
- **Action Shots**: Use for services, case studies
- **Tools/Equipment**: Use for expertise, capabilities
- **Lifestyle**: Use for testimonials, soft sell

### Aspect Ratio Selection

- **1:1**: Most versatile, works across all platforms
- **4:5**: Best for Instagram, mobile-first content
- **16:9**: YouTube, desktop, presentations
- **9:16**: Stories, TikTok, mobile video

### Export Strategy

1. Generate at highest quality needed
2. Edit once (crop, adjust)
3. Export to all target platforms at once
4. Keep original for future variations

## Troubleshooting

### Common Issues

**"Prohibited terms found"**
- Review the prohibited terms list
- Rephrase without guarantees or competitors
- Use alternative descriptive words

**"Failed to generate image"**
- Check OpenAI API key is set
- Verify account has credits
- Check prompt length (10-4000 chars)
- Review for content policy violations

**"Rate limit exceeded"**
- Wait a few minutes
- Check OpenAI account limits
- Consider upgrading OpenAI tier

**Cross-origin issues with image editing**
- Images use `crossOrigin="anonymous"`
- Works with OpenAI's CORS settings
- If using custom storage, configure CORS

**Export not downloading**
- Check browser popup blocker
- Enable downloads for the site
- Try exporting one format at a time

## Performance Considerations

### Generation Time
- Standard quality: ~15 seconds
- HD quality: ~20-30 seconds
- Larger aspect ratios: slightly longer

### Export Time
- Single format: ~100ms
- 4 formats: ~400ms + download time
- Processing happens client-side (Canvas API)

### Optimization Tips
1. Use standard quality for testing
2. Generate at final aspect ratio (avoid upscaling)
3. Edit before exporting (not after)
4. Batch export vs individual downloads

## Future Enhancements

Potential additions:
- [ ] Image variation generation (same prompt, different results)
- [ ] In-painting for specific edits
- [ ] Background removal
- [ ] Text overlay editor
- [ ] Template favoriting
- [ ] Image history/gallery
- [ ] Batch generation (multiple prompts)
- [ ] A/B testing recommendations
- [ ] Usage analytics
- [ ] Cost tracking

---

## Quick Links

- [Onboarding Guide](./ONBOARDING_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [OpenAI DALL-E 3 Docs](https://platform.openai.com/docs/guides/images)
