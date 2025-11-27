import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://www.guardm.space/sitemap.xml',
  }
}
