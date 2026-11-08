import { useEffect, useState } from 'react'

/**
 * JM mark: a 3D card that flips between the monogram and a lime "</>" face.
 * Flips once on load, then on hover/focus. A lime status light pulses on the corner ("online").
 * The name beside it slides to the domain on hover.
 */
export default function Logo() {
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const a = window.setTimeout(() => setIntro(true), 900)
    const b = window.setTimeout(() => setIntro(false), 2300)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [])

  return (
    <a href="#top" className="logo group flex items-center gap-2.5" data-intro={intro ? '1' : '0'} aria-label="João Meneses — back to top">
      <span className="relative h-9 w-9 [perspective:400px]">
        <span className="logo-card absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.2,.8,.2,1.2)]">
          {/* front: monogram */}
          <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-fg [backface-visibility:hidden]">
            <svg viewBox="0 0 36 36" className="h-full w-full" aria-hidden="true">
              <text x="17" y="25" textAnchor="middle" fontFamily="Instrument Serif, Georgia, serif" fontStyle="italic" fontSize="21" fill="#0B0D0A" letterSpacing="-0.5">
                jm
              </text>
              {/* underline: the "cursor" of the monogram */}
              <line x1="9" y1="29" x2="27" y2="29" stroke="#0B0D0A" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          {/* back: code */}
          <span className="absolute inset-0 grid place-items-center rounded-[10px] bg-lime font-mono text-[12px] font-semibold text-ink [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {'</>'}
          </span>
        </span>
        {/* status light */}
        <span className="absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full border-2 border-ink bg-lime">
          <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />
        </span>
      </span>

      <span className="relative hidden h-5 overflow-hidden text-sm font-medium sm:block">
        <span className="logo-name block transition-transform duration-500 ease-out">
          <span className="block h-5 leading-5">João Meneses</span>
          <span className="block h-5 font-mono text-[12px] leading-5 text-lime">devmeneses.com</span>
        </span>
      </span>
    </a>
  )
}
