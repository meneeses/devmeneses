import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, RoundedBox, Trail } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const LIME = '#C6F432'
const DIM = new THREE.Color('#3a4036')
const ON = new THREE.Color(LIME)

/** Node positions along a winding path into depth. */
const NODES: [number, number, number][] = [
  [0, 0, 0],
  [2.6, -0.4, -5],
  [-2.4, 0.3, -10],
  [2.2, -0.2, -15],
  [0, 0.2, -20],
]

export type JourneyLabel = { step: string; tag: string }

function Node({ pos, index, label, progress }: { pos: [number, number, number]; index: number; label: JourneyLabel; progress: MutableRefObject<number> }) {
  const edge = useRef<THREE.LineBasicMaterial>(null)
  const core = useRef<THREE.MeshStandardMaterial>(null)
  const group = useRef<THREE.Group>(null)
  const tagEl = useRef<HTMLDivElement>(null)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.8, 1.1, 1.1)), [])

  useFrame((state) => {
    const p = progress.current * (NODES.length - 1)
    const on = THREE.MathUtils.clamp(1 - Math.abs(p - index), 0, 1)
    const passed = p >= index - 0.02
    if (edge.current) edge.current.color.lerpColors(DIM, ON, Math.max(on, passed ? 0.45 : 0))
    if (core.current) core.current.emissiveIntensity = 0.02 + on * 0.18
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.15
      group.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.8 + index * 2) * 0.06
    }
    if (tagEl.current) {
      tagEl.current.dataset.active = on > 0.5 ? '1' : '0'
      tagEl.current.dataset.passed = passed ? '1' : '0'
    }
  })

  return (
    <group ref={group} position={pos}>
      <RoundedBox args={[1.7, 1, 1]} radius={0.12} smoothness={3}>
        <meshStandardMaterial ref={core} color="#151814" emissive={LIME} emissiveIntensity={0.02} roughness={0.35} metalness={0.4} transparent opacity={0.85} />
      </RoundedBox>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edge} color="#3a4036" />
      </lineSegments>
      <Html center position={[0, 1.15, 0]} distanceFactor={7} zIndexRange={[10, 0]}>
        <div ref={tagEl} className="journey-tag group flex flex-col items-center gap-1 whitespace-nowrap">
          <span className="rounded-full border border-white/15 bg-ink/90 px-3 py-1 text-[15px] font-medium text-fg/85 transition-colors">
            <span className="mr-1.5 font-mono text-[12px] text-mute">{String(index + 1).padStart(2, '0')}</span>
            {label.step}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{label.tag}</span>
        </div>
      </Html>
    </group>
  )
}

function Journey({ progress, labels, packet }: { progress: MutableRefObject<number>; labels: JourneyLabel[]; packet: string }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(NODES.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4), [])
  const points = useMemo(() => curve.getPoints(200), [curve])
  const packetRef = useRef<THREE.Group>(null)
  const smooth = useRef(0)
  const v = useMemo(() => ({ pos: new THREE.Vector3(), behind: new THREE.Vector3(), ahead: new THREE.Vector3(), cam: new THREE.Vector3(), look: new THREE.Vector3() }), [])

  useFrame(({ camera, pointer, size }, dt) => {
    // wide screens: node sits right of the text; narrow (portrait) screens: node centered in the upper half
    const narrow = size.width / size.height < 1
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 6, dt)
    const t = THREE.MathUtils.clamp(smooth.current, 0, 1)
    curve.getPointAt(t, v.pos)
    packetRef.current?.position.copy(v.pos)
    // camera trails behind and above the packet, offset so the active node sits right of the text
    curve.getPointAt(Math.max(0, t - 0.06), v.behind)
    v.cam.set(v.behind.x * 0.5 + (narrow ? 0 : -2) + pointer.x * 0.5, v.behind.y + 2 + pointer.y * 0.3, v.behind.z + (narrow ? 13 : 10.5))
    camera.position.lerp(v.cam, 0.08)
    curve.getPointAt(Math.min(1, t + 0.04), v.ahead)
    if (narrow) v.ahead.y -= 2.2
    else v.ahead.x -= 2.4
    v.look.lerp(v.ahead, 0.1)
    camera.lookAt(v.look)
  })

  return (
    <>
      <Line points={points} color="#2b3027" lineWidth={1.5} />
      <Line points={points} color={LIME} lineWidth={1} dashed dashSize={0.15} gapSize={0.35} transparent opacity={0.35} />
      {NODES.map((p, i) => (
        <Node key={i} pos={p} index={i} label={labels[i]} progress={progress} />
      ))}
      <group ref={packetRef}>
        <Trail width={1.4} length={6} color={LIME} attenuation={(w) => w * w}>
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshBasicMaterial color={LIME} toneMapped={false} />
          </mesh>
        </Trail>
        <Html center position={[0, -0.45, 0]} distanceFactor={7} zIndexRange={[20, 0]}>
          <span className="whitespace-nowrap rounded-full bg-lime px-2.5 py-1 text-[13px] font-semibold text-ink shadow-[0_0_24px_rgba(198,244,50,0.45)]">{packet}</span>
        </Html>
      </group>
    </>
  )
}

export default function RequestJourney({
  progress,
  labels,
  packet,
  lite,
  active,
}: {
  progress: MutableRefObject<number>
  labels: JourneyLabel[]
  packet: string
  lite: boolean
  active: boolean
}) {
  return (
    <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, lite ? 1 : 1.5]} camera={{ position: [-2, 2, 10.5], fov: 45 }} gl={{ antialias: !lite }}>
      <color attach="background" args={['#0B0D0A']} />
      <fog attach="fog" args={["#0B0D0A", 10, 26]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={0.6} />
      <Journey progress={progress} labels={labels} packet={packet} />
      {!lite && (
        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.5} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
