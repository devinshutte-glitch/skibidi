import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculatePoints, getWeekNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  const body = await req.json()
  const { userId, questionId, answerGiven, timeTaken } = body

  if (!userId || !questionId || answerGiven === undefined || timeTaken === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get the question
  const { data: question, error: qError } = await supabase
    .from('question_bank')
    .select('*')
    .eq('id', questionId)
    .single()

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  // Check if already answered
  const { data: existing } = await supabase
    .from('answers')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already answered' }, { status: 409 })
  }

  // Determine if correct (case-insensitive for typed answers)
  const isCorrect =
    answerGiven.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()

  const pointsEarned = calculatePoints(isCorrect, timeTaken)

  const { week, year } = getWeekNumber()

  // Record answer
  const { error: answerError } = await supabase.from('answers').insert({
    user_id: userId,
    question_id: questionId,
    week_number: question.week_number,
    answer_given: answerGiven,
    is_correct: isCorrect,
    time_taken_seconds: timeTaken,
    points_earned: pointsEarned,
  })

  if (answerError) {
    return NextResponse.json({ error: answerError.message }, { status: 500 })
  }

  // Update weekly scores
  await updateWeeklyScores(supabase, userId, question.subject, pointsEarned, week, year)

  // Check for badge triggers
  const newBadges = await checkBadges(supabase, userId, week, year)

  return NextResponse.json({
    isCorrect,
    pointsEarned,
    correctAnswer: question.correct_answer,
    explanation: question.explanation,
    newBadges,
  })
}

async function updateWeeklyScores(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  subject: string,
  points: number,
  week: number,
  year: number
) {
  // Get current score
  const { data: current } = await supabase
    .from('weekly_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', week)
    .eq('year', year)
    .single()

  const subjectField =
    subject === 'maths'
      ? 'maths_points'
      : subject === 'vocab'
      ? 'vocab_points'
      : 'bible_points'

  if (current) {
    const newQuestionsCompleted = current.questions_completed + 1
    const isComplete = newQuestionsCompleted >= 30

    await supabase
      .from('weekly_scores')
      .update({
        total_points: current.total_points + points,
        [subjectField]: current[subjectField as keyof typeof current] + points,
        questions_completed: newQuestionsCompleted,
        is_complete: isComplete,
      })
      .eq('id', current.id)

    // Check for week winner if both completed
    if (isComplete) {
      await checkWeekWinner(supabase, week, year)
    }
  } else {
    await supabase.from('weekly_scores').insert({
      user_id: userId,
      week_number: week,
      year,
      total_points: points,
      [subjectField]: points,
      questions_completed: 1,
      is_complete: false,
    })
  }
}

async function checkWeekWinner(
  supabase: ReturnType<typeof createServiceClient>,
  week: number,
  year: number
) {
  const { data: scores } = await supabase
    .from('weekly_scores')
    .select('*')
    .eq('week_number', week)
    .eq('year', year)
    .eq('is_complete', true)

  if (!scores || scores.length < 2) return

  // Find winner (highest total points)
  const winner = scores.reduce((a, b) => (a.total_points >= b.total_points ? a : b))

  await supabase
    .from('weekly_scores')
    .update({ week_winner: true })
    .eq('id', winner.id)
}

async function checkBadges(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  week: number,
  year: number
): Promise<string[]> {
  const newBadges: string[] = []

  // Get current weekly score
  const { data: weekScore } = await supabase
    .from('weekly_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('week_number', week)
    .eq('year', year)
    .single()

  if (!weekScore?.is_complete) return newBadges

  // Speed Demon: average answer time under 10s for a full week
  const { data: answers } = await supabase
    .from('answers')
    .select('time_taken_seconds')
    .eq('user_id', userId)
    .eq('week_number', week)

  if (answers && answers.length === 30) {
    const avgTime = answers.reduce((sum, a) => sum + a.time_taken_seconds, 0) / answers.length
    if (avgTime < 10) {
      await awardBadge(supabase, userId, 'speed_demon', newBadges)
    }
  }

  // Scholar: perfect score in any subject
  if (weekScore.maths_points === 30) await awardBadge(supabase, userId, 'scholar', newBadges)
  if (weekScore.vocab_points === 30) await awardBadge(supabase, userId, 'scholar', newBadges)
  if (weekScore.bible_points === 30) await awardBadge(supabase, userId, 'scholar', newBadges)

  // Update streak and check streak badges
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (streak) {
    const isConsecutive =
      streak.last_completed_week === null || streak.last_completed_week === week - 1

    const newStreak = isConsecutive ? streak.current_streak + 1 : 1
    const newLongest = Math.max(streak.longest_streak, newStreak)

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_week: week,
      })
      .eq('user_id', userId)

    if (newStreak >= 3) await awardBadge(supabase, userId, 'hot_streak', newBadges)
    if (newStreak >= 5) await awardBadge(supabase, userId, 'wave_rider', newBadges)
    if (newStreak >= 10) await awardBadge(supabase, userId, 'surf_champion', newBadges)
    if (newStreak >= 20) await awardBadge(supabase, userId, 'island_legend', newBadges)
  } else {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_completed_week: week,
    })
  }

  return newBadges
}

async function awardBadge(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  badgeKey: string,
  newBadges: string[]
) {
  const { error } = await supabase
    .from('badges')
    .insert({ user_id: userId, badge_key: badgeKey })
    .select()
    .single()

  if (!error) {
    newBadges.push(badgeKey)
  }
}
