# AI Image Generator - Quick Reference

## 🚀 Quick Start

### Access Image Generator
```tsx
// Route
/onboarding/image-generation

// Component
import { ImageGenerator } from "@/components/ai/image-generator";
<ImageGenerator />
```

### Generate Image
```typescript
const response = await fetch("/api/images/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Your prompt here",
    aspectRatio: "4:5",
    quality: "hd",
    style: "vivid",
  }),
});
```

## 📋 Prohibited Terms (27)

```typescript
// Competitors (6)
"angi", "homeadvisor", "thumbtack", "taskrabbit", "handy", "porch"

// Guarantees (6)
"guarantee", "guaranteed", "100%", "always", "never fail", "promise"

// Before/After (3)
"before and after", "before/after", "transformation"

// Superlatives (6)
"#1", "best", "top rated", "highest quality", "cheapest", "lowest price"

// Medical (4)
"cure", "heal", "treatment", "therapy"
```

## 🎨 Aspect Ratios

| Ratio | Size | Platforms |
|-------|------|-----------|
| 1:1 | 1024×1024 | Instagram, Facebook, LinkedIn, Twitter |
| 4:5 | 1024×1280 | Instagram Portrait, Pinterest |
| 16:9 | 1792×1024 | YouTube, Facebook Cover, LinkedIn Banner |
| 9:16 | 1024×1792 | Instagram/Facebook Stories, TikTok |

## 📱 Export Formats

### Instagram
- Post (1:1): 1080×1080
- Portrait (4:5): 1080×1350
- Story (9:16): 1080×1920

### Facebook
- Post (1:1): 1200×1200
- Portrait (4:5): 1080×1350
- Story (9:16): 1080×1920
- Cover (16:9): 820×312

### LinkedIn
- Post (1:1): 1200×1200
- Banner (16:9): 1584×396

### YouTube
- Thumbnail (16:9): 1280×720

### TikTok
- Video (9:16): 1080×1920

## 🗂️ File Locations

```
lib/ai/prompt-library.ts              # Templates & safety
lib/utils/image-export.ts             # Export utilities
components/ai/image-generator.tsx     # Main UI
components/ai/image-editor.tsx        # Editor
components/ai/multi-export-modal.tsx  # Export modal
app/api/images/generate/route.ts      # API endpoint
```

## 🎯 Template Categories

```typescript
const CATEGORIES = [
  "Plumber", "Electrician", "HVAC",
  "General Contractor", "Carpenter", "Painter",
  "Landscaper", "Roofer", "Flooring Specialist",
  "Handyman", "Pool Service", "Cleaning Service",
  "Other"
];
```

## 🎨 Style Presets

```typescript
professional → "professional, clean, modern, high-quality"
lifestyle    → "natural lighting, authentic, relatable"
technical    → "technical, detailed, precise, industrial"
friendly     → "welcoming, approachable, warm lighting"
luxury       → "premium, high-end, sophisticated"
action       → "dynamic, energetic, work in progress"
```

## 💾 Helper Functions

### Get Templates by Category
```typescript
import { getPromptsByCategory } from "@/lib/ai/prompt-library";
const templates = getPromptsByCategory("Plumber");
```

### Check Prohibited Terms
```typescript
import { containsProhibitedTerms } from "@/lib/ai/prompt-library";
const check = containsProhibitedTerms("Best service guaranteed!");
// { hasProhibited: true, foundTerms: ["best", "guaranteed"] }
```

### Build Prompt
```typescript
import { buildPrompt } from "@/lib/ai/prompt-library";
const prompt = buildPrompt(template, placeholders, "Plumber");
```

### Export Multiple Formats
```typescript
import { exportMultipleFormats } from "@/lib/utils/image-export";
const results = await exportMultipleFormats(imageUrl, "1:1");
```

### Download All
```typescript
import { downloadAllFormats } from "@/lib/utils/image-export";
await downloadAllFormats(results, "ad-image");
```

## 🔧 API Endpoints

### POST `/api/images/generate`
```typescript
Request: {
  prompt: string;              // 10-4000 chars
  aspectRatio?: string;        // Default: "1:1"
  quality?: string;            // Default: "standard"
  style?: string;              // Default: "vivid"
}

Response: {
  success: true,
  data: {
    imageUrl: string,
    revisedPrompt: string,
    aspectRatio: string,
    quality: string,
    style: string,
    metadata: {...}
  }
}
```

### GET `/api/images/generate`
```typescript
Response: {
  status: "ready" | "not_configured",
  message: string,
  supportedRatios: [...],
  supportedQualities: [...],
  supportedStyles: [...]
}
```

## ⚙️ Settings

```typescript
Quality:
  - standard (faster, cheaper)
  - hd (slower, higher quality)

Style:
  - vivid (more creative, dramatic)
  - natural (more realistic, subdued)
```

## 🎨 Industry Colors

```typescript
Plumber       → blue, navy blue, royal blue
Electrician   → yellow, orange, bright yellow
HVAC          → blue, cool blue, ice blue
Contractor    → orange, construction orange
Carpenter     → brown, wood brown, natural wood
Painter       → rainbow, colorful, paint splash
Landscaper    → green, forest green, nature green
Roofer        → gray, charcoal, slate gray
```

## 🖼️ Image Editor Features

```typescript
Crop:
  - Presets: 1:1, 4:5, 16:9, 9:16
  - Visual overlay with dimensions

Adjust:
  - Brightness: 0-200%
  - Contrast: 0-200%
  - Saturation: 0-200%
  - Reset all button

Actions:
  - Save (returns data URL)
  - Download (PNG)
  - Cancel
```

## 📊 Export Platform Guide

| Platform | Best Ratio | Quality | Notes |
|----------|-----------|---------|-------|
| Instagram Feed | 1:1, 4:5 | HD | Portrait performs better |
| Instagram Story | 9:16 | Standard | Full screen mobile |
| Facebook Feed | 1:1 | Standard | Square recommended |
| LinkedIn | 1:1 | Standard | Professional tone |
| YouTube | 16:9 | HD | Must be landscape |
| TikTok | 9:16 | HD | Vertical only |
| Pinterest | 4:5 | HD | Tall images preferred |

## 🐛 Common Errors

```typescript
401 → Check authentication
400 → Prohibited terms or short prompt
429 → Rate limit, wait 1-2 minutes
500 → OpenAI API error, check key
```

## ✅ Validation Rules

```typescript
Prompt:
  - Min: 10 characters
  - Max: 4000 characters
  - No prohibited terms

Image Generation:
  - Model: DALL-E 3
  - Timeout: 30 seconds
  - Auto-retry: No (manual only)
```

## 🎯 Best Practices

**Prompts:**
- Be specific (lighting, setting, mood)
- Use professional language
- Include business context
- Avoid text in images

**Quality:**
- Use Standard for testing
- Use HD for final export
- Generate at target ratio

**Export:**
- Edit once, export to all platforms
- Keep original for variations
- Download all formats together

## 🚨 Troubleshooting

**Generation fails:**
1. Check OPENAI_API_KEY env var
2. Verify OpenAI account credits
3. Review prompt for policy violations
4. Check prompt length (10-4000)

**Editor not working:**
1. Check image CORS settings
2. Verify canvas support
3. Try different browser

**Export issues:**
1. Disable popup blocker
2. Allow downloads in browser
3. Try single format first

## 📈 Performance

```
Generation Time:
  - Standard: ~15 seconds
  - HD: ~20-30 seconds

Export Time:
  - 1 format: ~100ms
  - 4 formats: ~400ms
  - Processing: Client-side (Canvas API)

Optimization:
  - Generate at final ratio (no upscaling)
  - Edit before export
  - Batch downloads
```

## 🔐 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
OPENAI_ORG_ID=org-...
```

## 📦 Dependencies

```json
{
  "openai": "^4.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-scroll-area": "^1.x",
  "@radix-ui/react-checkbox": "^1.x"
}
```

---

**Quick Links:**
- [Full Guide](./AI_IMAGE_GENERATOR_GUIDE.md)
- [Onboarding Guide](./ONBOARDING_GUIDE.md)
- [DALL-E 3 Docs](https://platform.openai.com/docs/guides/images)
