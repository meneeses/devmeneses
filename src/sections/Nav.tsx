import { useEffect, useState } from 'react'
import { useLang } from '../lib/i18n'
import { links } from '../content/content'
import Logo from './Logo'

export function LangToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex rounded-full btn-ghost p-0.5 font-mono text-[11px]" role="group" aria-label="Language">
      {(['en', 'pt'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition ${lang === l ? 'bg-fg text-ink' : 'text-mute hover:text-fg'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export default function Nav({ onRecruiter }: { onRecruiter: () => void }) {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const [current, setCurrent] = useState('')
  useEffect(() => {
    // the section crossing the middle of the viewport is the current one
    const ids = ['request', 'work', 'journey', 'contact']
    let raf = 0
    const update = () => {
      const mid = window.innerHeight / 2
      const hit = ids.find((id) => {
        const r = document.getElementById(id)?.getBoundingClientRect()
        return r && r.top <= mid && r.bottom > mid
      })
      setCurrent(hit ?? '')
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const items = [
    ['#request', t.nav.request],
    ['#work', t.nav.work],
    ['#journey', t.nav.journey],
    ['#contact', t.nav.contact],
  ] as const

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-line bg-ink/70 py-3 backdrop-blur-xl" : "py-5"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
        <Logo />

        <nav className={`hidden items-center gap-1 rounded-full px-1.5 py-1.5 text-[13px] md:flex ${scrolled ? 'glass' : 'btn-ghost'}`}>
          {items.map(([href, label]) => {
            const on = current === href.slice(1)
            return (
              <a
                key={href}
                href={href}
                aria-current={on ? 'location' : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition hover:bg-white/5 hover:text-fg ${on ? 'bg-white/[0.06] text-fg' : 'text-mute'}`}
              >
                <span className={`h-1.5 rounded-full bg-lime shadow-[0_0_8px_#C6F432] transition-all duration-300 ${on ? 'w-1.5 opacity-100' : 'w-0 opacity-0'}`} />
                {label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={onRecruiter} className="hidden rounded-full btn-ghost px-3.5 py-1.5 text-[13px] lg:block">
            {t.nav.recruiter}
          </button>
          <a href={links.cv} download className="rounded-full bg-fg px-3.5 py-1.5 text-[13px] font-medium text-ink transition hover:bg-lime">
            {t.nav.cv}
          </a>
        </div>
      </div>
      <button onClick={onRecruiter} className={`mx-auto mt-2 rounded-full btn-ghost px-3 py-1 text-[11px] text-mute lg:hidden ${scrolled ? 'hidden' : 'block'}`}>
        {t.nav.recruiter} →
      </button>
    </header>
  )
}
