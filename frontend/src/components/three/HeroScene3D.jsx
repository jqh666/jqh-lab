import { useRef, useEffect, useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleField from './ParticleField'
import FloatingShapes from './FloatingShapes'

function Scene({ mouse }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" />
      <pointLight position={[-5, -3, 5]} intensity={0.5} color="#ec4899" />
      <ParticleField count={2500} mouse={mouse} />
      <FloatingShapes />
    </>
  )
}

function Fallback() {
  return <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent" />
}

export default function HeroScene3D() {
  const mouse = useRef({ x: 0, y: 0 })
  const containerRef = useRef()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  }, [])

  if (!mounted) return <Fallback />

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
    >
      <Suspense fallback={<Fallback />}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent', pointerEvents: 'none' }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </Suspense>
    </div>
  )
}
