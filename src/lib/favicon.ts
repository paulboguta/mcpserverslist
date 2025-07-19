// SVG placeholder for when no favicon/logo is available
export const SVG_PLACEHOLDER = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="4" fill="#64748B"/>
  <path d="M8 10h8M8 14h6" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
`).toString("base64")}`;

// Generate favicon URL from homepage URL
export function getFaviconUrl(homepageUrl: string): string {
  try {
    const url = new URL(homepageUrl);
    const domain = url.hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    console.error("Invalid URL for favicon:", homepageUrl);
    return SVG_PLACEHOLDER;
  }
}
