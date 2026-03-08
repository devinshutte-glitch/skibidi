import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'
import { getWeekNumber } from '@/lib/utils'
import type { Subject } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface GeneratedQuestion {
  question_text: string
  options: string[] | null
  correct_answer: string
  explanation: string
}

async function generateQuestionsForUser(
  userId: string,
  userName: string,
  age: number,
  subject: Subject,
  weekNumber: number,
  year: number,
  previousQuestions: string[]
): Promise<GeneratedQuestion[]> {
  const subjectPrompts: Record<Subject, string> = {
    maths: age >= 13
      ? `Grade 7/8 level Maths (SA CAPS curriculum) for a 13-year-old. Topics: fractions, decimals, percentages, algebra basics, geometry, ratios, integers. All questions mentally calculable — no calculator. Multiple choice with 4 options.`
      : `Grade 4/5 level Maths (SA CAPS curriculum) for a 10-year-old. Topics: multiplication, division, fractions, basic measurements, place value, simple word problems. All questions mentally calculable — no calculator. Multiple choice with 4 options.`,
    vocab: age >= 13
      ? `Advanced English Vocabulary for a 13-year-old. Mix of multiple choice (word meaning, synonym/antonym) and typed answers (spell the word, complete the sentence). Use rich vocabulary appropriate for Grade 7/8.`
      : `Foundational English Vocabulary for a 10-year-old. Mix of multiple choice (word meaning, synonym/antonym) and simple typed answers. Use vocabulary appropriate for Grade 4/5.`,
    bible: age >= 13
      ? `Bible (NIV translation) questions for a 13-year-old. Cover Old & New Testament. Include deeper theology, cross-referencing, and narrative understanding. Multiple choice with 4 options.`
      : `Bible (NIV translation) questions for a 10-year-old. Cover Sunday School-level Old & New Testament stories. Focus on key characters, events, and simple moral lessons. Multiple choice with 4 options.`,
  }

  const previousQuestionsText = previousQuestions.length > 0
    ? `\n\nDO NOT repeat any of these previously asked questions:\n${previousQuestions.slice(-50).join('\n')}`
    : ''

  const isTypedAnswer = subject === 'vocab'

  const prompt = `Generate exactly 10 quiz questions for ${userName} (age ${age}).

Subject: ${subjectPrompts[subject]}

Requirements:
- Each question must be clearly worded and unambiguous
- ${subject === 'vocab' ? 'For multiple choice questions: provide exactly 4 options. For typed answer questions (spelling, fill-in-blank): set options to null and correct_answer to the expected word/phrase' : 'Provide exactly 4 options for each multiple choice question'}
- The correct_answer must exactly match one of the options (for MC) or be the expected typed response
- Include a brief, educational explanation (1-2 sentences) for each answer
- Questions must be appropriate for the age group
- Use NIV Bible translation for all scripture references
- Week ${weekNumber} of ${year} — ensure variety and freshness${previousQuestionsText}

Respond with a JSON array of exactly 10 objects. Each object must have:
{
  "question_text": "The question",
  "options": ["A", "B", "C", "D"] or null for typed answers,
  "correct_answer": "The correct answer",
  "explanation": "Brief explanation"
}

Return ONLY the JSON array, no other text.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  const jsonMatch = content.text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in Claude response')

  return JSON.parse(jsonMatch[0]) as GeneratedQuestion[]
}

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { week, year } = getWeekNumber()

  try {
    // Get all child users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'child')

    if (usersError) throw usersError

    const results = []

    for (const user of users || []) {
      // Check if questions already generated for this week
      const { data: existing } = await supabase
        .from('question_bank')
        .select('id')
        .eq('user_id', user.id)
        .eq('week_number', week)
        .eq('year', year)
        .limit(1)

      if (existing && existing.length > 0) {
        results.push({ userId: user.id, status: 'already_generated' })
        continue
      }

      // Get previous questions to avoid repetition
      const { data: prevQuestions } = await supabase
        .from('question_bank')
        .select('question_text')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      const previousQText = (prevQuestions || []).map((q) => q.question_text)

      const subjects: Subject[] = ['maths', 'vocab', 'bible']
      const allQuestions = []

      for (const subject of subjects) {
        const questions = await generateQuestionsForUser(
          user.id,
          user.name,
          user.age || 10,
          subject,
          week,
          year,
          previousQText
        )

        for (const q of questions) {
          allQuestions.push({
            week_number: week,
            year,
            user_id: user.id,
            subject,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            difficulty: 'medium',
          })
        }
      }

      const { error: insertError } = await supabase
        .from('question_bank')
        .insert(allQuestions)

      if (insertError) throw insertError

      results.push({ userId: user.id, questionsGenerated: allQuestions.length })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// Also allow GET for manual trigger with secret
export async function GET(req: NextRequest) {
  return POST(req)
}
