import { useLang } from '../lib/i18n'
import { SectionTitle } from './SectionTitle'

export default function Stack() {
  const { t } = useLang()
  return (
    <section id="stack" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <SectionTitle kicker={t.stack.kicker} title={t.stack.title} />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {t.stack.groups.map((g, i) => (
          <div key={g.name} className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl">{g.name}</h3>
              <span className="font-mono text-xs text-mute">0{i + 1}</span>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.items.map((s) => (
                <li key={s} className="rounded-full border border-line bg-white/[0.02] px-3 py-1.5 font-mono text-[12px] text-fg/80 transition hover:border-lime/60 hover:text-lime">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
