import { pruneOldBookings, addBooking } from '../server/bookingStore.js'
import {
  generateDaySlots,
  getBookableDateKeys,
  isSlotAvailable,
} from '../server/bookingUtils.js'
import {
  applySecurityHeaders,
  checkRateLimit,
  getClientIp,
  redactBookingsForClient,
  sanitizeString,
} from '../server/security.js'

export const config = {
  runtime: 'nodejs',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s().+-]{7,32}$/
const ISO_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  applySecurityHeaders(res, { origin, env: process.env })

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const ip = getClientIp(req.headers)

  try {
    const bookings = await pruneOldBookings(process.env)

    if (req.method === 'GET') {
      const rate = checkRateLimit(`bookings-get:${ip}`, { limit: 30, windowMs: 60_000 })
      if (!rate.allowed) {
        res.status(429).json({ error: 'Too many requests. Please try again later.' })
        return
      }

      res.status(200).json({ bookings: redactBookingsForClient(bookings) })
      return
    }

    if (req.method === 'POST') {
      const rate = checkRateLimit(`bookings-post:${ip}`, { limit: 8, windowMs: 60_000 })
      if (!rate.allowed) {
        res.status(429).json({ error: 'Too many requests. Please try again later.' })
        return
      }

      const { isoStart, name, email, phone } = req.body ?? {}
      const cleanIso = sanitizeString(isoStart, 40)
      const cleanName = sanitizeString(name, 120)
      const cleanEmail = sanitizeString(email, 254).toLowerCase()
      const cleanPhone = sanitizeString(phone, 32)

      if (!cleanIso || !cleanName || !cleanEmail || !cleanPhone) {
        res.status(400).json({ error: 'Missing booking details.' })
        return
      }

      if (!ISO_RE.test(cleanIso)) {
        res.status(400).json({ error: 'Invalid appointment time.' })
        return
      }

      if (!EMAIL_RE.test(cleanEmail)) {
        res.status(400).json({ error: 'Invalid email address.' })
        return
      }

      if (!PHONE_RE.test(cleanPhone)) {
        res.status(400).json({ error: 'Invalid phone number.' })
        return
      }

      if (!isSlotAvailable(cleanIso, bookings)) {
        res.status(409).json({ error: 'That time slot is no longer available.' })
        return
      }

      const dateKeys = getBookableDateKeys()
      const allowed = dateKeys.some((key) =>
        generateDaySlots(key).some((slot) => slot.isoStart === cleanIso),
      )
      if (!allowed) {
        res.status(400).json({ error: 'Invalid appointment time.' })
        return
      }

      const booking = await addBooking(process.env, {
        isoStart: cleanIso,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
      })

      res.status(200).json({
        success: true,
        booking: { isoStart: booking.isoStart },
      })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[bookings]', err.message)
    res.status(500).json({ error: 'Booking failed.' })
  }
}
