import { validateLead } from './validateLead.js'
import { forwardLeadToN8n } from './forwardLead.js'
import { addBooking, pruneOldBookings, removeBooking } from './bookingStore.js'
import { isIsoBookable, isSlotAvailable } from './bookingUtils.js'
import { checkRateLimit, getClientIp, sanitizeString } from './security.js'

const ISO_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

export async function handleSubmitLead(body, env, { ip } = {}) {
  const clientIp = ip || 'unknown'
  const rate = checkRateLimit(`submit:${clientIp}`, { limit: 10, windowMs: 60_000 })
  if (!rate.allowed) {
    return { status: 429, body: { error: 'Too many requests. Please try again later.' } }
  }

  const validation = validateLead(body)
  if (!validation.ok) {
    if (validation.silent) {
      return { status: 200, body: { success: true } }
    }
    return { status: validation.status, body: { error: validation.message } }
  }

  const payload = {
    ...validation.data,
    submissionType: body.appointment?.isoStart ? 'scheduled' : 'form_only',
  }

  let reservedIso = null

  if (body.appointment?.isoStart) {
    const isoStart = sanitizeString(body.appointment.isoStart, 40)
    if (!ISO_RE.test(isoStart)) {
      return { status: 400, body: { error: 'Invalid appointment time.' } }
    }

    if (!isIsoBookable(isoStart)) {
      return { status: 400, body: { error: 'Invalid appointment time.' } }
    }

    const bookings = await pruneOldBookings(env)
    if (!isSlotAvailable(isoStart, bookings)) {
      return { status: 409, body: { error: 'That time slot is no longer available.' } }
    }

    try {
      await addBooking(env, {
        isoStart,
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        createdAt: new Date().toISOString(),
      })
      reservedIso = isoStart
    } catch (err) {
      return {
        status: 409,
        body: { error: err.message || 'That time slot is no longer available.' },
      }
    }

    payload.appointment = {
      isoStart,
      dateLabel: sanitizeString(body.appointment.dateLabel, 80),
      timeLabel: sanitizeString(body.appointment.timeLabel, 40),
      timezone: 'America/New_York',
    }
  }

  try {
    await forwardLeadToN8n(payload, env)
    return { status: 200, body: { success: true } }
  } catch (err) {
    console.error('[submit-lead upstream]', err.message)
    if (reservedIso) {
      await removeBooking(env, reservedIso).catch(() => {})
    }
    return {
      status: 502,
      body: { error: 'Unable to process your request. Please try again.' },
    }
  }
}

export { getClientIp }
