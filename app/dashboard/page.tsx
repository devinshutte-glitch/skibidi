'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import AvatarComponent from '@/components/AvatarComponent'
import BottomNav from '@/components/BottomNav'
import { motion } from 'framer-motion'

interface ChildStats {
  userId: string
  name: string
  avatar: string
  colourTheme: string
  currentWeek: { total_points: number; maths_points: number; vocab_points: number; bible_points: number; questions_completed: number; is_complete: boolean } | null
  allTime: { totalPoints: number; mathsTotal: number; vocabTotal: number; bibleTotal: number; weekWins: number; weeksCompleted: number }
  streak: { current_streak: number; longest_streak: number }
  weakness: string | null
  weaknessTrend: Array<{ week: number; weakness: string }>
  recentScores: Array<{ week_number: number; total_points: number; is_complete: boolean }>
}

export default function DashboardPage() {
  const { currentUser, isLoading, logout } = useAuth()
  const router = useRouter()
  const [childStats, setChildStats] = useState<ChildStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/')
    if (!isLoading && currentUser && currentUser.role !== 'parent') router.replace('/home')
  }, [currentUser, isLoading, router])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'parent') return

    fetch('/api/users')
      .then((r) => r.json())
      .then(async ({ users }) => {
        const children = users.filter((u: { id: string; role: string; name: string; avatar: string; colour_theme: string }) => u.role === 'child')
        const stats = await Promise.all(
          children.map(async (child: { id: string; name: string; avatar: string; colour_theme: string }) => {
            const scores = await fetch(`/api/scores/${child.id}`).then((r) => r.json())
            return { userId: child.id, name: child.name, avatar: child.avatar, colourTheme: child.colour_theme, ...scores }
          })
        )
        setChildStats(stats)
        setLoading(false)
      })
  }, [currentUser])

  if (isLoading || !currentUser || loading) {
    return (
      <OceanBackground>
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-wave text-5xl">🌊</div>
        </div>
      </OceanBackground>
    )
  }

  return (
    <OceanBackground>
      <div className="min-h-dvh pb-24 page-transition">
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Parent Dashboard 📊</h1>
            <p className="text-white/70 font-semibold text-sm">Read-only view</p>
          </div>
          <button
            onClick={() => { logout(); router.replace('/') }}
            className="glass-card text-white/80 text-sm font-bold px-3 py-2 rounded-xl"
          >
            Sign out
          </button>
        </div>

        <div className="px-5 space-y-6">
          {childStats.map((child, childIdx) => (
            <motion.div
              key={child.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: childIdx * 0.15 }}
            >
              {/* Child header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`rounded-full p-2 ${child.colourTheme === 'coral' ? 'bg-coral-500/30' : 'bg-ocean-500/30'}`}>
                  <AvatarComponent avatar={child.avatar} size={48} />
                </div>
                <div>
                  <p className="text-white font-black text-xl">{child.name}</p>
                  <p className="text-white/60 text-xs font-semibold">
                    🔥 {child.streak?.current_streak || 0} week streak · 🏆 {child.allTime?.weekWins || 0} wins
                  </p>
                </div>
                {child.currentWeek?.is_complete && (
                  <span className="ml-auto bg-green-500/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ✓ Week done
                  </span>
                )}
              </div>

              {/* This week stats */}
              <div className="glass-card rounded-2xl p-4 mb-3">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">This Week</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Total', value: child.currentWeek?.total_points || 0 },
                    { label: '🧮 Maths', value: child.currentWeek?.maths_points || 0 },
                    { label: '📚 Vocab', value: child.currentWeek?.vocab_points || 0 },
                    { label: '✝️ Bible', value: child.currentWeek?.bible_points || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/10 rounded-xl py-2 text-center">
                      <p className="text-white font-black text-lg">{value}</p>
                      <p className="text-white/60 text-xs">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/60 font-semibold mb-1">
                    <span>Progress</span>
                    <span>{child.currentWeek?.questions_completed || 0}/30 questions</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${child.colourTheme === 'coral' ? 'bg-coral-400' : 'bg-ocean-400'}`}
                      style={{ width: `${((child.currentWeek?.questions_completed || 0) / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* All-time stats */}
              <div className="glass-card rounded-2xl p-4 mb-3">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">All Time</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-xl py-2 text-center">
                    <p className="text-white font-black text-lg">{child.allTime?.totalPoints || 0}</p>
                    <p className="text-white/60 text-xs">Total pts</p>
                  </div>
                  <div className="bg-white/10 rounded-xl py-2 text-center">
                    <p className="text-white font-black text-lg">{child.allTime?.weeksCompleted || 0}</p>
                    <p className="text-white/60 text-xs">Weeks done</p>
                  </div>
                  <div className="bg-white/10 rounded-xl py-2 text-center">
                    <p className="text-white font-black text-lg">{child.streak?.longest_streak || 0}</p>
                    <p className="text-white/60 text-xs">Best streak</p>
                  </div>
                </div>
              </div>

              {/* Weakness trend */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-3">Weakness Trend</p>
                {child.weakness && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <p className="text-white text-sm">
                      This week: <strong>{child.weakness}</strong>
                    </p>
                  </div>
                )}
                {child.weaknessTrend && child.weaknessTrend.length > 0 ? (
                  <div className="space-y-1">
                    {child.weaknessTrend.map((w, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-white/10 last:border-0">
                        <span className="text-white/60 text-xs font-semibold">Week {w.week}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          w.weakness === 'Maths' ? 'bg-blue-500/30 text-blue-200'
                          : w.weakness === 'English Vocabulary' ? 'bg-purple-500/30 text-purple-200'
                          : 'bg-amber-500/30 text-amber-200'
                        }`}>
                          {w.weakness}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm text-center py-2">No completed weeks yet</p>
                )}
              </div>

              {childIdx < childStats.length - 1 && (
                <div className="mt-4 border-t border-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </OceanBackground>
  )
}
