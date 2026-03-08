export type UserRole = 'child' | 'parent'
export type Subject = 'maths' | 'vocab' | 'bible'

export interface User {
  id: string
  name: string
  role: UserRole
  avatar: string
  age: number | null
  colour_theme: string
  created_at: string
}

export interface Question {
  id: string
  week_number: number
  year: number
  user_id: string
  subject: Subject
  question_text: string
  options: string[] | null
  correct_answer: string
  explanation: string
  difficulty: string
  created_at: string
}

export interface Answer {
  id: string
  user_id: string
  question_id: string
  week_number: number
  answer_given: string
  is_correct: boolean
  time_taken_seconds: number
  points_earned: number
  answered_at: string
}

export interface WeeklyScore {
  id: string
  user_id: string
  week_number: number
  year: number
  total_points: number
  maths_points: number
  vocab_points: number
  bible_points: number
  questions_completed: number
  is_complete: boolean
  week_winner: boolean
}

export interface Badge {
  id: string
  user_id: string
  badge_key: string
  earned_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_week: number | null
}

export interface BadgeDefinition {
  key: string
  name: string
  description: string
  emoji: string
  color: string
}

export const BADGE_DEFINITIONS: Record<string, BadgeDefinition> = {
  hot_streak: {
    key: 'hot_streak',
    name: 'Hot Streak',
    description: '3 consecutive weeks completed',
    emoji: '🔥',
    color: 'from-orange-400 to-red-500',
  },
  wave_rider: {
    key: 'wave_rider',
    name: 'Wave Rider',
    description: '5 consecutive weeks completed',
    emoji: '🌊',
    color: 'from-blue-400 to-cyan-500',
  },
  surf_champion: {
    key: 'surf_champion',
    name: 'Surf Champion',
    description: '10 consecutive weeks completed',
    emoji: '🏄',
    color: 'from-teal-400 to-emerald-500',
  },
  island_legend: {
    key: 'island_legend',
    name: 'Island Legend',
    description: '20 consecutive weeks completed',
    emoji: '🌴',
    color: 'from-green-400 to-teal-600',
  },
  speed_demon: {
    key: 'speed_demon',
    name: 'Speed Demon',
    description: 'Average answer time under 10s for a full week',
    emoji: '⚡',
    color: 'from-yellow-400 to-orange-500',
  },
  scholar: {
    key: 'scholar',
    name: 'Scholar',
    description: 'Perfect score in any one subject for a week',
    emoji: '📚',
    color: 'from-purple-400 to-indigo-500',
  },
  maths_master: {
    key: 'maths_master',
    name: 'Maths Master',
    description: 'Highest cumulative maths score',
    emoji: '🧮',
    color: 'from-blue-500 to-indigo-600',
  },
  word_wizard: {
    key: 'word_wizard',
    name: 'Word Wizard',
    description: 'Highest cumulative vocabulary score',
    emoji: '📚',
    color: 'from-purple-500 to-pink-600',
  },
  bible_scholar: {
    key: 'bible_scholar',
    name: 'Bible Scholar',
    description: 'Highest cumulative Bible score',
    emoji: '✝️',
    color: 'from-amber-500 to-yellow-600',
  },
}

export interface QuizSession {
  userId: string
  weekNumber: number
  currentQuestionIndex: number
  answers: Record<string, { answer: string; timeTaken: number; isCorrect: boolean; points: number }>
}

export interface LeaderboardEntry {
  userId: string
  name: string
  avatar: string
  colourTheme: string
  totalPoints: number
  weeklyPoints: number
  weekWins: number
  currentStreak: number
}
