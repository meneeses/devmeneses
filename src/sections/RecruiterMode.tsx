import { useLang } from '../lib/i18n'
import { links } from '../content/content'
import { projectLinks } from '../content/projects'
import { LangToggle } from './Nav'

/** One-page, motion-free, printable résumé view (/cv). */
export default function RecruiterMode({ onBack }: { onBack: () => void }) {
  const { t } = useLang()
  const r = t.recruiter
  const h = 'label !text-lime print:!text-black mb-3'

  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="no-print mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="btn-ghost rounded-full px-4 py-2 text-sm">← {t.nav.back}</button>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={() => window.print()} className="btn-ghost rounded-full px-4 py-2 text-sm">{r.print}</button>
          <a href={links.cv} download className="btn-lime rounded-full px-4 py-2 text-sm font-semibold">{t.nav.cv}</a>
        </div>
      </div>

      <article className="mx-auto max-w-3xl space-y-9">
        <header className="border-b border-line pb-6">
          <h1 className="display text-6xl">{r.title}</h1>
          <p className="mt-3 text-lg text-fg/85">{r.role}</p>
          <p className="mt-2 text-sm text-mute print:text-black">
            {r.location} · <a href={`mailto:${links.email}`} className="hover:text-lime">{links.email}</a> ·{' '}
            <a href={links.tel} className="hover:text-lime">{links.phone}</a> ·{' '}
            <a href={links.linkedin} className="hover:text-lime">linkedin.com/in/joao-meneeses</a> ·{' '}
            <a href={links.github} className="hover:text-lime">github.com/meneeses</a>
          </p>
        </header>

        <section>
          <h2 className={h}>{r.summaryTitle}</h2>
          <p className="leading-relaxed text-fg/80">{r.summary}</p>
        </section>

        <section>
          <h2 className={h}>{r.experienceTitle}</h2>
          <div className="space-y-6">
            {r.experience.map((e) => (
              <div key={e.role + e.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-medium">{e.role}</h3>
                  <span className="font-mono text-xs text-mute">{e.when}</span>
                </div>
                <p className="text-sm text-mute">{e.company}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-fg/80 marker:text-lime">
                  {e.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={h}>{t.work.title.join(' ')}</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-fg/80">
            <li><strong className="text-fg">{t.work.icone.name}</strong> — {t.work.icone.summary}</li>
            {t.work.projects.map((p, i) => (
              <li key={p.name}>
                <strong className="text-fg">{p.name}</strong> ({p.tag}) — {p.body}{' '}
                <a href={projectLinks[i].live ?? projectLinks[i].code} className="text-lime underline print:text-black">↗</a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={h}>{r.skillsTitle}</h2>
          <dl className="space-y-1.5 text-sm">
            {t.stack.groups.map((g) => (
              <div key={g.name} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                <dt className="font-medium">{g.name}</dt>
                <dd className="text-fg/75">{g.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className={h}>{r.educationTitle}</h2>
            <ul className="space-y-1.5 text-sm text-fg/80">{r.education.map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
          <div>
            <h2 className={h}>{r.languagesTitle}</h2>
            <p className="text-sm leading-relaxed text-fg/80">{r.languages}</p>
          </div>
        </section>
      </article>
    </div>
  )
}
