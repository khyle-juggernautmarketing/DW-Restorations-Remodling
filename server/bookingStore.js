const STORE_KEY = 'dw_restorations_bookings'

function getMemoryStore() {
  if (!globalThis.__dwBookings) {
    globalThis.__dwBookings = []
  }
  return globalThis.__dwBookings
}

async function readFromKv(env) {
  const url = env.KV_REST_API_URL
  const token = env.KV_REST_API_TOKEN
  if (!url || !token) return null

  const response = await fetch(`${url}/get/${STORE_KEY}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) return null
  const data = await response.json()
  if (!data.result) return []
  try {
    return JSON.parse(data.result)
  } catch {
    return []
  }
}

async function writeToKv(env, bookings) {
  const url = env.KV_REST_API_URL
  const token = env.KV_REST_API_TOKEN
  if (!url || !token) return false

  const response = await fetch(
    `${url}/set/${STORE_KEY}/${encodeURIComponent(JSON.stringify(bookings))}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.ok
}

export async function listBookings(env) {
  const fromKv = await readFromKv(env)
  if (fromKv) return fromKv
  return getMemoryStore()
}

export async function addBooking(env, booking) {
  const bookings = await listBookings(env)
  const exists = bookings.some((b) => b.isoStart === booking.isoStart)
  if (exists) {
    throw new Error('That time slot is no longer available.')
  }

  bookings.push(booking)
  const saved = await writeToKv(env, bookings)
  if (!saved) {
    const memory = getMemoryStore()
    if (!memory.some((b) => b.isoStart === booking.isoStart)) {
      memory.push(booking)
    }
  }

  return booking
}

export async function pruneOldBookings(env) {
  const bookings = await listBookings(env)
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const fresh = bookings.filter((b) => new Date(b.isoStart).getTime() >= cutoff)
  if (fresh.length !== bookings.length) {
    await writeToKv(env, fresh)
    globalThis.__dwBookings = fresh
  }
  return fresh
}
