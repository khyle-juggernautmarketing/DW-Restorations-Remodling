import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import {
  fetchBookings,
  filterAvailableSlots,
  formatEstDateLabel,
  formatEstTimeLabel,
  generateDaySlots,
  getBookableDateKeys,
  getEstDateKey,
  TIMEZONE,
} from '../lib/booking'

export default function AppointmentCalendar({
  selectedIso,
  onSelect,
  disabled = false,
}) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dateKeys = useMemo(() => getBookableDateKeys(), [])
  const [activeDateKey, setActiveDateKey] = useState(dateKeys[0] ?? '')

  useEffect(() => {
    let cancelled = false

    fetchBookings()
      .then((data) => {
        if (!cancelled) setBookings(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const interval = setInterval(() => {
      fetchBookings()
        .then(setBookings)
        .catch(() => {})
    }, 30000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const slots = useMemo(() => {
    if (!activeDateKey) return []
    return filterAvailableSlots(generateDaySlots(activeDateKey), bookings)
  }, [activeDateKey, bookings])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-slate-700">
        <p className="flex items-center gap-2 font-semibold text-slate-900">
          <CalendarDays className="h-4 w-4 text-amber-500" aria-hidden="true" />
          Schedule Your Free On-Site Consultation
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Eastern Time ({TIMEZONE.replace('_', ' ')}) · Mon–Fri · 8:00 AM–8:00 PM ·
          Sat · 10:00 AM–5:00 PM · 15-minute slots · Each visit reserves 90 minutes ·
          Up to 3 days out
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Select a date</p>
        <div className="flex flex-wrap gap-2">
          {dateKeys.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => {
                setActiveDateKey(key)
                onSelect('')
              }}
              className={`min-h-12 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeDateKey === key
                  ? 'border-amber-500 bg-amber-500 text-slate-900 shadow-md'
                  : 'border-slate-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              {formatEstDateLabel(key)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
          When should we look at the property?
        </p>

        {loading ? (
          <div className="flex min-h-24 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Loading availability…
          </div>
        ) : slots.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No open times on this date. Please choose another day.
          </p>
        ) : (
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {slots.map((slot) => {
              const selected = selectedIso === slot.isoStart
              return (
                <button
                  key={slot.isoStart}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(slot.isoStart)}
                  className={`min-h-12 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-100'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {slot.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedIso && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Selected: {formatEstDateLabel(getEstDateKey(new Date(selectedIso)))} at{' '}
          {formatEstTimeLabel(selectedIso)} EST
        </p>
      )}
    </div>
  )
}
