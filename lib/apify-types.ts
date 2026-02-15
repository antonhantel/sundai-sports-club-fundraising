/**
 * Apify Google Maps Scraper input and output types
 * Actor ID: nwua9Gu5YrADL7ZDj (compass/google-maps-scraper)
 */

/** Input matching the official Apify Google Maps Scraper documentation */
export interface ApifyRunInput {
  searchStringsArray: string[]
  locationQuery: string
  maxCrawledPlacesPerSearch?: number
  language?: string
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
  maxReviews?: number
  reviewsSort?: string
  reviewsFilterString?: string
  reviewsOrigin?: string
  scrapeReviewsPersonalData?: boolean
  maxImages?: number
  scrapeImageAuthors?: boolean
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
  rating?: number | string
  reviews?: number
  totalScore?: number
  reviewsCount?: number
  [key: string]: unknown
}
