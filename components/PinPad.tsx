'use client'

import { useState, useEffect } from 'react'

interface PinPadProps {
  onComplete: (pin: string) => void
  onError?: () => void
  error?: string | null
  isLoading?: boolean
  label?: string
}

export default function PinPad({ onComplete, error, isLoading, label = 'Enter your PIN' }: PinPadProps) {
  const [pin, setPin] = useState<string[]>([])

  useEffect(() => {
    if (pin.length === 4) {
      onComplete(pin.join(''))
    }
  }, [pin, onComplete])

  // Reset PIN on error
  useEffect(() => {
    if (error) {
      setTimeout(() => setPin([]), 600)
    }
  }, [error])

  const addDigit = (digit: string) => {
    if (pin.length < 4 && !isLoading) {
      setPin((p) => [...p, digit])
    }
  }

  const removeDigit = () => {
    if (!isLoading) setPin((p) => p.slice(0, -1))
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-white text-center font-bold text-lg opacity-90">{label}</p>

      {/* PIN dots */}
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              i < pin.length
                ? error
                  ? 'bg-red-400 border-red-300 animate-bounce'
                  : 'bg-white border-white pin-dot-filled'
                : 'bg-transparent border-white/60'
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-200 text-sm font-semibold bg-red-500/30 px-4 py-2 rounded-full">
          {error}
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((key, idx) => {
          if (!key) return <div key={idx} />

          const isDel = key === 'del'
          return (
            <button
              key={idx}
              onClick={() => (isDel ? removeDigit() : addDigit(key))}
              disabled={isLoading}
              className={`
                h-16 rounded-2xl font-bold text-xl transition-all active:scale-95
                ${isDel
                  ? 'bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20'
                  : 'bg-white/20 text-white border border-white/30 hover:bg-white/30 active:bg-white/40'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isDel ? (
                <span className="flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12H3M3 12L9 6M3 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : key}
            </button>
          )
        })}
      </div>

      {isLoading && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
