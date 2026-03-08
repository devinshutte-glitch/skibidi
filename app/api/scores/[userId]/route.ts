import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getWeekNumber } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = createServiceClient()
  const { week, year } = getWeekNumber()

  // Get current week score
  const { data: weekScore } = await supabase
    .from('weekly_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', week)
    .eq('year', year)
    .single()

  // Get all-time scores
  const { data: allScores } = await supabase
    .from('weekly_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('is_complete', true)
    .order('week_number', { ascending: false })

  const totalPoints = (allScores || []).reduce((sum, s) => sum + s.total_points, 0)
  const mathsTotal = (allScores || []).reduce((sum, s) => sum + s.maths_points, 0)
  const vocabTotal = (allScores || []).reduce((sum, s) => sum + s.vocab_points, 0)
  const bibleTotal = (allScores || []).reduce((sum, s) => sum + s.bible_points, 0)
  const weekWins = (allScores || []).filter((s) => s.week_winner).length

  // Get streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get weakness (lowest subject this week)
  let weakness = null
  if (weekScore?.is_complete) {
    const subjects = [
      { name: 'Maths', points: weekScore.maths_points },
      { name: 'English Vocabulary', points: weekScore.vocab_points },
      { name: 'Bible', points: weekScore.bible_points },
    ]
    weakness = subjects.reduce((min, s) => (s.points < min.points ? s : min)).name
  }

  // All-time weakness trend (last 5 weeks)
  const weaknessTrend = (allScores || []).slice(0, 5).map((s) => {
    const subjects = [
      { name: 'maths', points: s.maths_points },
      { name: 'vocab', points: s.vocab_points },
      { name: 'bible', points: s.bible_points },
    ]
    return {
      week: s.week_number,
      year: s.year,
      weakness: subjects.reduce((min, sub) => (sub.points < min.points ? sub : min)).name,
    }
  })

  return NextResponse.json({
    currentWeek: weekScore,
    allTime: {
      totalPoints,
      mathsTotal,
      vocabTotal,
      bibleTotal,
      weekWins,
      weeksCompleted: (allScores || []).length,
    },
    streak: streak || { current_streak: 0, longest_streak: 0 },
    weakness,
    weaknessTrend,
    recentScores: (allScores || []).slice(0, 10),
  })
}
