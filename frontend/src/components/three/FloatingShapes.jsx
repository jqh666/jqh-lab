import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

const shapes = [
  { pos: [-3.2, -0.8, -2.5], color: '#6366f1', type: 'icosahedron', speed: 1.2, size: 0.45 },
  { pos: [3.5, 0.8, -1.5], color: '#a855f7', type: 'octahedron', speed: 0.8, size: 0.5 },
  { pos: [-2, 2.2, -3], color: '#ec4899', type: 'dodecahedron', speed: 1.5, size: 0.4 },
  { pos: [2.8, -1.5, -3], color: '#818cf8', type: 'torus', speed: 1.0, size: 0.35 },
  { pos: [0, -2.5, -4], color: '#c084fc', type: 'icosahedron', speed: 0.6, size: 0.3 },
]

export default function FloatingShapes() {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={0.6} floatIntensity={0.8}>
          <mesh position={s.pos}>
            {s.type === 'torus' ? (
              <torusGeometry args={[s.size, s.size * 0.35, 16, 32]} />
            ) : s.type === 'octahedron' ? (
              <octahedronGeometry args={[s.size]} />
            ) : s.type === 'dodecahedron' ? (
              <dodecahedronGeometry args={[s.size]} />
            ) : (
              <icosahedronGeometry args={[s.size]} />
            )}
            <meshPhysicalMaterial
              color={s.color}
              wireframe
              transparent
              opacity={0.25}
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
