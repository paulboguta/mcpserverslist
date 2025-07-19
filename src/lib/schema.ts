import { Server } from '@/lib/db/schema';
import { websiteConfig } from '@/config/website';

export function generateServerJsonLd(server: Server) {
  if (!server) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": server.name,
    "description": server.shortDesc || server.longDesc,
    "url": server.homepageUrl || server.repoUrl,
    "downloadUrl": server.repoUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "softwareVersion": "Latest",
    "programmingLanguage": "JavaScript",
    "author": {
      "@type": "Organization",
      "name": server.name
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "license": server.license || "Open Source",
    "dateCreated": server.createdAt,
    "dateModified": server.updatedAt || server.createdAt,
    "mainEntityOfPage": `${websiteConfig.url}/server/${server.slug}`,
    "keywords": ["MCP", "Model Context Protocol", "AI", "LLM", server.name],
    "aggregateRating": server.stars ? {
      "@type": "AggregateRating",
      "ratingValue": Math.min(5, Math.max(1, Math.floor(server.stars / 200) + 1)),
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": server.stars
    } : undefined
  };
}

export function generateHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": websiteConfig.name,
    "description": websiteConfig.description,
    "url": websiteConfig.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${websiteConfig.url}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "MCP Servers Directory",
      "description": "A comprehensive directory of Model Context Protocol servers",
      "url": websiteConfig.url
    },
    "publisher": {
      "@type": "Organization",
      "name": websiteConfig.name,
      "url": websiteConfig.url
    }
  };
}