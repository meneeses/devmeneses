import { lazy, Suspense, useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import FollowRequest from './sections/FollowRequest'
import Work from './sections/Work'
import Journey from './sections/Journey'
import Stack from './sections/Stack'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import { useReducedMotion } from './lib/device'

gsap.registerPlugin(ScrollTrigger)

declare global {
  interface Window {
    smoothScroll?: Lenis
  }
}
const RecruiterMode = lazy(() => import('./sections/RecruiterMode'))

function isCvPath() {
  return window.location.pathname.replace(/\/$/, '') === '/cv'
}

export default function App() {
  const [recruiter, setRecruiter] = useState(isCvPath)
  const reduced = useReducedMotion()

  useEffect(() => {
    const onPop = () => setRecruiter(isCvPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const toggleRecruiter = (on: boolean) => {
    history.pushState(null, '', on ? '/cv' : '/')
    setRecruiter(on)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (recruiter || reduced) return
    const lenis = new Lenis({ lerp: 0.1 })
    window.smoothScroll = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    // anchor links go through Lenis
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const el = document.querySelector(a.getAttribute('href')!)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -20 })
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.smoothScroll = undefined
    }
  }, [recruiter, reduced])

  if (recruiter)
    return (
      <Suspense fallback={null}>
        <RecruiterMode onBack={() => toggleRecruiter(false)} />
      </Suspense>
    )

  return (
    <>
      <Nav onRecruiter={() => toggleRecruiter(true)} />
      <main>
        <Hero />
        <FollowRequest />
        <Work />
        <Journey />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
