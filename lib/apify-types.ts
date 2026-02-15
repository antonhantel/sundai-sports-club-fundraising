/**
 * Apify Google Maps Scraper input and output types
 * Actor ID: nwua9Gu5YrADL7ZDj (compass/google-maps-scraper)
 */

export interface ApifyRunInput {
  searchStringsArray: string[]
  locationQuery: string
  maxCrawledPlacesPerSearch?: number
  language?: string
  categoryFilterWords?: string | null
  searchMatching?: "all" | "any"
  placeMinimumStars?: string
  website?: "allPlaces" | "withWebsite" | "withoutWebsite"
  skipClosedPlaces?: boolean
  scrapePlaceDetailPage?: boolean
  scrapeTableReservationProvider?: boolean
  includeWebResults?: boolean
  scrapeDirectories?: boolean
  maxQuestions?: number
  scrapeContacts?: boolean
  scrapeSocialMediaProfiles?: {
    facebooks?: boolean
    instagrams?: boolean
    youtubes?: boolean
    tiktoks?: boolean
    twitters?: boolean
  }
  maximumLeadsEnrichmentRecords?: number
  leadsEnrichmentDepartments?: string[] | null
  maxReviews?: number
  reviewsStartDate?: string | null
  reviewsSort?: string
  reviewsFilterString?: string
  reviewsOrigin?: string
  scrapeReviewsPersonalData?: boolean
  maxImages?: number
  scrapeImageAuthors?: boolean
  countryCode?: string | null
  city?: string | null
  state?: string | null
  county?: string | null
  postalCode?: string | null
  customGeolocation?: string | null
  startUrls?: string[] | null
  placeIds?: string[] | null
  allPlacesNoSearchAction?: string
}

export interface ApifyPlaceResult {
  title?: string
  name?: string
  address?: string
  full_address?: string
  category?: string
  categories?: string[]
  phone?: string
  phoneNumber?: string
  url?: string
  website?: string
  email?: string
  city?: string
  state?: string
  country?: string
  [key: string]: unknown
}
