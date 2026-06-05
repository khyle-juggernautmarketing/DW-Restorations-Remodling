import { handleSubmitLead, getClientIp } from '../server/handleSubmitLead.js'
import { applySecurityHeaders } from '../server/security.js'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  applySecurityHeaders(res, { origin, env: process.env })

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = req.body ?? {}
    const result = await handleSubmitLead(body, process.env, {
      ip: getClientIp(req.headers),
    })
    res.status(result.status).json(result.body)
  } catch (err) {
    console.error('[submit-lead]', err.message)
    res.status(500).json({
      error: 'Unable to process your request. Please try again.',
    })
  }
}
