'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import PinPad from '@/components/PinPad'
import AvatarComponent from '@/components/AvatarComponent'
import type { User } from '@/types'

const THEME_GRADIENTS: Record<string, string> = {
  coral: 'linear-gradient(180deg, #ff6b4d 0%, #ff4a2a 40%, #c2250c 100%)',
  ocean: 'linear-gradient(180deg, #38bcee 0%, #0ea3dc 40%, #036996 100%)',
  palm: 'linear-gradient(180deg, #2d7a3c 0%, #246330 50%, #1a4d24 100%)',
}

export default function PinPage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()
  const { setCurrentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [confirmPin, setConfirmPin] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => {
        const found = d.users?.find((u: User) => u.id === params.userId)
        if (found) setUser(found)
        else router.replace('/')
      })
      .catch(() => router.replace('/'))
  }, [params.userId, router])

  const handlePinComplete = useCallback(
    async (pin: string) => {
      setError(null)
      setIsLoading(true)

      try {
        // Try verify first — if it fails with 401, check if it's first-login
        const verifyRes = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: params.userId, pin }),
        })

        if (verifyRes.ok) {
          const { user: verifiedUser } = await verifyRes.json()
          setCurrentUser(verifiedUser)
          router.replace(verifiedUser.role === 'parent' ? '/dashboard' : '/home')
          return
        }

        const data = await verifyRes.json()

        if (data.error === 'first_login') {
          setIsFirstLogin(true)
          setIsLoading(false)
          return
        }

        setError('Wrong PIN — try again')
      } catch {
        setError('Connection error')
      } finally {
        setIsLoading(false)
      }
    },
    [params.userId, setCurrentUser, router, isFirstLogin]
  )

  const handleSetPin = useCallback(
    async (pin: string) => {
      if (!confirmPin) {
        setConfirmPin(pin)
        return
      }
      if (pin !== confirmPin) {
        setError('PINs do not match — try again')
        setConfirmPin(null)
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch('/api/auth/set-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: params.userId, pin }),
        })
        if (!res.ok) throw new Error()

        // Now verify
        const verifyRes = await fetch('/api/auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: params.userId, pin }),
        })
        const { user: verifiedUser } = await verifyRes.json()
        setCurrentUser(verifiedUser)
        router.replace(verifiedUser.role === 'parent' ? '/dashboard' : '/home')
      } catch {
        setError('Failed to set PIN')
      } finally {
        setIsLoading(false)
      }
    },
    [confirmPin, params.userId, setCurrentUser, router]
  )

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#0ea3dc' }}>
        <div className="animate-wave text-4xl">🌊</div>
      </div>
    )
  }

  const theme = user.colour_theme || 'ocean'
  const bg = THEME_GRADIENTS[theme] || THEME_GRADIENTS.ocean

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: bg }}>
      {/* Back button */}
      <div className="p-5">
        <button
          onClick={() => router.replace('/')}
          className="text-white/70 hover:text-white flex items-center gap-1 font-semibold"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white/20 rounded-full p-4">
            <AvatarComponent avatar={user.avatar} size={100} />
          </div>
          <h2 className="text-3xl font-black text-white">{user.name}</h2>
        </div>

        {/* PIN pad */}
        {isFirstLogin ? (
          <PinPad
            onComplete={handleSetPin}
            error={error}
            isLoading={isLoading}
            label={confirmPin ? `Confirm your PIN 🔐` : `Set your secret PIN 🔑`}
          />
        ) : (
          <PinPad
            onComplete={handlePinComplete}
            error={error}
            isLoading={isLoading}
            label={`Enter your PIN 🔐`}
          />
        )}

        {isFirstLogin && !confirmPin && (
          <p className="text-white/60 text-sm text-center max-w-xs">
            First time here! Choose a 4-digit PIN you&apos;ll remember 🤙
          </p>
        )}
      </div>
    </div>
  )
}
