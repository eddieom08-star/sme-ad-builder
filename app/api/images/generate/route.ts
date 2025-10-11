import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";
import { containsProhibitedTerms } from "@/lib/ai/prompt-library";

// Image aspect ratios supported by DALL-E 3
type AspectRatio = "1:1" | "16:9" | "9:16";

const ASPECT_RATIO_SIZES = {
  "1:1": "1024x1024",
  "16:9": "1792x1024",
  "9:16": "1024x1792",
} as const;

interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: AspectRatio;
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: GenerateImageRequest = await request.json();
    const {
      prompt,
      aspectRatio = "1:1",
      quality = "standard",
      style = "vivid",
    } = body;

    // 3. Validate prompt
    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "Prompt must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: "Prompt is too long (max 4000 characters)" },
        { status: 400 }
      );
    }

    // 4. Check for prohibited terms
    const prohibitedCheck = containsProhibitedTerms(prompt);
    if (prohibitedCheck.hasProhibited) {
      return NextResponse.json(
        {
          error: "Prompt contains prohibited terms",
          prohibitedTerms: prohibitedCheck.foundTerms,
          message: `Please remove the following terms: ${prohibitedCheck.foundTerms.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Initialize OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 6. Enhanced prompt with safety guardrails
    const enhancedPrompt = `${prompt}.

Style requirements: Professional marketing image, appropriate for business advertising, family-friendly, no text or words in the image, no people's faces (unless stock photo style), high quality commercial photography.

Content restrictions: No logos, no brand names, no competitor references, no medical claims, no guarantees, no before/after comparisons.`;

    // 7. Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt.trim(),
      n: 1,
      size: ASPECT_RATIO_SIZES[aspectRatio],
      quality: quality,
      style: style,
      response_format: "url",
    });

    // 8. Extract image URL
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // 9. Content safety check (OpenAI's built-in + additional validation)
    const revisedPrompt = response.data[0]?.revised_prompt;

    // Check if OpenAI significantly changed the prompt (safety flag)
    const promptSimilarity = calculateSimilarity(prompt, revisedPrompt || "");
    if (promptSimilarity < 0.5) {
      console.warn("Prompt was significantly revised by OpenAI:", {
        original: prompt,
        revised: revisedPrompt,
      });
    }

    // 10. Return success response
    return NextResponse.json({
      success: true,
      data: {
        imageUrl,
        revisedPrompt,
        aspectRatio,
        quality,
        style,
        metadata: {
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
          model: "dall-e-3",
        },
      },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);

    // Handle OpenAI specific errors
    if (error.status === 400) {
      return NextResponse.json(
        {
          error: "Invalid request to OpenAI",
          message: error.message || "The request was rejected by OpenAI",
        },
        { status: 400 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    if (error.code === "content_policy_violation") {
      return NextResponse.json(
        {
          error: "Content policy violation",
          message: "The prompt violates OpenAI's content policy. Please modify your request.",
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Image generation failed",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate basic text similarity
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// GET endpoint to check API status
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasApiKey = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    status: hasApiKey ? "ready" : "not_configured",
    message: hasApiKey
      ? "Image generation API is ready"
      : "OpenAI API key not configured",
    supportedRatios: Object.keys(ASPECT_RATIO_SIZES),
    supportedQualities: ["standard", "hd"],
    supportedStyles: ["vivid", "natural"],
  });
}
