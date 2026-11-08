import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'
import { links } from '../content/content'

function useValenciaTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function Arrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Giant wordmark lit by a lime spotlight that follows the pointer. */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])
  return (
    <div ref={ref} className="wordmark group relative select-none overflow-hidden" aria-hidden="true">
      <p className="wordmark-text whitespace-nowrap text-center font-serif text-[clamp(4rem,17vw,16rem)] leading-[0.85] tracking-[-0.04em]">
        João <span className="italic">Meneses</span>
      </p>
    </div>
  )
}

export default function Footer() {
  const { t } = useLang()
  const f = t.footer
  const time = useValenciaTime()

  const toTop = () => {
    if (window.smoothScroll) window.smoothScroll.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nav = [
    ['#request', t.nav.request],
    ['#work', t.nav.work],
    ['#journey', t.nav.journey],
    ['#stack', 'Stack'],
    ['#contact', t.nav.contact],
  ] as const

  const linkCls = 'group inline-flex items-center gap-1.5 text-fg/75 transition hover:text-lime'

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line">
      {/* lime horizon glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(ellipse_at_50%_120%,rgba(198,244,50,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-16 md:px-8">
        {/* status bar */}
        <div className="glass flex flex-col gap-3 rounded-2xl px-5 py-4 font-mono text-[11px] sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5 text-fg/85">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-lime" />
            </span>
            {f.status}
            <span className="hidden text-mute md:inline">· {f.available}</span>
          </span>
          <span className="text-mute">
            {f.localTime} · <span className="tabular-nums text-fg">{time}</span>
          </span>
        </div>

        {/* columns */}
        <div className="mt-14 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-serif text-4xl leading-tight md:text-5xl">{f.cta}</p>
            <a href="#contact" className="btn-lime mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              {f.ctaLink} <Arrow />
            </a>
          </div>

          <nav aria-label={f.navTitle}>
            <p className="label mb-4">{f.navTitle}</p>
            <ul className="space-y-2.5 text-sm">
              {nav.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="group inline-flex items-center text-fg/75 transition hover:text-lime">
                    <span className="h-px w-0 bg-lime transition-all duration-300 group-hover:mr-1.5 group-hover:w-3" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label mb-4">{f.contactTitle}</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${links.email}`} className={linkCls}>{links.email}</a>
              </li>
              <li>
                <a href={links.tel} className={linkCls}>{links.phone}</a>
              </li>
              <li>
                <a href={links.whatsapp} target="_blank" rel="noreferrer" className={linkCls}>
                  WhatsApp <Arrow />
                </a>
              </li>
              <li>
                <a href={links.cv} download className={linkCls}>
                  {t.nav.cv} ↓
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">{f.elsewhereTitle}</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={links.linkedin} target="_blank" rel="noreferrer" className={linkCls}>
                  LinkedIn <Arrow />
                </a>
              </li>
              <li>
                <a href={links.github} target="_blank" rel="noreferrer" className={linkCls}>
                  GitHub <Arrow />
                </a>
              </li>
              <li>
                <a href={links.youtube} target="_blank" rel="noreferrer" className={linkCls}>
                  ICone · YouTube <Arrow />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="relative mt-16">
        <Wordmark />
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[12px] text-mute md:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()} João Meneses. {f.rights} <span className="hidden lg:inline">· {f.built}</span>
          </p>
          <button onClick={toTop} className="group inline-flex items-center gap-2 rounded-full btn-ghost px-4 py-1.5 text-fg/80">
            {f.backTop}
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
