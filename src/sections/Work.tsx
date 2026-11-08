import { useEffect, useState } from 'react'
import { useLang } from '../lib/i18n'
import { SectionTitle } from './SectionTitle'
import { iconeLinks, iconeShots, projectLinks } from '../content/projects'

function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconeCase() {
  const { t } = useLang()
  const c = t.work.icone
  const [shot, setShot] = useState(0)
  const [broken, setBroken] = useState<Record<number, boolean>>({})
  const shots = iconeShots.filter((_, i) => !broken[i])
  const current = iconeShots[shot]

  // auto-advance when there is more than one screen
  useEffect(() => {
    if (iconeShots.length < 2) return
    const id = setInterval(() => setShot((s) => (s + 1) % iconeShots.length), 4500)
    return () => clearInterval(id)
  }, [])

  return (
    <article className="glass overflow-hidden rounded-3xl">
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        {/* screens */}
        <div className="relative border-b border-line p-4 md:p-6 lg:border-b-0 lg:border-r">
          <div className="overflow-hidden rounded-xl border border-line bg-ink">
            <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 truncate font-mono text-[10px] text-mute">icone.academy</span>
            </div>
            <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_center,rgba(198,244,50,0.08),transparent_70%)]">
              {current && !broken[shot] ? (
                <img
                  key={current.src}
                  src={current.src}
                  alt={current.alt}
                  loading="lazy"
                  className="h-full w-full object-cover object-left-top"
                  onError={() => setBroken((b) => ({ ...b, [shot]: true }))}
                />
              ) : (
                <ArchitectureFallback />
              )}
            </div>
          </div>
          {shots.length > 1 && (
            <div className="mt-3 flex gap-2">
              {iconeShots.map((s, i) =>
                broken[i] ? null : (
                  <button
                    key={s.src}
                    onClick={() => setShot(i)}
                    aria-label={s.alt}
                    className={`h-1.5 flex-1 rounded-full transition ${i === shot ? 'bg-lime' : 'bg-white/10 hover:bg-white/20'}`}
                  />
                ),
              )}
            </div>
          )}
        </div>

        {/* story */}
        <div className="p-6 md:p-8">
          <span className="rounded-full border border-lime/40 bg-lime/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-lime">{t.work.featured}</span>
          <h3 className="mt-4 font-serif text-4xl leading-tight">{c.name}</h3>
          <p className="label mt-2 !text-[10px]">{c.role}</p>
          <p className="mt-4 text-sm leading-relaxed text-fg/70">{c.summary}</p>

          <dl className="mt-6 grid grid-cols-4 gap-3 border-y border-line py-5">
            {c.metrics.map((m) => (
              <div key={m.label}>
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-serif text-3xl leading-none">{m.value}</dd>
                <dd className="mt-1 text-[11px] leading-snug text-mute">{m.label}</dd>
              </div>
            ))}
          </dl>

          <h4 className="label mt-6">{c.problemTitle}</h4>
          <p className="mt-2 text-sm leading-relaxed text-fg/70">{c.problem}</p>
          <h4 className="label mt-5">{c.buildTitle}</h4>
          <ul className="mt-2 space-y-1.5">
            {c.build.map((b) => (
              <li key={b} className="flex gap-2 text-sm leading-relaxed text-fg/75">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lime" />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={iconeLinks.videos} target="_blank" rel="noreferrer" className="btn-lime inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold">
              {t.work.watch} <Arrow />
            </a>
            <a href={iconeLinks.site} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs">
              icone.academy <Arrow />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Shown if no screenshots are available: a tiny architecture diagram. */
function ArchitectureFallback() {
  const boxes = ['Next.js 16', 'ASP.NET Core', 'SignalR', 'Workers', 'PostgreSQL · RLS', 'Redis', 'Outbox']
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="grid w-full max-w-md grid-cols-3 gap-2 font-mono text-[11px]">
        {boxes.map((b, i) => (
          <div key={b} className={`rounded-lg border px-2 py-3 text-center ${i === 1 ? 'border-lime/60 text-lime' : 'border-line text-fg/70'} ${i === 6 ? 'col-span-3' : ''}`}>
            {b}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Work() {
  const { t } = useLang()
  return (
    <section id="work" className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
      <SectionTitle kicker={t.work.kicker} title={t.work.title} />
      <div className="mt-14">
        <IconeCase />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {t.work.projects.map((p, i) => {
          const l = projectLinks[i]
          return (
            <article key={p.name} className="glass group relative flex flex-col rounded-3xl p-6 transition hover:border-lime/30 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label !text-[10px]">{p.tag}</p>
                  <h3 className="mt-2 font-serif text-3xl">{p.name}</h3>
                </div>
                <span className="font-mono text-xs text-mute">0{i + 1}</span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-fg/70">{p.body}</p>
              <div className="mt-5 flex gap-2">
                {l.live && (
                  <a href={l.live} target="_blank" rel="noreferrer" className="btn-lime inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold">
                    {t.work.live} <Arrow />
                  </a>
                )}
                {l.code && (
                  <a href={l.code} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs">
                    {t.work.code} <Arrow />
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
