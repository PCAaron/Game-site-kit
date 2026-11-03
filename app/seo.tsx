import { Metadata } from 'next'
import { getSiteInstance } from '@/lib/site/get-site-instance'
import { buildLegacyTemplateMetadata } from '@/lib/seo/metadata'

interface PageSEOProps {
  title: string
  description?: string
  image?: string
  /** App route path for canonical, e.g. `/blog` */
  canonicalPath: string
}

export function genPageMetadata({
  title,
  description,
  image,
  canonicalPath,
}: PageSEOProps): Metadata {
  const site = getSiteInstance()
  return buildLegacyTemplateMetadata({
    title,
    description,
    canonicalPath,
    site,
    ogImage: image,
  })
}
