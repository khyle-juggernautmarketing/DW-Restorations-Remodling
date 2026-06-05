import { COMPANY_NAME, SUBTITLE, TAGLINE } from '../config/brand'

function scrollToForm(e) {
  e.preventDefault()
  const el = document.getElementById('quote-form')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function Navbar() {
  return (
    <header className="overflow-hidden">
      <div className="bg-slate-950 py-2 text-center text-xs font-medium tracking-wide text-slate-200 md:text-sm">
        <span aria-hidden="true">🔨 </span>
        Full-Service Remodeling &amp; Turnkey Restoration. Proudly Serving Lorain,
        Cleveland &amp; Akron Areas
      </div>

      <nav
        className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex min-h-12 shrink-0 items-center gap-3"
          >
            <img
              src="/logo.webp"
              alt={`${COMPANY_NAME} logo`}
              className="h-10 w-10 rounded-lg object-contain"
              width={40}
              height={40}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-gradient-gold">DW</span>
                <span className="ml-1 text-slate-400">|</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                {SUBTITLE}
              </span>
            </div>
          </a>

          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-gold px-5 py-2 text-sm font-bold uppercase tracking-wide text-slate-900 shadow-lg transition-all duration-300 hover:shadow-amber-500/30"
          >
            Request Estimate
          </button>
        </div>
      </nav>
    </header>
  )
}
