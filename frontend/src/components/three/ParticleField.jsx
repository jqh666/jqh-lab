import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

export default function ParticleField({ count = 2500, mouse }) {
  const mesh = useRef()

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const palette = [
      [0.39, 0.40, 0.95],
      [0.66, 0.33, 0.97],
      [0.89, 0.28, 0.60],
    ]
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
      const c = palette[Math.floor(Math.random() * 3)]
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]
      siz[i] = Math.random() * 2 + 0.5
    }
    return [pos, col, siz]
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime * 0.04
    mesh.current.rotation.y = t * 0.15
    mesh.current.rotation.x = Math.sin(t * 0.08) * 0.08
    if (mouse?.current) {
      mesh.current.rotation.y += (mouse.current.x * 0.4 - mesh.current.rotation.y) * 0.02
      mesh.current.rotation.x += (-mouse.current.y * 0.3 - mesh.current.rotation.x) * 0.02
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.7}
        blending={2}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
