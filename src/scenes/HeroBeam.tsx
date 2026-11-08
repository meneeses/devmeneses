import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const LIME = new THREE.Color('#C6F432')

/** Vertical light shaft — a soft gaussian column with streaks running upward. */
function Shaft({ width, opacity, speed }: { width: number; opacity: number; speed: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: LIME }, uOpacity: { value: opacity } }), [opacity])
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt * speed
  })
  return (
    <mesh position={[0, -0.5, -1]}>
      <planeGeometry args={[width, 14, 1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          uniform float uTime; uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
          float hash(float n){ return fract(sin(n)*43758.5453); }
          void main(){
            float x = vUv.x - 0.5;
            // column narrows toward the top, fans out at the floor
            float spread = mix(0.05, 0.22, pow(1.0 - vUv.y, 2.2));
            float core = exp(-x*x / (spread*spread*0.5));
            // vertical streaks
            float lane = floor((x + 0.5) * 220.0);
            float s = hash(lane);
            float streak = smoothstep(0.8, 1.0, fract(vUv.y * (1.5 + s*2.0) - uTime*(0.25 + s*0.6) + s*10.0));
            streak *= step(0.55, s); // only some lanes carry streaks
            // brightest at the floor (behind the cards), fading out before the headline
            float fadeY = smoothstep(0.0, 0.1, vUv.y) * (1.0 - smoothstep(0.25, 0.8, vUv.y));
            float a = (core * 0.5 + core * streak * 0.7) * fadeY * uOpacity;
            vec3 col = mix(uColor, vec3(1.0), core * 0.2);
            gl_FragColor = vec4(col * a, a);
          }`}
      />
    </mesh>
  )
}

/** Requests: particles rising through the shaft. */
function Requests({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // gaussian-ish x around the shaft
      const r = (Math.random() + Math.random() + Math.random() - 1.5) * 1.1
      pos[i * 3] = r
      pos[i * 3 + 1] = Math.random() * 12 - 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5
      seed[i] = Math.random()
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: LIME }, uPixel: { value: Math.min(window.devicePixelRatio, 1.5) } }), [])
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
  })
  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime; uniform float uPixel; attribute float aSeed; varying float vAlpha; varying float vHot;
          void main(){
            vec3 p = position;
            float speed = 0.4 + aSeed * 1.6;
            p.y = mod(p.y + 6.0 + uTime * speed, 12.0) - 6.0;
            // pulled toward the center as they rise
            float pull = smoothstep(-6.0, 4.0, p.y);
            p.x *= mix(1.0, 0.25, pull);
            p.z *= mix(1.0, 0.4, pull);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            vHot = step(0.93, aSeed);
            gl_PointSize = (vHot > 0.5 ? 5.0 : 2.4) * uPixel * (6.0 / -mv.z);
            vAlpha = smoothstep(-6.0, -4.0, p.y) * (1.0 - smoothstep(2.5, 5.5, p.y)) * (0.35 + aSeed * 0.65);
          }`}
        fragmentShader={`
          uniform vec3 uColor; varying float vAlpha; varying float vHot;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vAlpha;
            vec3 col = mix(uColor, vec3(1.0), vHot * 0.6);
            gl_FragColor = vec4(col * a, a);
          }`}
      />
    </points>
  )
}

function Rig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.3 + 0.2 - camera.position.y) * 0.03
    camera.lookAt(0, 0.5, 0)
  })
  return null
}

export default function HeroBeam({ lite, active }: { lite: boolean; active: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, lite ? 1 : 1.5]}
      camera={{ position: [0, 0.2, 8], fov: 45 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#0B0D0A']} />
      <Shaft width={9} opacity={0.6} speed={1} />
      <Shaft width={2.2} opacity={0.45} speed={1.6} />
      <Requests count={lite ? 500 : 1600} />
      <Rig />
      {!lite && (
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.3} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
