import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getWeekNumber } from '@/lib/utils'

export async function GET() {
  const supabase = createServiceClient()
  const { week, year } = getWeekNumber()

  // Get all child users
  const { data: users } = await supabase
    .from('users')
    .select('id, name, avatar, colour_theme')
    .eq('role', 'child')

  if (!users) return NextResponse.json({ entries: [] })

  const entries = await Promise.all(
    users.map(async (user) => {
      // Current week score
      const { data: weekScore } = await supabase
        .from('weekly_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_number', week)
        .eq('year', year)
        .single()

      // All-time totals
      const { data: allScores } = await supabase
        .from('weekly_scores')
        .select('total_points, week_winner')
        .eq('user_id', user.id)
        .eq('is_complete', true)

      const totalPoints = (allScores || []).reduce((sum, s) => sum + s.total_points, 0)
      const weekWins = (allScores || []).filter((s) => s.week_winner).length

      // Streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single()

      return {
        userId: user.id,
        name: user.name,
        avatar: user.avatar,
        colourTheme: user.colour_theme,
        weeklyPoints: weekScore?.total_points || 0,
        weeklyComplete: weekScore?.is_complete || false,
        weeklyMaths: weekScore?.maths_points || 0,
        weeklyVocab: weekScore?.vocab_points || 0,
        weeklyBible: weekScore?.bible_points || 0,
        questionsCompleted: weekScore?.questions_completed || 0,
        totalPoints,
        weekWins,
        currentStreak: streak?.current_streak || 0,
      }
    })
  )

  // Sort by weekly points for current week comparison
  const sortedByWeek = [...entries].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
  const sortedByAllTime = [...entries].sort((a, b) => b.totalPoints - a.totalPoints)

  // Recent weekly winners (last 8 weeks)
  const { data: recentWinners } = await supabase
    .from('weekly_scores')
    .select('user_id, week_number, year, total_points')
    .eq('week_winner', true)
    .order('week_number', { ascending: false })
    .limit(8)

  const winnersWithNames = (recentWinners || []).map((w) => ({
    ...w,
    name: users.find((u) => u.id === w.user_id)?.name || 'Unknown',
  }))

  return NextResponse.json({
    weekly: sortedByWeek,
    allTime: sortedByAllTime,
    recentWinners: winnersWithNames,
    currentWeek: week,
    currentYear: year,
  })
}
