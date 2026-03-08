'use client'

import { useEffect, useState } from 'react'

const COLORS = ['#FF6B4D', '#FFD700', '#38bcee', '#7dd4f5', '#2d7a3c', '#FF4A2A', '#faf2ca']

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
  rotation: number
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 1.2 + Math.random() * 0.8,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
