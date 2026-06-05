import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'
import { SERVICE_OPTIONS, TIMELINE_OPTIONS } from '../config/brand'
import { submitLead } from '../lib/submitLead'
import { getErrorMessage } from '../lib/formatError'
import {
  clearPendingLead,
  FALLBACK_MS,
  formatEstDateLabel,
  formatEstTimeLabel,
  getEstDateKey,
  loadPendingLead,
  markPendingSubmitted,
  reserveBooking,
  savePendingLead,
} from '../lib/booking'
import AppointmentCalendar from './AppointmentCalendar'

const STEPS = 4

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
}

export default function LeadForm() {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const fallbackTimerRef = useRef(null)
  const submittingRef = useRef(false)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [service, setService] = useState('')
  const [timeline, setTimeline] = useState('')
  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
  const [appointmentIso, setAppointmentIso] = useState('')
  const [website, setWebsite] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const serviceLabel =
    SERVICE_OPTIONS.find((o) => o.id === service)?.label ?? service
  const timelineLabel =
    TIMELINE_OPTIONS.find((o) => o.id === timeline)?.label ?? timeline

  const buildLeadPayload = useCallback(
    (appointment) => ({
      service: serviceLabel,
      timeline: timelineLabel,
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      address: contact.address.trim(),
      website,
      ...(appointment
        ? {
            appointment: {
              isoStart: appointment.isoStart,
              dateLabel: appointment.dateLabel,
              timeLabel: appointment.timeLabel,
            },
          }
        : {}),
    }),
    [serviceLabel, timelineLabel, contact, website],
  )

  const sendToWebhook = useCallback(async (payload) => {
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      await submitLead(payload)
      markPendingSubmitted()
    } finally {
      submittingRef.current = false
    }
  }, [])

  const runFallbackSubmit = useCallback(async () => {
    const pending = loadPendingLead()
    if (!pending || pending.submitted) return
    await sendToWebhook(buildLeadPayload(null))
    clearPendingLead()
  }, [buildLeadPayload, sendToWebhook])

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    }
  }, [])

  const startFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    fallbackTimerRef.current = setTimeout(() => {
      runFallbackSubmit()
    }, FALLBACK_MS)
  }, [runFallbackSubmit])

  const validateStep = () => {
    if (step === 0 && !service) {
      setError('Please select a service to continue.')
      return false
    }
    if (step === 1 && !timeline) {
      setError('Please select a project timeline.')
      return false
    }
    if (step === 2) {
      if (
        !contact.name.trim() ||
        !contact.email.trim() ||
        !contact.phone.trim() ||
        !contact.address.trim()
      ) {
        setError('Please complete all required contact fields.')
        return false
      }
      if (!consent) {
        setError('Please accept the privacy authorization to continue.')
        return false
      }
    }
    if (step === 3 && !appointmentIso) {
      setError('Please select an appointment date and time.')
      return false
    }
    setError('')
    return true
  }

  const goNext = () => {
    if (!validateStep()) return

    if (step === 2) {
      savePendingLead(buildLeadPayload(null))
      startFallbackTimer()
    }

    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS - 1))
  }

  const goBack = () => {
    setError('')
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleConfirmAppointment = async (e) => {
    e.preventDefault()
    if (!validateStep()) return

    setSubmitting(true)
    setError('')

    try {
      await reserveBooking({
        isoStart: appointmentIso,
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
      })

      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)

      const dateKey = getEstDateKey(new Date(appointmentIso))
      const dateLabel = formatEstDateLabel(dateKey)
      const timeLabel = formatEstTimeLabel(appointmentIso)

      await sendToWebhook(
        buildLeadPayload({
          isoStart: appointmentIso,
          dateLabel,
          timeLabel,
        }),
      )

      clearPendingLead()

      const params = new URLSearchParams({
        date: dateLabel,
        time: timeLabel,
      })
      navigate(`/thank-you?${params.toString()}`)
    } catch (err) {
      setError(
        getErrorMessage(err, 'Something went wrong. Please try again.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const motionProps = reducedMotion
    ? {}
    : {
        variants: stepVariants,
        custom: direction,
        initial: 'enter',
        animate: 'center',
        exit: 'exit',
        transition: { duration: 0.25, ease: 'easeInOut' },
      }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex gap-2" aria-hidden="true">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-gradient-gold' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <p className="mb-4 text-center text-sm font-semibold text-slate-800">
        Get Your Free Quote — Step {step + 1} of {STEPS}
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={step === 3 ? handleConfirmAppointment : (e) => e.preventDefault()}
      >
        <div
          className="absolute -left-[9999px] h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="lead-website">Website</label>
          <input
            id="lead-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div key="step0" {...motionProps}>
              <fieldset>
                <legend className="sr-only">Select a service</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SERVICE_OPTIONS.map((opt) => {
                    const selected = service === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setService(opt.id)
                          setError('')
                        }}
                        className={`cursor-pointer rounded-xl border-2 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-amber-500 ${
                          selected
                            ? 'border-amber-500 ring-2 ring-amber-100'
                            : 'border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" {...motionProps}>
              <p className="mb-3 text-sm font-medium text-slate-700">
                Schedule Your Free On-Site Consultation — When should we look at the
                property?
              </p>
              <fieldset>
                <legend className="sr-only">Project timeline</legend>
                <div className="flex flex-col gap-3">
                  {TIMELINE_OPTIONS.map((opt) => {
                    const selected = timeline === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTimeline(opt.id)
                          setError('')
                        }}
                        className={`cursor-pointer rounded-xl border-2 bg-slate-50 p-4 text-left text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-amber-500 ${
                          selected
                            ? 'border-amber-500 ring-2 ring-amber-100'
                            : 'border-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...motionProps} className="space-y-4">
              <div>
                <label
                  htmlFor="lead-name"
                  className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <User className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Full Name
                </label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={contact.name}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, name: e.target.value }))
                  }
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="lead-phone"
                  className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <Phone className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Phone Number
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  value={contact.phone}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, phone: e.target.value }))
                  }
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="lead-email"
                  className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <Mail className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, email: e.target.value }))
                  }
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="lead-address"
                  className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <MapPin className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Property Address
                </label>
                <input
                  id="lead-address"
                  type="text"
                  required
                  autoComplete="street-address"
                  value={contact.address}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, address: e.target.value }))
                  }
                  placeholder="Street address"
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-900 transition-all duration-300 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div className="flex gap-3">
                <input
                  id="lead-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  aria-describedby="consent-desc"
                />
                <label
                  id="consent-desc"
                  htmlFor="lead-consent"
                  className="text-xs leading-relaxed text-slate-600"
                >
                  By clicking submit, you authorize DW Restorations &amp; Remodeling
                  LLC to text or call regarding this free quote under CCPA &amp; TCPA
                  privacy compliance standards.
                </label>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" {...motionProps}>
              <AppointmentCalendar
                selectedIso={appointmentIso}
                onSelect={setAppointmentIso}
                disabled={submitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              disabled={submitting}
              className="inline-flex min-h-12 min-w-12 flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-4 font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:shadow-amber-500/30 sm:flex-[2]"
            >
              {step === 2 ? 'Continue to Schedule' : 'Continue'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-2 rounded-full bg-gradient-gold px-5 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:shadow-amber-500/30 disabled:opacity-70 sm:flex-[2]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Confirming…
                </>
              ) : (
                'Confirm Appointment'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
