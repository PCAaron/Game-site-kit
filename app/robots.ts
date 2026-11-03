import { MetadataRoute } from 'next'
import { getSiteInstance } from '@/lib/site/get-site-instance'
import { siteUrl } from '@/lib/urls/site-url'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const site = getSiteInstance()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: siteUrl('/sitemap.xml', site),
    host: siteUrl(undefined, site),
  }
}
