import { Check } from 'lucide-react'
import { TAGLINE, VALUE_PROPS } from '../config/brand'
import LeadForm from './LeadForm'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-96 w-96 rounded-full bg-slate-400/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur sm:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
            Serving Lorain, Greater Cleveland &amp; Akron Regions
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Northeast Ohio&apos;s Elite{' '}
            <span className="text-gradient-gold">Property Restoration &amp; Management</span>{' '}
            Experts
          </h1>

          <p className="mt-4 text-xl font-medium italic tracking-wide text-amber-500">
            {TAGLINE}
          </p>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            From sudden storm damage mitigation to stunning custom home remodeling, we
            manage every phase of your construction project with absolute precision. We
            deal with inspections, material logistics, and craftsmanship so you can enjoy
            a stress-free transformation.
          </p>

          <ul className="mt-8 space-y-4">
            {VALUE_PROPS.map((item) => (
              <li key={item.title} className="flex gap-3 text-slate-200">
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span className="text-sm sm:text-base">
                  <strong className="font-semibold text-white">{item.title}</strong>
                  {' — '}
                  {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div id="quote-form" className="lg:col-span-5">
          <LeadForm />
        </div>
      </div>
    </section>
  )
}
