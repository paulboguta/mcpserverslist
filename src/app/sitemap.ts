import { MetadataRoute } from 'next'
import { websiteConfig } from '@/config/website'
import { getAllServers } from '@/use-cases/servers'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const servers = await getAllServers()
  
  const serverUrls: MetadataRoute.Sitemap = servers.map((server) => ({
    url: `${websiteConfig.url}/server/${server.slug}`,
    lastModified: server.updatedAt || server.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: websiteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${websiteConfig.url}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...serverUrls,
  ]
}