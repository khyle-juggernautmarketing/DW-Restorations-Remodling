import { COMPANY_NAME, SERVICE_AREA, SUBTITLE } from '../config/brand'

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 px-4 py-12 text-slate-500">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.webp"
              alt={`${COMPANY_NAME} logo`}
              className="h-12 w-12 rounded-lg object-contain"
              width={48}
              height={48}
            />
            <div>
              <p className="text-lg font-bold text-white">{COMPANY_NAME}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                {SUBTITLE}
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-relaxed">
            Serving {SERVICE_AREA}.
          </p>
        </div>

        <div className="mt-8 border-t border-slate-900 pt-8 text-center text-sm sm:text-left">
          <p>© 2026 {COMPANY_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
