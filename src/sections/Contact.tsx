import { useState, type FormEvent } from 'react'
import { useLang } from '../lib/i18n'
import { links } from '../content/content'
import { SectionTitle } from './SectionTitle'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function Contact() {
  const { t } = useLang()
  const c = t.contact
  const [status, setStatus] = useState<Status>('idle')

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('ok')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const field = 'w-full bg-transparent font-mono text-sm text-fg placeholder:text-mute/60 focus:outline-none'

  return (
    <section id="contact" className="relative overflow-hidden px-5 py-28 md:px-8 md:py-36">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(198,244,50,0.14),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl">
        <SectionTitle kicker={c.kicker} title={c.title} intro={c.intro} center />

        <form onSubmit={submit} className="glass mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs">
            <span>
              <span className="rounded bg-lime px-1.5 py-0.5 font-semibold text-ink">POST</span>
              <span className="ml-2 text-fg/80">devmeneses.com/hire-joao</span>
            </span>
            <span className="text-mute">application/json</span>
          </div>
          <div className="space-y-1 px-5 py-5 font-mono text-sm">
            <p className="text-mute">{'{'}</p>
            <label className="flex items-baseline gap-2 pl-5">
              <span className="shrink-0 text-lime">"{c.name}":</span>
              <input name="name" required maxLength={120} autoComplete="name" placeholder={c.placeholderName} className={field} />
            </label>
            <label className="flex items-baseline gap-2 pl-5">
              <span className="shrink-0 text-lime">"{c.email}":</span>
              <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder={c.placeholderEmail} className={field} />
            </label>
            <label className="flex items-start gap-2 pl-5">
              <span className="shrink-0 pt-0.5 text-lime">"{c.message}":</span>
              <textarea name="message" required rows={4} maxLength={4000} placeholder={c.placeholderMessage} className={`${field} resize-none`} />
            </label>
            {/* honeypot */}
            <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            <p className="text-mute">{'}'}</p>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center">
            <div className="font-mono text-xs" aria-live="polite">
              {status === 'ok' && (
                <span>
                  <span className="rounded bg-lime px-1.5 py-0.5 text-ink">200 OK</span> <span className="ml-1 text-fg/80">{c.ok}</span>
                </span>
              )}
              {status === 'error' && (
                <span className="text-fg/80">
                  <span className="rounded bg-red-400/90 px-1.5 py-0.5 text-ink">500</span> {c.error}{' '}
                  <a className="text-lime underline" href={`mailto:${links.email}`}>{links.email}</a>
                </span>
              )}
            </div>
            <button type="submit" disabled={status === 'sending'} className="btn-lime shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
              {status === 'sending' ? c.sending : `${c.send} →`}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-mute">
          {c.or}{' '}
          <a href={`mailto:${links.email}`} className="text-fg hover:text-lime">{links.email}</a> ·{' '}
          <a href={links.whatsapp} target="_blank" rel="noreferrer" className="text-fg hover:text-lime">{links.phone}</a> ·{' '}
          <a href={links.linkedin} target="_blank" rel="noreferrer" className="text-fg hover:text-lime">LinkedIn</a> ·{' '}
          <a href={links.github} target="_blank" rel="noreferrer" className="text-fg hover:text-lime">GitHub</a>
        </p>
      </div>
    </section>
  )
}
