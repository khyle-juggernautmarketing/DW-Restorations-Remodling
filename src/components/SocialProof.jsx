import { Star } from 'lucide-react'
import { TAGLINE, TESTIMONIALS } from '../config/brand'

function scrollToForm(e) {
  e.preventDefault()
  const el = document.getElementById('quote-form')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function SocialProof() {
  return (
    <section className="border-t border-slate-950 bg-slate-900 px-4 py-16 text-white">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Our Reputation in Northeast Ohio
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
          Trusted by homeowners across Lorain, Cleveland, and the greater Akron region
          for full-scale restoration and remodeling excellence.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
        {TESTIMONIALS.map((review) => (
          <article
            key={review.id}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all duration-300 hover:border-amber-500/40"
          >
            <div className="mb-3 flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500" aria-hidden="true" />
              ))}
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              &ldquo;{review.quote}&rdquo;
            </p>
            <p className="text-sm font-semibold text-slate-400">{review.location}</p>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-slate-800 bg-slate-950/80 px-6 py-5 text-center">
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          <strong className="font-semibold text-white">
            Ready to start your stress-free property upgrade?
          </strong>{' '}
          {TAGLINE} Fill out the quote form above to secure your{' '}
          <button
            type="button"
            onClick={scrollToForm}
            className="font-semibold text-amber-500 underline-offset-2 hover:underline"
          >
            Free On-Site Consultation
          </button>{' '}
          today!
        </p>
      </div>
    </section>
  )
}
