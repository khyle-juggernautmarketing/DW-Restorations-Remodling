export function formatApiError(data, status) {
  if (!data || typeof data !== 'object') {
    return `Submission failed (${status}). Please try again.`
  }

  const candidate =
    data.error ?? data.message ?? data.detail ?? data.description

  if (typeof candidate === 'string' && candidate.trim()) {
    return candidate.trim()
  }

  if (candidate && typeof candidate === 'object') {
    const nested =
      candidate.message ?? candidate.error ?? candidate.description
    if (typeof nested === 'string' && nested.trim()) {
      return nested.trim()
    }
  }

  if (typeof data.error === 'object' && data.error !== null) {
    try {
      const serialized = JSON.stringify(data.error)
      if (serialized && serialized !== '{}') {
        return serialized
      }
    } catch {
      /* ignore */
    }
  }

  return `Submission failed (${status}). Please try again.`
}

export function getErrorMessage(error, fallback) {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (error instanceof Error && error.message && error.message !== '[object Object]') {
    return error.message
  }

  if (typeof error === 'object') {
    const fromObject = formatApiError(error, '')
    if (fromObject && !fromObject.startsWith('Submission failed ()')) {
      return fromObject
    }
  }

  return fallback
}
