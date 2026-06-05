import { validateLead } from './validateLead.js'
import { forwardLeadToN8n } from './forwardLead.js'
import {
  checkRateLimit,
  getClientIp,
  isAllowedOrigin,
  sanitizeString,
} from './security.js'

const ISO_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

export async function handleSubmitLead(body, env, { origin, ip } = {}) {
  if (env.NODE_ENV === 'production' && !isAllowedOrigin(origin, env)) {
    return { status: 403, body: { error: 'Forbidden' } }
  }

  const clientIp = ip || 'unknown'
  const rate = checkRateLimit(`submit:${clientIp}`, { limit: 5, windowMs: 60_000 })
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
    submissionType: body.appointment ? 'scheduled' : 'form_only',
  }

  if (body.appointment?.isoStart) {
    const isoStart = sanitizeString(body.appointment.isoStart, 40)
    if (!ISO_RE.test(isoStart)) {
      return { status: 400, body: { error: 'Invalid appointment time.' } }
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
    return {
      status: 502,
      body: { error: 'Unable to process your request. Please try again.' },
    }
  }
}

export { getClientIp }
