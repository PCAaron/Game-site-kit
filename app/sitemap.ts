import { MetadataRoute } from 'next'
import { getSiteInstance } from '@/lib/site/get-site-instance'
import { buildProductionSitemap } from '@/lib/seo/production-state'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteInstance()
  return buildProductionSitemap(site)
}
