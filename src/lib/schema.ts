import { Server } from '@/lib/db/schema';

export function generateServerJsonLd(server: Server) {
  if (!server) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": server.name,
    "description": server.shortDesc,
    "url": server.homepageUrl || server.repoUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "softwareVersion": "Latest",
    "author": {
      "@type": "Organization",
      "name": server.name
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
}