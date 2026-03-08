export function getWeekNumber(date: Date = new Date()): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return {
    week: Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7),
    year: d.getUTCFullYear(),
  }
}

export function calculatePoints(isCorrect: boolean, timeTaken: number): number {
  if (!isCorrect) return 0
  if (timeTaken < 10) return 3
  if (timeTaken < 20) return 2
  return 1
}

export function getSubjectLabel(subject: string): string {
  switch (subject) {
    case 'maths': return 'Maths'
    case 'vocab': return 'English Vocabulary'
    case 'bible': return 'Bible (NIV)'
    default: return subject
  }
}

export function getSubjectEmoji(subject: string): string {
  switch (subject) {
    case 'maths': return '🧮'
    case 'vocab': return '📚'
    case 'bible': return '✝️'
    default: return '❓'
  }
}

export function getSubjectColor(subject: string): string {
  switch (subject) {
    case 'maths': return 'from-blue-500 to-indigo-600'
    case 'vocab': return 'from-purple-500 to-pink-600'
    case 'bible': return 'from-amber-500 to-yellow-600'
    default: return 'from-gray-500 to-gray-600'
  }
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
