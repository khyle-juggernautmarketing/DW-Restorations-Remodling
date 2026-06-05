export const TIMEZONE = 'America/New_York'
export const SLOT_MINUTES = 15
export const BLOCK_MINUTES = 90
export const BLOCK_SLOTS = BLOCK_MINUTES / SLOT_MINUTES
export const MAX_DAYS_OUT = 3

const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const DATE_KEY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function getEstDateKey(date = new Date()) {
  return DATE_KEY_FORMAT.format(date)
}

export function getEstWeekday(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
  }).format(date)
}

export function isSunday(date = new Date()) {
  return getEstWeekday(date) === 'Sun'
}

export function formatEstDateLabel(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  return DAY_FORMAT.format(utcGuess)
}

export function formatEstTimeLabel(isoStart) {
  return TIME_FORMAT.format(new Date(isoStart))
}

function getEstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  return {
    weekday: map.weekday,
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  }
}

export function getDayHours(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const weekday = getEstWeekday(utcGuess)

  if (weekday === 'Sun') return null
  if (weekday === 'Sat') return { open: 10, close: 17 }
  return { open: 8, close: 20 }
}

export function getBookableDateKeys(fromDate = new Date()) {
  const keys = []
  const cursor = new Date(fromDate)

  while (keys.length < MAX_DAYS_OUT + 1) {
    if (!isSunday(cursor)) {
      keys.push(getEstDateKey(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return keys
}

function zonedTimeToUtc(dateKey, hour, minute) {
  const [year, month, day] = dateKey.split('-').map(Number)
  let guess = Date.UTC(year, month - 1, day, hour + 5, minute, 0)

  for (let i = 0; i < 4; i += 1) {
    const parts = getEstParts(new Date(guess))
    const deltaMinutes = (hour - parts.hour) * 60 + (minute - parts.minute)
    if (deltaMinutes === 0 && getEstDateKey(new Date(guess)) === dateKey) {
      return new Date(guess).toISOString()
    }
    guess += deltaMinutes * 60 * 1000
  }

  return new Date(guess).toISOString()
}

export function generateDaySlots(dateKey, now = new Date()) {
  const hours = getDayHours(dateKey)
  if (!hours) return []

  const slots = []
  const lastStartMinutes = hours.close * 60 - BLOCK_MINUTES
  const firstStartMinutes = hours.open * 60

  for (
    let minutes = firstStartMinutes;
    minutes <= lastStartMinutes;
    minutes += SLOT_MINUTES
  ) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    const isoStart = zonedTimeToUtc(dateKey, hour, minute)
    const startDate = new Date(isoStart)

    if (startDate.getTime() <= now.getTime()) continue

    slots.push({
      isoStart,
      label: TIME_FORMAT.format(startDate),
      dateKey,
    })
  }

  return slots
}

export function normalizeSlotMs(isoStart) {
  const ms = new Date(isoStart).getTime()
  if (Number.isNaN(ms)) return null
  const slotMs = SLOT_MINUTES * 60 * 1000
  return Math.floor(ms / slotMs) * slotMs
}

export function isIsoBookable(isoStart, now = new Date()) {
  const startMs = new Date(isoStart).getTime()
  // Allow a short grace window while the user confirms on the calendar step
  if (Number.isNaN(startMs) || startMs <= now.getTime() - 120_000) return false

  const dateKey = getEstDateKey(new Date(isoStart))
  const dateKeys = getBookableDateKeys(now)
  if (!dateKeys.includes(dateKey)) return false

  const hours = getDayHours(dateKey)
  if (!hours) return false

  const parts = getEstParts(new Date(isoStart))
  const slotMinutes = parts.hour * 60 + parts.minute
  const firstStart = hours.open * 60
  const lastStart = hours.close * 60 - BLOCK_MINUTES

  if (slotMinutes < firstStart || slotMinutes > lastStart) return false
  if (slotMinutes % SLOT_MINUTES !== 0) return false

  return normalizeSlotMs(isoStart) === startMs
}

export function getBlockedIsoStarts(bookings = []) {
  const blocked = new Set()

  for (const booking of bookings) {
    const bookingMs = normalizeSlotMs(booking.isoStart)
    if (bookingMs === null) continue
    for (let i = 0; i < BLOCK_SLOTS; i += 1) {
      blocked.add(bookingMs + i * SLOT_MINUTES * 60 * 1000)
    }
  }

  return blocked
}

export function filterAvailableSlots(slots, bookings = []) {
  const blocked = getBlockedIsoStarts(bookings)
  return slots.filter((slot) => {
    const slotMs = normalizeSlotMs(slot.isoStart)
    return slotMs !== null && !blocked.has(slotMs)
  })
}

export function isSlotAvailable(isoStart, bookings = []) {
  const targetMs = normalizeSlotMs(isoStart)
  if (targetMs === null) return false
  return !getBlockedIsoStarts(bookings).has(targetMs)
}
