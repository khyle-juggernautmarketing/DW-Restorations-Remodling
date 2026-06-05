import {
  AlertTriangle,
  Calendar,
  CloudLightning,
  FileText,
  Hammer,
  Home,
  Layers,
} from 'lucide-react'

export const COMPANY_NAME = 'DW Restorations & Remodeling LLC'
export const COMPANY_SHORT = 'DW Restorations'
export const TAGLINE = "Don't Worry. We Handle It."
export const SUBTITLE = 'Restoration Management'
export const LOCATION = 'Lorain, Ohio'
export const SITE_URL =
  import.meta.env.VITE_SITE_URL || 'https://dw-restorations-remodling.vercel.app'
export const SERVICE_AREA =
  'Lorain (core focus), 40-mile radius around Akron, and 20-mile radius around Cleveland, Ohio'

export const SERVICE_OPTIONS = [
  {
    id: 'home-remodeling',
    label: 'Complete Home Remodeling',
    icon: Home,
  },
  {
    id: 'storm-restoration',
    label: 'Storm Damage & Restoration',
    icon: CloudLightning,
  },
  {
    id: 'roof-replacement',
    label: 'Full Roof Replacement',
    icon: Hammer,
  },
  {
    id: 'exterior-interior',
    label: 'General Exterior / Interior Upgrade',
    icon: Layers,
  },
]

export const TIMELINE_OPTIONS = [
  {
    id: 'asap',
    label: 'ASAP / Active Damage Needs',
    icon: AlertTriangle,
  },
  {
    id: '2-4-weeks',
    label: 'Within 2–4 Weeks',
    icon: Calendar,
  },
  {
    id: 'planning',
    label: 'Just Planning / Costing Consultation',
    icon: FileText,
  },
]

export const VALUE_PROPS = [
  {
    title: 'Full-Scale Project Management',
    description:
      'We handle the logistics, permits, and paperwork from start to finish.',
  },
  {
    title: 'Serving Your Local Community',
    description:
      'Trusted across Lorain, a 40-mile radius around Akron, and a 20-mile radius around Cleveland.',
  },
  {
    title: 'Uncompromising Material Quality',
    description:
      "Premium structural choices designed for Ohio's unpredictable weather patterns.",
  },
]

export const TESTIMONIALS = [
  {
    id: 'lorain',
    location: 'Lorain Homeowner',
    rating: 5,
    quote:
      "True to their word, I didn't have to worry about a thing. They remodeled our entire kitchen and the project coordination was absolutely flawless.",
  },
  {
    id: 'cleveland-heights',
    location: 'Cleveland Heights Client',
    rating: 5,
    quote:
      'After a massive storm damaged our roof, they stepped in immediately. Fast, neat, professional, and handled the entire restoration from start to finish.',
  },
  {
    id: 'akron',
    location: 'Akron Area Project',
    rating: 5,
    quote:
      'It is incredibly rare to find general contractors this organized. They stayed exactly on schedule, respected our property, and delivered beautiful workmanship.',
  },
]
