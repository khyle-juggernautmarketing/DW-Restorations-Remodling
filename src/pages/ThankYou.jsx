import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, CheckCircle2 } from 'lucide-react'
import { COMPANY_NAME, SUBTITLE, TAGLINE } from '../config/brand'

export default function ThankYou() {
  const params = new URLSearchParams(window.location.search)
  const date = params.get('date')
  const time = params.get('time')
  const hasAppointment = Boolean(date && time)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 supports-[min-height:100dvh]:min-h-dvh">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-slate-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <img
            src="/logo.webp"
            alt={`${COMPANY_NAME} logo`}
            className="h-12 w-12 rounded-lg object-contain"
            width={48}
            height={48}
          />
          <div className="text-left">
            <span className="text-xl font-bold text-white">{COMPANY_NAME}</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {SUBTITLE}
            </p>
          </div>
        </Link>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full rounded-3xl border border-slate-700/80 bg-white/95 p-8 shadow-2xl backdrop-blur-md sm:p-12"
        >
          <CheckCircle2
            className="mx-auto mb-6 h-20 w-20 text-amber-500"
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Thank You — {TAGLINE}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {hasAppointment
              ? 'Your free on-site consultation has been scheduled. Our restoration management team will see you at the confirmed time below.'
              : 'Your project details have been received. Our team will reach out shortly to coordinate your free on-site consultation.'}
          </p>

          {hasAppointment && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left">
              <CalendarCheck className="h-8 w-8 shrink-0 text-amber-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Your appointment</p>
                <p className="text-sm text-slate-700">
                  {date} at {time} EST
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-gold px-6 font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:shadow-amber-500/30"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
