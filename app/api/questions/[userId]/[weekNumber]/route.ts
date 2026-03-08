import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getWeekNumber } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string; weekNumber: string } }
) {
  const supabase = createServiceClient()
  const { year } = getWeekNumber()
  const weekNumber = parseInt(params.weekNumber)

  // Get all questions for this user/week
  const { data: questions, error } = await supabase
    .from('question_bank')
    .select('*')
    .eq('user_id', params.userId)
    .eq('week_number', weekNumber)
    .eq('year', year)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get already-answered question IDs
  const { data: answered } = await supabase
    .from('answers')
    .select('question_id')
    .eq('user_id', params.userId)
    .eq('week_number', weekNumber)

  const answeredIds = new Set((answered || []).map((a) => a.question_id))

  // Shuffle unanswered questions first, then answered ones
  const unanswered = (questions || []).filter((q) => !answeredIds.has(q.id))
  const answeredQuestions = (questions || []).filter((q) => answeredIds.has(q.id))

  // Shuffle unanswered
  for (let i = unanswered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[unanswered[i], unanswered[j]] = [unanswered[j], unanswered[i]]
  }

  return NextResponse.json({
    questions: [...unanswered, ...answeredQuestions],
    answeredIds: Array.from(answeredIds),
    totalQuestions: (questions || []).length,
    answeredCount: answeredIds.size,
  })
}
