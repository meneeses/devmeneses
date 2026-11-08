import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'

function useTicker(ms: number) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((v) => v + 1), ms)
    return () => clearInterval(id)
  }, [ms])
  return n
}

const EVENTS = ['payment.confirmed', 'invoice.issued', 'label.generated', 'email.sent', 'shipment.created', 'sms.delivered', 'recipe.balanced']

function OutboxCard() {
  const { t } = useLang()
  const tick = useTicker(1600)
  const rows = Array.from({ length: 4 }, (_, i) => EVENTS[(tick + i) % EVENTS.length])
  return (
    <div className="glass h-full rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="label">{t.hero.cards.outbox}</span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
      </div>
      <ul className="space-y-2">
        {rows.map((e, i) => (
          <li key={`${tick}-${i}`} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-[11px]">
            <span className="flex items-center gap-2 text-fg/90">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/5 text-[9px] text-mute">{(tick + i) % 9}</span>
              {e}
            </span>
            <span className={i === 0 ? 'rounded-md bg-lime px-1.5 py-0.5 text-ink' : 'text-mute'}>{i === 0 ? 'sent' : 'ok'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WebhookCard() {
  const { t } = useLang()
  const tick = useTicker(900)
  const [points, setPoints] = useState(() => Array.from({ length: 24 }, (_, i) => 40 + Math.sin(i / 2) * 12 + i * 1.6))
  useEffect(() => {
    if (tick === 0) return
    setPoints((p) => [...p.slice(1), Math.min(95, Math.max(20, p[p.length - 1] + (Math.random() - 0.45) * 12))])
  }, [tick])
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (points.length - 1)) * 100},${100 - v}`).join(' ')
  const delivered = 18420 + tick * 3
  return (
    <div className="glass h-full rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <span className="label">{t.hero.cards.webhooks}</span>
        <span className="rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 font-mono text-[10px] text-lime">{t.hero.cards.idempotent}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-serif text-6xl leading-none">99.9</span>
        <span className="font-mono text-xs text-mute">% · {delivered.toLocaleString('en')} delivered</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-24 w-full overflow-visible">
        <defs>
          <linearGradient id="wh" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#C6F432" stopOpacity="0.35" />
            <stop offset="1" stopColor="#C6F432" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L100,100 L0,100 Z`} fill="url(#wh)" />
        <path d={path} fill="none" stroke="#C6F432" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

function TenantsCard() {
  const { t } = useLang()
  const tick = useTicker(700)
  return (
    <div className="glass h-full rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="label">{t.hero.cards.tenants}</span>
        <span className="font-mono text-xs text-fg">20/20</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`h-7 rounded-md border transition-colors duration-500 ${
              i === tick % 20 ? 'border-lime bg-lime/80' : 'border-white/[0.06] bg-white/[0.04]'
            }`}
          />
        ))}
      </div>
      <p className="mt-3 truncate font-mono text-[10px] text-mute">USING (tenant_id = current_setting('app.tenant'))</p>
    </div>
  )
}

/** Three floating dashboard cards with pointer-driven 3D tilt. */
export default function HeroCards() {
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        el.style.setProperty('--rx', `${-y * 6}deg`)
        el.style.setProperty('--ry', `${x * 8}deg`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div ref={wrap} className="relative mx-auto w-full max-w-6xl [perspective:1400px]" aria-hidden="true">
      <div className="grid grid-cols-1 items-end gap-4 transition-transform duration-300 ease-out [transform-style:preserve-3d] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] md:grid-cols-[1fr_1.15fr_1fr]">
        <div className="hidden md:block [transform:translateY(24px)_translateZ(-30px)_rotateY(8deg)]">
          <OutboxCard />
        </div>
        <div className="[transform:translateZ(40px)]">
          <WebhookCard />
        </div>
        <div className="hidden md:block [transform:translateY(24px)_translateZ(-30px)_rotateY(-8deg)]">
          <TenantsCard />
        </div>
      </div>
    </div>
  )
}
