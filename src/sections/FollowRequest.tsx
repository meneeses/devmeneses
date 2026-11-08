import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '../lib/i18n'
import { getTier, useInView, useReducedMotion } from '../lib/device'

const RequestJourney = lazy(() => import('../scenes/RequestJourney'))

function Title() {
  const { t } = useLang()
  const [a, b, c] = t.request.title
  return (
    <h2 className="display mt-3 text-[clamp(2.1rem,4.4vw,3.8rem)]">
      {a} <span className="accent">{b}</span>
      {c ? ` ${c}` : ''}
    </h2>
  )
}

export default function FollowRequest() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const pinRef = useRef<HTMLDivElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const progress = useRef(0)
  const [active, setActive] = useState(0)
  const [done, setDone] = useState(false)
  const [viewRef, inView] = useInView<HTMLElement>('300px')
  const nodes = t.request.nodes
  const last = nodes.length - 1

  useLayoutEffect(() => {
    if (reduced || !pinRef.current) return
    const st = ScrollTrigger.create({
      trigger: pinRef.current,
      start: 'top top',
      end: '+=400%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress
        setActive(Math.min(last, Math.round(self.progress * last)))
        setDone(self.progress > 0.97)
      },
    })
    stRef.current = st
    return () => {
      st.kill()
      stRef.current = null
    }
  }, [reduced, last])

  /** Clicking a step scrolls to the point where the packet reaches it. */
  const goTo = (i: number) => {
    const st = stRef.current
    if (!st) return
    const y = st.start + (st.end - st.start) * (i / last) + (i === last ? 4 : 0)
    if (window.smoothScroll) window.smoothScroll.scrollTo(y, { duration: 1.2 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (reduced) {
    return (
      <section id="request" className="mx-auto max-w-7xl px-5 py-28 md:px-8">
        <p className="label">{t.request.kicker}</p>
        <Title />
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-fg/65">{t.request.intro}</p>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nodes.map((n, i) => (
            <li key={n.step} className="glass rounded-2xl p-6">
              <span className="label">
                {String(i + 1).padStart(2, '0')} · {n.step}
              </span>
              <h3 className="mt-3 font-serif text-3xl">{n.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg/70">{n.body}</p>
              <p className="mt-4 font-mono text-[11px] text-mute">{n.tag}</p>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  const current = nodes[active]

  return (
    <section id="request" ref={viewRef} className="relative">
      <div ref={pinRef} className="relative h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {inView && (
            <Suspense fallback={null}>
              <RequestJourney
                progress={progress}
                labels={nodes.map((n) => ({ step: n.step, tag: n.tag }))}
                packet={t.request.packet}
                lite={getTier() === 'lite'}
                active={inView}
              />
            </Suspense>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/40 to-ink/95 md:bg-gradient-to-r md:from-ink md:via-ink/70 md:to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end gap-5 px-5 pb-8 pt-24 md:justify-center md:px-8 md:pb-0 md:pt-16">
          <div className="max-w-lg">
            <p className="label">{t.request.kicker}</p>
            <Title />
            <p className="mt-4 hidden text-sm leading-relaxed text-fg/65 md:block">{t.request.intro}</p>
          </div>

          <div className="grid max-w-lg gap-3">
            {/* the whole flow, always visible */}
            <ol className="flex gap-1.5 md:grid md:gap-1" aria-label={t.request.scenario}>
              {nodes.map((n, i) => {
                const state = i === active ? 'active' : i < active ? 'passed' : 'next'
                return (
                  <li key={n.step} className="flex-1">
                    <button
                      onClick={() => goTo(i)}
                      aria-current={i === active ? 'step' : undefined}
                      className={`group flex w-full items-center gap-3 rounded-lg text-left transition md:px-2 md:py-1 ${state === 'active' ? 'md:bg-white/[0.05]' : 'md:hover:bg-white/[0.03]'}`}
                    >
                      <span
                        className={`h-1.5 w-full rounded-full transition-colors md:grid md:h-5 md:w-5 md:shrink-0 md:place-items-center md:font-mono md:text-[10px] ${
                          state === 'active' ? 'bg-lime text-ink' : state === 'passed' ? 'bg-lime/40 text-ink' : 'bg-white/10 text-mute'
                        }`}
                      >
                        <span className="hidden md:inline">{state === 'passed' ? '✓' : i + 1}</span>
                      </span>
                      <span className={`hidden text-sm md:inline ${state === 'active' ? 'text-fg' : 'text-mute group-hover:text-fg/80'}`}>{n.step}</span>
                      <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-mute/70 lg:inline">{n.tag}</span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* detail of the current step */}
            <div className="glass relative rounded-2xl p-5 md:p-6" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <span className="label !text-lime">
                  {String(active + 1).padStart(2, '0')} / {String(nodes.length).padStart(2, '0')} · {current.step}
                </span>
                <span className="hidden font-mono text-[10px] text-mute sm:inline">{current.tag}</span>
              </div>
              <h3 key={current.title} className="mt-2.5 animate-[fadeUp_.45s_ease] font-serif text-[1.7rem] leading-tight md:text-[1.9rem]">
                {current.title}
              </h3>
              <p key={current.body} className="mt-2 animate-[fadeUp_.55s_ease] text-sm leading-relaxed text-fg/70">
                {current.body}
              </p>
              <div className="mt-4 flex min-h-5 items-center font-mono text-[11px]">
                {done ? (
                  <span className="animate-[fadeUp_.4s_ease]">
                    <span className="rounded bg-lime px-1.5 py-0.5 text-ink">{t.request.status}</span>
                    <span className="ml-2 text-fg/70">{t.request.done}</span>
                  </span>
                ) : (
                  <span className="text-mute">↓ {t.request.hint}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
