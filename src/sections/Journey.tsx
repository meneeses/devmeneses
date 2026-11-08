import { useLang } from '../lib/i18n'
import { SectionTitle } from './SectionTitle'
import FlightMap from './FlightMap'

export default function Journey() {
  const { t } = useLang()
  const steps = t.journey.steps

  return (
    <section id="journey" className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionTitle kicker={t.journey.kicker} title={t.journey.title} intro={t.journey.intro} />
          <p className="label mt-6 !normal-case !tracking-normal">{t.journey.languages}</p>
        </div>
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(198,244,50,0.08),transparent_65%)]" />
          <FlightMap />
        </div>
      </div>

      <div className="mt-16 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <figure className="glass relative overflow-hidden rounded-3xl">
          <img src="/img/joao.jpg" alt="João Meneses working at his desk" loading="lazy" className="h-full max-h-[560px] w-full object-cover object-[50%_30%] [filter:saturate(0.85)_contrast(1.05)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
          <figcaption className="absolute bottom-5 left-5 right-5">
            <p className="font-serif text-3xl">João Meneses</p>
            <p className="label mt-1 !text-[10px]">Full-Stack · .NET · React</p>
          </figcaption>
        </figure>

        <ol className="glass rounded-3xl p-6 md:p-8">
          {steps.map((s, i) => {
            const last = i === steps.length - 1
            return (
              <li key={s.when + s.where} className="flex gap-5">
                {/* rail: dot + connector to the next item, so they always line up */}
                <div className="flex w-3 shrink-0 flex-col items-center" aria-hidden="true">
                  <span
                    className={`mt-[0.3rem] h-3 w-3 shrink-0 rounded-full border-2 ${
                      last ? 'border-lime bg-lime shadow-[0_0_14px_#C6F432]' : 'border-white/30 bg-ink'
                    }`}
                  />
                  {!last && <span className={`my-1.5 w-px flex-1 ${i === steps.length - 2 ? 'bg-gradient-to-b from-white/15 to-lime' : 'bg-white/15'}`} />}
                </div>
                <div className={`grid flex-1 gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-6 ${last ? '' : 'pb-7'}`}>
                  <span className="pt-0.5 font-mono text-xs text-mute">{s.when}</span>
                  <div>
                    <p className={`text-[15px] font-medium ${last ? 'text-lime' : ''}`}>{s.where}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-fg/60">{s.what}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
