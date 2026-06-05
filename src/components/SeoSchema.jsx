import {
  COMPANY_NAME,
  LOCATION,
  SERVICE_AREA,
  SITE_URL,
  TAGLINE,
} from '../config/brand'

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: COMPANY_NAME,
  image: `${SITE_URL}/logo.webp`,
  url: SITE_URL,
  description: `${TAGLINE} Full-service home remodeling, storm damage restoration, and roof replacement across Northeast Ohio.`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lorain',
    addressRegion: 'OH',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Lorain', addressRegion: 'OH' },
    { '@type': 'City', name: 'Cleveland', addressRegion: 'OH' },
    { '@type': 'City', name: 'Akron', addressRegion: 'OH' },
  ],
  slogan: TAGLINE,
  priceRange: '$$',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '17:00',
    },
  ],
}

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${COMPANY_NAME} | ${LOCATION} Restoration Experts`,
  description: `Property restoration and management experts serving ${SERVICE_AREA}.`,
  url: SITE_URL,
  isPartOf: {
    '@type': 'WebSite',
    name: COMPANY_NAME,
    url: SITE_URL,
  },
}

export default function SeoSchema() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
    </>
  )
}
