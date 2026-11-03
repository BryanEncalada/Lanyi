export interface SitePage {
  title: string;
  description: string;
  canonicalPath?: string;
  label?: string;
}
export interface SiteConfig {
  siteName: string;
  productionOrigin: string;
  indexableHosts: string[];
  defaultDescription: string;
  defaultImage: string;
  organization: { name: string; url: string; logo?: string; sameAs: string[] };
  analytics: { enabled: boolean; allowedHosts: string[]; gtmId: string; measurementId: string };
  pages: Record<string, SitePage>;
}
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'Lanyi Pisos',
  productionOrigin: 'https://lanyipisos.com',
  indexableHosts: ['lanyipisos.com', 'www.lanyipisos.com'],
  defaultDescription:
    'Pisos de madera, bambú, laminados y accesorios. Asesoría personalizada en Lima, Perú.',
  defaultImage: '/images/hero/hero01.jpeg',
  organization: { name: 'Lanyi Pisos', url: 'https://lanyipisos.com/', sameAs: [] },
  analytics: { enabled: false, allowedHosts: [], gtmId: '', measurementId: '' },
  pages: {},
};
export const pageKey = (path: string) => path.split(/[?#]/)[0].replace(/\/$/, '') || '/';
export function canIndex(config: SiteConfig, hostname: string): boolean {
  return config.indexableHosts.includes(hostname.toLowerCase());
}
export function canTrack(config: SiteConfig, hostname: string): boolean {
  return (
    config.analytics.enabled &&
    config.analytics.allowedHosts.includes(hostname.toLowerCase()) &&
    /^GTM-[A-Z0-9]+$/.test(config.analytics.gtmId) &&
    /^G-[A-Z0-9]+$/.test(config.analytics.measurementId)
  );
}
export function publicPageUrl(origin: string, path: string): string {
  return new URL(path.split(/[?#]/)[0], origin).href;
}
export function pageSchema(
  config: SiteConfig,
  url: string,
  title: string,
  description: string,
  image: string,
  type = 'website',
) {
  const origin = new URL(url).origin;
  const path = pageKey(new URL(url).pathname);
  const pieces = path.split('/').filter(Boolean);
  const organizationId = config.organization.url.replace(/\/$/, '') + '/#organization';
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: config.organization.name,
      url: config.organization.url,
      ...(config.organization.logo
        ? { logo: { '@type': 'ImageObject', url: config.organization.logo } }
        : {}),
      sameAs: config.organization.sameAs,
    },
    {
      '@type': 'WebSite',
      '@id': origin + '/#website',
      url: origin + '/',
      name: config.siteName,
      inLanguage: 'es-PE',
      publisher: { '@id': organizationId },
    },
    {
      '@type': type === 'article' ? 'Article' : 'WebPage',
      '@id': url,
      url,
      name: title,
      ...(type === 'article' ? { headline: title } : {}),
      description,
      inLanguage: 'es-PE',
      isPartOf: { '@id': origin + '/#website' },
      publisher: { '@id': organizationId },
      image,
      breadcrumb: { '@id': url + '#breadcrumb' },
    },
  ];
  const items: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: origin + '/' },
  ];
  if (pieces.length > 1)
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: config.pages['/' + pieces[0]]?.label ?? pieces[0],
      item: origin + '/' + pieces[0],
    });
  if (pieces.length)
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: config.pages[path]?.label ?? title.replace(/\s*(?:\||-)\s*Lanyi Pisos$/, ''),
      item: url,
    });
  graph.push({ '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: items });
  return { '@context': 'https://schema.org', '@graph': graph };
}
