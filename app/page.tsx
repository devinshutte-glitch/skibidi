'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import AvatarComponent from '@/components/AvatarComponent'
import type { User } from '@/types'

export default function HomePage() {
  const { currentUser, setCurrentUser, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace('/home')
    }
  }, [currentUser, isLoading, router])

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users)
        else setFetchError('Could not load profiles')
      })
      .catch(() => setFetchError('Could not connect to server'))
  }, [])

  const handleSelect = (user: User) => {
    router.push(`/pin/${user.id}`)
  }

  if (isLoading) return null

  const children = users.filter((u) => u.role === 'child')
  const parent = users.find((u) => u.role === 'parent')

  return (
    <OceanBackground>
      <div className="flex flex-col min-h-dvh px-6 pb-8">
        {/* Header */}
        <div className="pt-16 pb-8 text-center">
          <div className="text-6xl mb-3 animate-wave inline-block">🌊</div>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Skibidi
          </h1>
          <p className="text-white/80 font-semibold text-lg mt-1">
            Weekly Knowledge Quiz
          </p>
          <div className="flex justify-center gap-3 mt-3 text-2xl">
            <span>🏄</span>
            <span>🌴</span>
            <span>🧮</span>
            <span>📚</span>
            <span>✝️</span>
          </div>
        </div>

        {/* Profile selection */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-white/70 font-bold text-sm uppercase tracking-widest mb-2">
            Who&apos;s playing?
          </p>

          {fetchError && (
            <div className="bg-red-500/30 border border-red-300/30 rounded-2xl p-4 text-white text-center text-sm">
              {fetchError}
              <br />
              <span className="opacity-70">Make sure your Supabase is connected.</span>
            </div>
          )}

          {/* Child profiles — large cards */}
          <div className="flex gap-4 w-full justify-center">
            {children.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className={`flex-1 max-w-[160px] glass-card rounded-3xl p-5 flex flex-col items-center gap-3
                  hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl
                  border-2 ${user.colour_theme === 'coral' ? 'border-coral-400/50' : 'border-ocean-400/50'}`}
              >
                <div
                  className={`rounded-full p-2 ${
                    user.colour_theme === 'coral' ? 'bg-coral-500/20' : 'bg-ocean-500/20'
                  }`}
                >
                  <AvatarComponent avatar={user.avatar} size={100} />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-xl">{user.name}</p>
                  <p className="text-white/60 text-xs font-semibold">Age {user.age}</p>
                </div>
                <div
                  className={`w-full py-2 rounded-2xl text-sm font-bold text-white ${
                    user.colour_theme === 'coral'
                      ? 'bg-coral-500/40'
                      : 'bg-ocean-600/40'
                  }`}
                >
                  Let&apos;s go! 🤙
                </div>
              </button>
            ))}
          </div>

          {/* Parent access — smaller */}
          {parent && (
            <button
              onClick={() => handleSelect(parent)}
              className="glass-card rounded-2xl px-6 py-3 flex items-center gap-3
                hover:bg-white/20 active:scale-95 transition-all duration-200 mt-2"
            >
              <AvatarComponent avatar={parent.avatar} size={44} />
              <div className="text-left">
                <p className="text-white font-bold">{parent.name}</p>
                <p className="text-white/60 text-xs">Parent Dashboard</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/60 ml-2">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 text-xs mt-8">
          Built with ❤️ for Ruby &amp; Eli 🌴
        </div>
      </div>
    </OceanBackground>
  )
}
