import { env } from "@/env";

/**
 * Get favicon URL from Google's favicon service
 */
export function getFaviconUrl(homepageUrl: string): string {
  try {
    const url = new URL(homepageUrl);
    const domain = url.hostname;
    // Using Google's favicon service for high quality favicons
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error("Invalid URL for favicon:", homepageUrl);
    return "";
  }
}

/**
 * Upload logo to R2 and return the public URL
 */
export async function uploadLogoToR2(file: File, serverSlug: string): Promise<string> {
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename with timestamp to avoid caching issues
    const ext = file.name.split('.').pop() || 'webp';
    const filename = `${serverSlug}-${Date.now()}.${ext}`;
    const key = `logos/${filename}`;

    // TODO: Implement actual R2 upload
    // For now, we'll mock this and return a placeholder URL
    // In production, this would:
    // 1. Optimize the image (resize, convert to WebP)
    // 2. Upload to R2 with proper cache headers
    // 3. Return the CDN URL
    
    console.log("Uploading logo to R2:", {
      filename,
      size: file.size,
      type: file.type,
    });

    // Mock R2 URL
    return `https://r2.mcpserverslist.com/${key}`;

    // Real implementation would look like:
    // const optimizedBuffer = await optimizeImage(buffer, {
    //   width: 256,
    //   height: 256,
    //   format: 'webp',
    // });
    //
    // await r2.put(key, optimizedBuffer, {
    //   httpMetadata: {
    //     contentType: 'image/webp',
    //     cacheControl: 'public, max-age=31536000, immutable',
    //   },
    // });
    //
    // return `${env.R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error("Failed to upload logo to R2:", error);
    throw new Error("Failed to upload logo");
  }
}

/**
 * Process logo from various sources
 */
export async function processLogo(options: {
  logoFile?: File | null;
  logoUrl?: string | null;
  homepageUrl?: string | null;
  serverSlug: string;
}): Promise<string | null> {
  const { logoFile, logoUrl, homepageUrl, serverSlug } = options;

  // Priority 1: Uploaded file
  if (logoFile && logoFile.size > 0) {
    return await uploadLogoToR2(logoFile, serverSlug);
  }

  // Priority 2: Direct logo URL
  if (logoUrl) {
    // TODO: In production, we might want to download and re-upload to R2
    // to ensure availability and optimize the image
    return logoUrl;
  }

  // Priority 3: Favicon from homepage
  if (homepageUrl) {
    return getFaviconUrl(homepageUrl);
  }

  return null;
}