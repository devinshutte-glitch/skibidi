'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import AvatarComponent from '@/components/AvatarComponent'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'

interface Entry {
  userId: string
  name: string
  avatar: string
  colourTheme: string
  weeklyPoints: number
  weeklyMaths: number
  weeklyVocab: number
  weeklyBible: number
  questionsCompleted: number
  totalPoints: number
  weekWins: number
  currentStreak: number
  weeklyComplete: boolean
}

interface LeaderboardData {
  weekly: Entry[]
  allTime: Entry[]
  currentWeek: number
}

export default function LeaderboardPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [tab, setTab] = useState<'weekly' | 'alltime'>('weekly')

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/')
  }, [currentUser, isLoading, router])

  useEffect(() => {
    fetch('/api/leaderboard').then((r) => r.json()).then(setData)
  }, [])

  if (!data || isLoading || !currentUser) {
    return (
      <OceanBackground>
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-wave text-5xl">🌊</div>
        </div>
      </OceanBackground>
    )
  }

  const entries = tab === 'weekly' ? data.weekly : data.allTime
  const maxPoints = Math.max(...entries.map((e) => tab === 'weekly' ? e.weeklyPoints : e.totalPoints), 1)

  return (
    <OceanBackground>
      <div className="min-h-dvh pb-24 page-transition">
        {/* Header */}
        <div className="px-5 pt-12 pb-6">
          <h1 className="text-3xl font-black text-white">Leaderboard 🏆</h1>
          <p className="text-white/70 font-semibold">Week {data.currentWeek}</p>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-5">
          <div className="glass-card rounded-2xl p-1 flex">
            {(['weekly', 'alltime'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab === t ? 'bg-white text-ocean-700 shadow' : 'text-white/70'
                }`}
              >
                {t === 'weekly' ? '🌊 This Week' : '🏆 All Time'}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 space-y-4">
          {/* Players */}
          {entries.map((entry, idx) => {
            const points = tab === 'weekly' ? entry.weeklyPoints : entry.totalPoints
            const barWidth = (points / maxPoints) * 100
            const isMe = entry.userId === currentUser.id
            const isLeading = idx === 0

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-3xl p-4 ${
                  isMe ? 'bg-white/25 border-2 border-white/50' : 'glass-card'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <AvatarComponent avatar={entry.avatar} size={52} />
                    {isLeading && (
                      <span className="absolute -top-2 -right-2 text-lg">👑</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-black text-lg">{entry.name}</p>
                      {isMe && (
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                    <div className="flex gap-3 text-white/70 text-xs font-semibold">
                      <span>🔥 {entry.currentStreak} streak</span>
                      <span>🏆 {entry.weekWins} wins</span>
                      {entry.weeklyComplete && tab === 'weekly' && (
                        <span className="text-green-300">✓ Complete</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-2xl">{points}</p>
                    <p className="text-white/60 text-xs">points</p>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                    className={`h-3 rounded-full ${
                      entry.colourTheme === 'coral'
                        ? 'bg-coral-400'
                        : 'bg-ocean-400'
                    }`}
                  />
                </div>

                {/* Subject breakdown (weekly) */}
                {tab === 'weekly' && (
                  <div className="flex gap-2 mt-2">
                    {[
                      { emoji: '🧮', pts: entry.weeklyMaths },
                      { emoji: '📚', pts: entry.weeklyVocab },
                      { emoji: '✝️', pts: entry.weeklyBible },
                    ].map(({ emoji, pts }) => (
                      <div key={emoji} className="flex-1 bg-white/10 rounded-xl py-1.5 text-center">
                        <span className="text-sm">{emoji}</span>
                        <p className="text-white font-bold text-xs">{pts}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}

          {/* Head to head summary */}
          {entries.length === 2 && tab === 'weekly' && (
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-white font-bold mb-2">Head-to-Head 🤜🤛</p>
              <p className="text-white/80 text-sm">
                {entries[0].name}: {entries[0].weekWins} wins · {entries[1].name}: {entries[1].weekWins} wins
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </OceanBackground>
  )
}
