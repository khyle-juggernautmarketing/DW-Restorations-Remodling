import { timingSafeEqual } from 'node:crypto'

const rateLimitStore = globalThis.__dwRateLimit ?? new Map()
globalThis.__dwRateLimit = rateLimitStore

const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
const HTML_TAGS = /<[^>]*>/g

export function sanitizeString(value, maxLength = 500) {
  if (typeof value !== 'string') return ''
  return value
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAGS, '')
    .trim()
    .slice(0, maxLength)
}

export function getClientIp(headers = {}) {
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return headers['x-real-ip'] || headers['X-Real-Ip'] || 'unknown'
}

export function checkRateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now()
  const bucket = rateLimitStore.get(key) ?? { count: 0, resetAt: now + windowMs }

  if (now > bucket.resetAt) {
    bucket.count = 0
    bucket.resetAt = now + windowMs
  }

  bucket.count += 1
  rateLimitStore.set(key, bucket)

  if (bucket.count > limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function isAllowedOrigin(origin, env) {
  if (!origin) return env.NODE_ENV !== 'production'

  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  if (allowed.length === 0) {
    return env.NODE_ENV !== 'production'
  }

  return allowed.some((o) => origin === o || origin.endsWith(o))
}

export function validateWebhookConfig(env) {
  const webhookUrl = env.N8N_WEBHOOK_URL
  const authSecret = env.N8N_AUTH_TOKEN

  if (!webhookUrl || !authSecret) {
    throw new Error('Server configuration error.')
  }

  let parsed
  try {
    parsed = new URL(webhookUrl)
  } catch {
    throw new Error('Invalid webhook configuration.')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('Webhook must use HTTPS.')
  }

  if (authSecret.length < 8) {
    throw new Error('Invalid webhook authentication configuration.')
  }

  return { webhookUrl, authSecret }
}

export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function applySecurityHeaders(res, { origin, env } = {}) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  )
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

  if (origin && isAllowedOrigin(origin, env)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export function redactBookingsForClient(bookings = []) {
  return bookings.map(({ isoStart }) => ({ isoStart }))
}
