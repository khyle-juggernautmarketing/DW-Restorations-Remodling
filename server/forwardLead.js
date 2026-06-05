import { generateN8nJwt } from './generateJwt.js'
import { validateWebhookConfig } from './security.js'

const WEBHOOK_TIMEOUT_MS = 10_000

export async function forwardLeadToN8n(data, env) {
  const { webhookUrl, authSecret } = validateWebhookConfig(env)
  const token = generateN8nJwt(authSecret)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'dw-restorations-landing/1.0',
      },
      body: JSON.stringify({
        ...data,
        consent: true,
        source: 'dw-restorations-landing',
        submittedAt: new Date().toISOString(),
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      let message = `Upstream error (${response.status})`
      try {
        const parsed = JSON.parse(text)
        message =
          parsed.message ||
          parsed.error?.message ||
          (typeof parsed.error === 'string' ? parsed.error : message)
      } catch {
        /* use generic message — never leak upstream body to client */
      }
      throw new Error(message)
    }

    return response.json().catch(() => ({}))
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Webhook request timed out.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
