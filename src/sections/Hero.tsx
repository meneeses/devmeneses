import { lazy, Suspense, useEffect, useState } from 'react'
import { useLang } from '../lib/i18n'
import { getTier, useInView, useReducedMotion } from '../lib/device'
import { links } from '../content/content'
import HeroCards from './HeroCards'

const HeroBeam = lazy(() => import('../scenes/HeroBeam'))

function Stat({ value, unit, label, align }: { value: string; unit: string; label: string; align: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-right' : ''}>
      <div className="font-serif text-4xl leading-none md:text-5xl">
        {value}
        {unit && <span className="ml-1 font-sans text-base text-mute">{unit}</span>}
      </div>
      <div className={`label mt-1.5 max-w-[11rem] !text-[10px] leading-relaxed ${align === 'right' ? 'ml-auto' : ''}`}>{label}</div>
    </div>
  )
}

export default function Hero() {
  const { t } = useLang()
  const [ref, inView] = useInView<HTMLElement>('0px')
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)

  // mount WebGL after first paint so the text shows instantly
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 150)
    return () => window.clearTimeout(id)
  }, [])

  const [a, b, c, d] = t.hero.title
  const s = t.hero.stats

  return (
    <section id="top" ref={ref} className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(198,244,50,0.18),transparent_60%)]" />
        {ready && (
          <Suspense fallback={null}>
            <HeroBeam lite={getTier() === 'lite' || reduced} active={inView && !reduced} />
          </Suspense>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-5 md:px-8">
        <div className="pointer-events-none absolute inset-x-5 top-6 hidden justify-between md:inset-x-8 xl:flex">
          <div className="space-y-10">
            <Stat {...s[0]} align="left" />
            <Stat {...s[1]} align="left" />
          </div>
          <div className="space-y-10">
            <Stat {...s[2]} align="right" />
            <Stat {...s[3]} align="right" />
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl pt-6 text-center md:pt-10">
          <p className="label mb-6 !text-[10px] md:!text-[11px]">{t.hero.eyebrow}</p>
          <h1 className="display text-[clamp(2.8rem,7.6vw,7rem)]">
            {a}
            <br />
            {b} <span className="accent">{c}</span> {d}
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-fg/70">{t.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#work" className="btn-lime rounded-full px-6 py-3 text-sm font-semibold">
              {t.hero.ctaPrimary}
            </a>
            <a href={links.cv} download className="btn-ghost rounded-full px-6 py-3 text-sm">
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4 xl:hidden">
          {s.map((x, i) => (
            <Stat key={i} {...x} align="left" />
          ))}
        </div>
      </div>

      <div className="relative mt-14 px-5 pb-20 md:px-8">
        <HeroCards />
      </div>
      <a href="#request" className="label absolute bottom-6 left-1/2 z-10 -translate-x-1/2 !text-[10px] hover:text-fg">
        ↓ {t.hero.scroll}
      </a>
    </section>
  )
}
