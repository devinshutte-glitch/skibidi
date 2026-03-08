'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import AvatarComponent from '@/components/AvatarComponent'
import BottomNav from '@/components/BottomNav'
import { BADGE_DEFINITIONS } from '@/types'
import { motion } from 'framer-motion'

interface ProfileData {
  allTime: { totalPoints: number; mathsTotal: number; vocabTotal: number; bibleTotal: number; weekWins: number; weeksCompleted: number }
  streak: { current_streak: number; longest_streak: number }
  weakness: string | null
  weaknessTrend: Array<{ week: number; weakness: string }>
}

interface BadgesData {
  badges: Array<{ badge_key: string; earned_at: string }>
}

export default function ProfilePage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [badgesData, setBadgesData] = useState<BadgesData | null>(null)

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/')
  }, [currentUser, isLoading, router])

  useEffect(() => {
    if (!currentUser) return
    Promise.all([
      fetch(`/api/scores/${currentUser.id}`).then((r) => r.json()),
      fetch(`/api/badges/${currentUser.id}`).then((r) => r.json()),
    ]).then(([scores, badges]) => {
      setProfileData(scores)
      setBadgesData(badges)
    })
  }, [currentUser])

  if (!currentUser || isLoading || !profileData) {
    return (
      <OceanBackground>
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-wave text-5xl">🌊</div>
        </div>
      </OceanBackground>
    )
  }

  const earnedBadgeKeys = new Set(badgesData?.badges.map((b) => b.badge_key) || [])
  const allBadges = Object.values(BADGE_DEFINITIONS)

  const subjectBest = [
    { name: 'Maths', emoji: '🧮', points: profileData.allTime.mathsTotal, badge: 'maths_master' },
    { name: 'Vocabulary', emoji: '📚', points: profileData.allTime.vocabTotal, badge: 'word_wizard' },
    { name: 'Bible', emoji: '✝️', points: profileData.allTime.bibleTotal, badge: 'bible_scholar' },
  ]

  return (
    <OceanBackground>
      <div className="min-h-dvh pb-24 page-transition">
        {/* Header */}
        <div className="px-5 pt-12 pb-6 flex items-center gap-4">
          <div className={`rounded-full p-3 ${currentUser.colour_theme === 'coral' ? 'bg-coral-500/30' : 'bg-ocean-500/30'}`}>
            <AvatarComponent avatar={currentUser.avatar} size={80} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
            <p className="text-white/70 font-semibold text-sm">Age {currentUser.age}</p>
            <div className="flex gap-3 mt-1">
              <span className="glass-card text-white text-xs font-bold px-2 py-1 rounded-full">
                🔥 {profileData.streak.current_streak} week streak
              </span>
              <span className="glass-card text-white text-xs font-bold px-2 py-1 rounded-full">
                🏆 {profileData.allTime.weekWins} wins
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-white">{profileData.allTime.totalPoints}</p>
              <p className="text-white/70 text-xs font-semibold">All-time Points</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-white">{profileData.allTime.weeksCompleted}</p>
              <p className="text-white/70 text-xs font-semibold">Weeks Completed</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-white">{profileData.streak.current_streak}</p>
              <p className="text-white/70 text-xs font-semibold">Current Streak 🔥</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-white">{profileData.streak.longest_streak}</p>
              <p className="text-white/70 text-xs font-semibold">Best Streak 🏅</p>
            </div>
          </div>

          {/* Category trophies */}
          <div>
            <h2 className="text-white font-black text-lg mb-3">Category Trophies</h2>
            <div className="grid grid-cols-3 gap-3">
              {subjectBest.map(({ name, emoji, points, badge }) => (
                <div
                  key={name}
                  className={`glass-card rounded-2xl p-3 text-center ${earnedBadgeKeys.has(badge) ? 'border border-yellow-400/50' : ''}`}
                >
                  <div className="text-2xl mb-1">{emoji}</div>
                  <p className="text-white font-black text-lg">{points}</p>
                  <p className="text-white/70 text-xs font-semibold">{name}</p>
                  {earnedBadgeKeys.has(badge) && <p className="text-yellow-300 text-xs mt-1">🥇 Trophy!</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Weakness insight */}
          {profileData.weakness && (
            <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-white font-bold">Room to grow</p>
                <p className="text-white/80 text-sm">
                  Your weakest area this week was <strong>{profileData.weakness}</strong> — keep practising!
                </p>
              </div>
            </div>
          )}

          {/* Weakness trend */}
          {profileData.weaknessTrend.length > 0 && (
            <div>
              <h2 className="text-white font-black text-lg mb-3">Weakness Trend</h2>
              <div className="space-y-2">
                {profileData.weaknessTrend.map((w, i) => (
                  <div key={i} className="glass-card rounded-xl px-4 py-2 flex justify-between items-center">
                    <span className="text-white/70 text-sm font-semibold">Week {w.week}</span>
                    <span className="text-white font-bold text-sm">{w.weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <div>
            <h2 className="text-white font-black text-lg mb-3">
              Badges ({earnedBadgeKeys.size}/{allBadges.length})
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {allBadges.map((badge, i) => {
                const earned = earnedBadgeKeys.has(badge.key)
                return (
                  <motion.div
                    key={badge.key}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl p-3 text-center transition-all ${
                      earned
                        ? `bg-gradient-to-br ${badge.color} shadow-lg`
                        : 'glass-card opacity-40'
                    }`}
                  >
                    <div className="text-3xl mb-1">{badge.emoji}</div>
                    <p className={`text-xs font-bold ${earned ? 'text-white' : 'text-white/60'}`}>
                      {badge.name}
                    </p>
                    {!earned && <p className="text-white/40 text-xs">{badge.description}</p>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </OceanBackground>
  )
}
