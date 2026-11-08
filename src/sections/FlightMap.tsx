import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import map from '../content/mapDots.json'
import { useInView, useReducedMotion } from '../lib/device'

const { bounds: B, dots } = map as unknown as { bounds: { lonMin: number; lonMax: number; latMin: number; latMax: number }; dots: [number, number][] }
const W = 1000
const H = Math.round((W * (B.latMax - B.latMin)) / (B.lonMax - B.lonMin))
const px = (lon: number, lat: number) => [((lon - B.lonMin) / (B.lonMax - B.lonMin)) * W, ((B.latMax - lat) / (B.latMax - B.latMin)) * H] as const

const CWB = px(-49.27, -25.43)
const VLC = px(-0.38, 39.47)
// control point pulled toward the open Atlantic so the route arcs like a flight path
const CTRL = [CWB[0] + (VLC[0] - CWB[0]) * 0.15, VLC[1] + (CWB[1] - VLC[1]) * 0.05 - 40] as const
const ROUTE = `M${CWB[0]},${CWB[1]} Q${CTRL[0]},${CTRL[1]} ${VLC[0]},${VLC[1]}`
const DURATION = 6000

function Pin({ at, label, sub, side, lit }: { at: readonly [number, number]; label: string; sub: string; side: 'left' | 'right'; lit: boolean }) {
  const [x, y] = at
  const tx = side === 'left' ? x - 16 : x + 16
  return (
    <g>
      <circle cx={x} cy={y} r={lit ? 18 : 12} fill="#C6F432" opacity={0.15}>
        <animate attributeName="r" values="8;22;8" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={6} fill={lit ? '#C6F432' : '#0B0D0A'} stroke="#C6F432" strokeWidth={2.5} />
      <text x={tx} y={y - 4} textAnchor={side === 'left' ? 'end' : 'start'} className="fill-fg font-serif" fontSize={30}>
        {label}
      </text>
      <text x={tx} y={y + 20} textAnchor={side === 'left' ? 'end' : 'start'} className="fill-mute font-mono" fontSize={13} letterSpacing={2}>
        {sub}
      </text>
    </g>
  )
}

/** Dotted map of the Atlantic with a plane flying Curitiba → Valencia. */
export default function FlightMap() {
  const [ref, inView] = useInView<HTMLDivElement>('0px')
  const reduced = useReducedMotion()
  const path = useRef<SVGPathElement>(null)
  const plane = useRef<SVGGElement>(null)
  const [arrived, setArrived] = useState(false)
  const len = useRef(0)

  /** Moves the plane and the flown part of the route directly in the DOM (no React re-render per frame). */
  const apply = useCallback((progress: number) => {
    const p = path.current
    const g = plane.current
    if (!p || !g) return
    const L = (len.current ||= p.getTotalLength())
    p.style.strokeDasharray = `${L}`
    p.style.strokeDashoffset = `${L * (1 - progress)}`
    const a = p.getPointAtLength(Math.max(0, progress * L - 1))
    const b = p.getPointAtLength(Math.min(L, progress * L + 1))
    const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
    const at = p.getPointAtLength(progress * L)
    g.setAttribute('transform', `translate(${at.x},${at.y}) rotate(${angle})`)
    setArrived(progress > 0.995)
  }, [])

  useEffect(() => {
    if (reduced) {
      apply(1)
      return
    }
    if (!inView) return
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      // fly, hold at Valencia for 1.5s, then fly again
      const t = ((now - start) % (DURATION + 1500)) / DURATION
      const p = Math.min(1, t)
      apply(p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, apply])

  const dotEls = useMemo(
    () =>
      dots.map(([lon, lat], i) => {
        const [x, y] = px(lon, lat)
        return <circle key={i} cx={x} cy={y} r={2.6} />
      }),
    [],
  )

  return (
    <div ref={ref} className="relative [perspective:1600px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full [transform:rotateX(14deg)] [transform-origin:50%_70%]" role="img" aria-label="Map: flight route from Curitiba, Brazil to Valencia, Spain">
        <defs>
          <radialGradient id="mapfade" cx="50%" cy="50%" r="60%">
            <stop offset="0.55" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="mapmask">
            <rect width={W} height={H} fill="url(#mapfade)" />
          </mask>
          <linearGradient id="route" gradientUnits="userSpaceOnUse" x1={CWB[0]} y1={CWB[1]} x2={VLC[0]} y2={VLC[1]}>
            <stop offset="0" stopColor="#C6F432" stopOpacity="0.3" />
            <stop offset="1" stopColor="#C6F432" />
          </linearGradient>
        </defs>

        <g mask="url(#mapmask)" className="fill-[#4a5444]">
          {dotEls}
        </g>

        {/* full route, dashed */}
        <path d={ROUTE} fill="none" stroke="#C6F432" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="4 8" />
        {/* flown part */}
        <path
          ref={path}
          d={ROUTE}
          strokeDasharray="0 100000"
          fill="none"
          stroke="url(#route)"
          strokeWidth={3}
          strokeLinecap="round"
        />

        <Pin at={CWB} label="Curitiba" sub="BRAZIL · WHERE IT STARTED" side="right" lit />
        <Pin at={VLC} label="Valencia" sub="SPAIN · NOW · CET" side="right" lit={arrived} />

        {/* plane */}
        <g ref={plane} transform={`translate(${CWB[0]},${CWB[1]})`}>
          <circle r={22} fill="#C6F432" opacity={0.12} />
          <path
            d="M14 0 L-6 -3 L-12 -14 L-16 -14 L-11 -3 L-18 -2 L-21 -7 L-24 -7 L-22 0 L-24 7 L-21 7 L-18 2 L-11 3 L-16 14 L-12 14 L-6 3 Z"
            fill="#E8EDE4"
            stroke="#0B0D0A"
            strokeWidth={1}
          />
        </g>
      </svg>
    </div>
  )
}
