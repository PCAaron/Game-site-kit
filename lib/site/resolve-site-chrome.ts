import headerNavLinks from '@/data/headerNavLinks'

import type { SiteInstance, SiteInstanceChrome, SiteFooterVariant } from './types'

type ResolvedSiteChrome = {
  footerVariant: SiteFooterVariant
  searchEnabled: boolean
  includeLegacyAboutNav: boolean
}

function archetypeChromeDefaults(archetype: SiteInstance['archetype']): ResolvedSiteChrome {
  if (archetype === 'game-portal') {
    return {
      footerVariant: 'portal',
      searchEnabled: false,
      includeLegacyAboutNav: false,
    }
  }
  return {
    footerVariant: 'legacy',
    searchEnabled: true,
    includeLegacyAboutNav: true,
  }
}

export function resolveSiteChrome(instance: SiteInstance): ResolvedSiteChrome {
  const base = archetypeChromeDefaults(instance.archetype)
  const override = instance.chrome ?? {}
  return {
    footerVariant: override.footerVariant ?? base.footerVariant,
    searchEnabled: override.searchEnabled ?? base.searchEnabled,
    includeLegacyAboutNav: override.includeLegacyAboutNav ?? base.includeLegacyAboutNav,
  }
}

const LEGACY_ABOUT_HREF = '/about'

export function resolveHeaderNavLinks(instance: SiteInstance) {
  const { includeLegacyAboutNav } = resolveSiteChrome(instance)
  if (includeLegacyAboutNav) {
    return headerNavLinks
  }
  return headerNavLinks.filter((link) => link.href !== LEGACY_ABOUT_HREF)
}

export type { SiteInstanceChrome, ResolvedSiteChrome }
