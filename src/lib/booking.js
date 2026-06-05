export {
  TIMEZONE,
  SLOT_MINUTES,
  BLOCK_MINUTES,
  MAX_DAYS_OUT,
  getEstDateKey,
  formatEstDateLabel,
  formatEstTimeLabel,
  getBookableDateKeys,
  generateDaySlots,
  filterAvailableSlots,
} from '../../server/bookingUtils.js'

export async function fetchBookings() {
  const response = await fetch('/api/bookings', {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
  })
  if (!response.ok) {
    throw new Error('Unable to load availability.')
  }
  const data = await response.json()
  return data.bookings ?? []
}

export async function reserveBooking({ isoStart, name, email, phone }) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ isoStart, name, email, phone }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || 'Unable to reserve that time slot.')
  }
  return data.booking
}

export const PENDING_LEAD_KEY = 'dw_pending_lead'
export const FALLBACK_MS = 10 * 60 * 1000

export function savePendingLead(lead) {
  sessionStorage.setItem(
    PENDING_LEAD_KEY,
    JSON.stringify({ ...lead, savedAt: Date.now(), submitted: false }),
  )
}

export function loadPendingLead() {
  try {
    const raw = sessionStorage.getItem(PENDING_LEAD_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function markPendingSubmitted() {
  const lead = loadPendingLead()
  if (lead) {
    sessionStorage.setItem(
      PENDING_LEAD_KEY,
      JSON.stringify({ ...lead, submitted: true }),
    )
  }
}

export function clearPendingLead() {
  sessionStorage.removeItem(PENDING_LEAD_KEY)
}
