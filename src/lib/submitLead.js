import { formatApiError } from './formatError'

export async function submitLead(payload) {
  let response
  try {
    response = await fetch('/api/submit-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        ...payload,
        consent: true,
        website: payload.website ?? '',
      }),
    })
  } catch {
    throw new Error('Network error. Please check your connection and try again.')
  }

  const raw = await response.text()
  let data = {}

  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      if (!response.ok) {
        throw new Error(
          raw.length > 200
            ? 'Submission failed. Please try again.'
            : raw,
        )
      }
    }
  }

  if (!response.ok) {
    throw new Error(formatApiError(data, response.status))
  }

  if (data.success !== true && data.error) {
    throw new Error(formatApiError(data, response.status))
  }

  return data
}
