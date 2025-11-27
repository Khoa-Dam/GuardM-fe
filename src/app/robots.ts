import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: ['/(protected)/admin/', '/api/'],
    },
    sitemap: 'https://www.guardm.space/sitemap.xml',
  }
}
