'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import AvatarComponent from '@/components/AvatarComponent'
import BottomNav from '@/components/BottomNav'
import { getWeekNumber } from '@/lib/utils'

interface HomeData {
  currentWeek: { total_points: number; questions_completed: number; is_complete: boolean; week_winner: boolean } | null
  allTime: { totalPoints: number; weekWins: number; weeksCompleted: number }
  streak: { current_streak: number }
  weakness: string | null
}

interface LeaderboardData {
  weekly: Array<{ userId: string; name: string; weeklyPoints: number; questionsCompleted: number }>
  recentWinners: Array<{ user_id: string; name: string; week_number: number }>
}

export default function HomeScreen() {
  const { currentUser, logout, isLoading } = useAuth()
  const router = useRouter()
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const { week } = getWeekNumber()

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/')
  }, [currentUser, isLoading, router])

  useEffect(() => {
    if (!currentUser) return
    Promise.all([
      fetch(`/api/scores/${currentUser.id}`).then((r) => r.json()),
      fetch('/api/leaderboard').then((r) => r.json()),
    ]).then(([scores, lb]) => {
      setHomeData(scores)
      setLeaderboard(lb)
    })
  }, [currentUser])

  if (isLoading || !currentUser) return null

  const questionsLeft = 30 - (homeData?.currentWeek?.questions_completed || 0)
  const progress = ((homeData?.currentWeek?.questions_completed || 0) / 30) * 100
  const isComplete = homeData?.currentWeek?.is_complete || false
  const isWinning = leaderboard?.weekly?.[0]?.userId === currentUser.id

  // Get last week's winner
  const lastWinner = leaderboard?.recentWinners?.[0]

  return (
    <OceanBackground>
      <div className="pb-24 page-transition">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <p className="text-white/70 font-semibold text-sm">Week {week} 🌊</p>
            <h1 className="text-2xl font-black text-white">Hey {currentUser.name}! 👋</h1>
          </div>
          <button
            onClick={() => { logout(); router.replace('/') }}
            className="glass-card rounded-full p-2"
          >
            <AvatarComponent avatar={currentUser.avatar} size={44} />
          </button>
        </div>

        <div className="px-5 space-y-4">
          {/* Last week winner banner */}
          {lastWinner && (
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-white font-bold text-sm">Last Week&apos;s Champion</p>
                <p className="text-yellow-200 font-black">{lastWinner.name} won Week {lastWinner.week_number}!</p>
              </div>
            </div>
          )}

          {/* This week's quiz card */}
          <div
            className={`rounded-3xl p-5 shadow-xl ${
              isComplete
                ? 'bg-gradient-to-br from-green-400/80 to-emerald-500/80'
                : 'bg-gradient-to-br from-coral-500/80 to-orange-500/80'
            }`}
          >
            {isComplete ? (
              <div className="text-center py-2">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white font-black text-xl">Week Complete!</p>
                <p className="text-white/80 font-semibold">
                  You scored {homeData?.currentWeek?.total_points || 0} / 90 points
                </p>
                {isWinning && (
                  <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2 inline-block">
                    <p className="text-white font-black">🏄 You&apos;re winning this week!</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white/80 font-semibold text-sm">This week</p>
                    <p className="text-white font-black text-3xl">
                      {homeData?.currentWeek?.total_points || 0} pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 font-semibold text-sm">Remaining</p>
                    <p className="text-white font-black text-3xl">{questionsLeft} Qs</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white/20 rounded-full h-3 mb-4">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <Link
                  href="/quiz"
                  className="w-full bg-white text-coral-600 font-black text-lg py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/90 active:scale-95 transition-all"
                >
                  <span>Start Quiz</span>
                  <span>🏄</span>
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-white">{homeData?.allTime?.totalPoints || 0}</p>
              <p className="text-white/70 text-xs font-semibold">All-time pts</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-white">
                {homeData?.streak?.current_streak || 0}
                <span className="text-lg">🔥</span>
              </p>
              <p className="text-white/70 text-xs font-semibold">Streak</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-2xl font-black text-white">{homeData?.allTime?.weekWins || 0}</p>
              <p className="text-white/70 text-xs font-semibold">Week wins</p>
            </div>
          </div>

          {/* Weakness */}
          {homeData?.weakness && (
            <div className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💪</span>
              <div>
                <p className="text-white font-bold text-sm">Keep working on it!</p>
                <p className="text-white/80 text-sm">
                  Your weakest area this week was <strong>{homeData.weakness}</strong> — keep going!
                </p>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/leaderboard"
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
            >
              <span className="text-3xl">🏆</span>
              <p className="text-white font-bold text-sm">Leaderboard</p>
            </Link>
            <Link
              href="/profile"
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
            >
              <span className="text-3xl">🏅</span>
              <p className="text-white font-bold text-sm">My Badges</p>
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </OceanBackground>
  )
}
