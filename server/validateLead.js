import { sanitizeString } from './security.js'

const LIMITS = {
  name: 120,
  email: 254,
  phone: 32,
  address: 300,
  service: 120,
  timeline: 120,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s().+-]{7,32}$/

export function validateLead(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, message: 'Invalid request body.' }
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return { ok: false, status: 200, silent: true }
  }

  const service = sanitizeString(body.service, LIMITS.service)
  const timeline = sanitizeString(body.timeline, LIMITS.timeline)
  const name = sanitizeString(body.name, LIMITS.name)
  const email = sanitizeString(body.email, LIMITS.email).toLowerCase()
  const phone = sanitizeString(body.phone, LIMITS.phone)
  const address = sanitizeString(body.address, LIMITS.address)

  if (!service) {
    return { ok: false, status: 400, message: 'Please select a valid service.' }
  }
  if (!timeline) {
    return { ok: false, status: 400, message: 'Please select a valid timeline.' }
  }
  if (!name) {
    return { ok: false, status: 400, message: 'Please enter your full name.' }
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, status: 400, message: 'Please enter a valid email address.' }
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return { ok: false, status: 400, message: 'Please enter a valid phone number.' }
  }
  if (!address) {
    return { ok: false, status: 400, message: 'Please enter your property address.' }
  }
  if (body.consent !== true) {
    return { ok: false, status: 400, message: 'Consent is required to submit.' }
  }

  return {
    ok: true,
    data: { service, timeline, name, email, phone, address },
  }
}
