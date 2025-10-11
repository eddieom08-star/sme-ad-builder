/**
 * Image Export Utilities
 *
 * Handles exporting images in multiple formats and sizes for different platforms
 */

export interface ExportFormat {
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
}

// Platform-specific image sizes
export const EXPORT_FORMATS: Record<string, ExportFormat[]> = {
  "1:1": [
    { name: "Instagram Post", platform: "Instagram", width: 1080, height: 1080, aspectRatio: "1:1" },
    { name: "Facebook Post", platform: "Facebook", width: 1200, height: 1200, aspectRatio: "1:1" },
    { name: "LinkedIn Post", platform: "LinkedIn", width: 1200, height: 1200, aspectRatio: "1:1" },
    { name: "Twitter Post", platform: "Twitter", width: 1200, height: 1200, aspectRatio: "1:1" },
  ],
  "4:5": [
    { name: "Instagram Portrait", platform: "Instagram", width: 1080, height: 1350, aspectRatio: "4:5" },
    { name: "Facebook Portrait", platform: "Facebook", width: 1080, height: 1350, aspectRatio: "4:5" },
    { name: "Pinterest Pin", platform: "Pinterest", width: 1000, height: 1500, aspectRatio: "2:3" },
  ],
  "16:9": [
    { name: "YouTube Thumbnail", platform: "YouTube", width: 1280, height: 720, aspectRatio: "16:9" },
    { name: "Facebook Cover", platform: "Facebook", width: 820, height: 312, aspectRatio: "820:312" },
    { name: "Twitter Header", platform: "Twitter", width: 1500, height: 500, aspectRatio: "3:1" },
    { name: "LinkedIn Banner", platform: "LinkedIn", width: 1584, height: 396, aspectRatio: "4:1" },
  ],
  "9:16": [
    { name: "Instagram Story", platform: "Instagram", width: 1080, height: 1920, aspectRatio: "9:16" },
    { name: "Facebook Story", platform: "Facebook", width: 1080, height: 1920, aspectRatio: "9:16" },
    { name: "TikTok Video", platform: "TikTok", width: 1080, height: 1920, aspectRatio: "9:16" },
    { name: "Snapchat Ad", platform: "Snapchat", width: 1080, height: 1920, aspectRatio: "9:16" },
  ],
};

export interface ExportResult {
  format: ExportFormat;
  dataUrl: string;
  blob: Blob;
}

/**
 * Resize image to specific dimensions while maintaining quality
 */
async function resizeImage(
  imageUrl: string,
  width: number,
  height: number,
  quality: number = 0.95
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Calculate aspect ratios
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;

      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

      // Crop to fit target aspect ratio (cover mode)
      if (imgAspect > targetAspect) {
        // Image is wider than target - crop sides
        sWidth = img.height * targetAspect;
        sx = (img.width - sWidth) / 2;
      } else if (imgAspect < targetAspect) {
        // Image is taller than target - crop top/bottom
        sHeight = img.width / targetAspect;
        sy = (img.height - sHeight) / 2;
      }

      // Draw image with cropping
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);

      // Convert to blob and data URL
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          const dataUrl = canvas.toDataURL("image/png", quality);
          resolve({ dataUrl, blob });
        },
        "image/png",
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

/**
 * Export image in multiple formats
 */
export async function exportMultipleFormats(
  imageUrl: string,
  baseAspectRatio: string,
  selectedFormats?: ExportFormat[]
): Promise<ExportResult[]> {
  const formats = selectedFormats || EXPORT_FORMATS[baseAspectRatio] || [];
  const results: ExportResult[] = [];

  for (const format of formats) {
    try {
      const { dataUrl, blob } = await resizeImage(
        imageUrl,
        format.width,
        format.height
      );

      results.push({
        format,
        dataUrl,
        blob,
      });
    } catch (error) {
      console.error(`Failed to export format ${format.name}:`, error);
    }
  }

  return results;
}

/**
 * Download a single exported format
 */
export function downloadExportedImage(
  result: ExportResult,
  customFileName?: string
) {
  const fileName =
    customFileName ||
    `${result.format.platform.toLowerCase()}-${result.format.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}.png`;

  const link = document.createElement("a");
  link.href = result.dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download all exported formats as a zip (requires JSZip)
 * For now, we'll download them individually
 */
export async function downloadAllFormats(
  results: ExportResult[],
  baseFileName: string = "ad-image"
) {
  for (const result of results) {
    const fileName = `${baseFileName}-${result.format.platform.toLowerCase()}-${result.format.width}x${result.format.height}.png`;
    downloadExportedImage(result, fileName);

    // Add small delay to prevent browser blocking multiple downloads
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Get recommended formats for a specific platform
 */
export function getRecommendedFormats(platform: string): ExportFormat[] {
  const allFormats = Object.values(EXPORT_FORMATS).flat();
  return allFormats.filter(
    (format) => format.platform.toLowerCase() === platform.toLowerCase()
  );
}

/**
 * Get all available platforms
 */
export function getAvailablePlatforms(): string[] {
  const allFormats = Object.values(EXPORT_FORMATS).flat();
  const platforms = new Set(allFormats.map((f) => f.platform));
  return Array.from(platforms).sort();
}
