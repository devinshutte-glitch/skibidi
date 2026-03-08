'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import OceanBackground from '@/components/OceanBackground'
import { getWeekNumber, getSubjectEmoji, getSubjectLabel } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'
import Confetti from '@/components/Confetti'

interface QuizQuestion extends Question {
  alreadyAnswered?: boolean
}

interface FeedbackState {
  isCorrect: boolean
  pointsEarned: number
  correctAnswer: string
  explanation: string
  newBadges: string[]
}

const TIMER_SECONDS = 30

export default function QuizPage() {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const { week } = getWeekNumber()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [weeklyScore, setWeeklyScore] = useState(0)
  const [noQuestions, setNoQuestions] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!isLoading && !currentUser) router.replace('/')
  }, [currentUser, isLoading, router])

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/questions/${currentUser.id}/${week}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.questions && d.questions.length > 0) {
          const unanswered = d.questions.filter((q: QuizQuestion) => !d.answeredIds.includes(q.id))
          if (unanswered.length === 0) {
            setQuizComplete(true)
          } else {
            setQuestions(unanswered)
            setAnsweredIds(new Set(d.answeredIds))
            setWeeklyScore(0)
          }
        } else {
          setNoQuestions(true)
        }
      })
  }, [currentUser, week])

  const currentQuestion = questions[currentIdx]
  const isTypedQuestion = currentQuestion?.options === null || !currentQuestion?.options?.length

  // Timer
  useEffect(() => {
    if (!currentQuestion || feedback || isSubmitting) return
    setTimeLeft(TIMER_SECONDS)
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIdx, currentQuestion, feedback])

  const handleTimeout = useCallback(() => {
    if (feedback || !currentQuestion) return
    submitAnswer(currentQuestion.correct_answer.slice(0, 0)) // submit empty = wrong
  }, [feedback, currentQuestion])

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (isSubmitting || feedback || !currentQuestion || !currentUser) return
      setIsSubmitting(true)

      if (timerRef.current) clearInterval(timerRef.current)
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)

      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          questionId: currentQuestion.id,
          answerGiven: answer || '__timeout__',
          timeTaken: Math.min(timeTaken, TIMER_SECONDS),
        }),
      })

      const data = await res.json()
      setFeedback(data)
      setWeeklyScore((s) => s + (data.pointsEarned || 0))

      if (data.isCorrect) setShowConfetti(true)

      setIsSubmitting(false)
    },
    [isSubmitting, feedback, currentQuestion, currentUser]
  )

  const handleOptionClick = (option: string) => {
    if (feedback || isSubmitting) return
    setSelectedAnswer(option)
    submitAnswer(option)
  }

  const handleTypedSubmit = () => {
    if (feedback || isSubmitting || !typedAnswer.trim()) return
    submitAnswer(typedAnswer.trim())
  }

  const handleNext = () => {
    setFeedback(null)
    setSelectedAnswer(null)
    setTypedAnswer('')
    setShowConfetti(false)

    const nextIdx = currentIdx + 1
    if (nextIdx >= questions.length) {
      // Check if all 30 done
      fetch(`/api/questions/${currentUser!.id}/${week}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.answeredCount >= 30 || d.answeredCount >= d.totalQuestions) {
            setQuizComplete(true)
            setShowConfetti(true)
          } else {
            // Reload remaining
            const remaining = d.questions.filter((q: QuizQuestion) => !d.answeredIds.includes(q.id))
            setQuestions(remaining)
            setCurrentIdx(0)
          }
        })
    } else {
      setCurrentIdx(nextIdx)
    }
  }

  const timerPercent = (timeLeft / TIMER_SECONDS) * 100
  const timerColor = timeLeft > 15 ? '#22c55e' : timeLeft > 8 ? '#f59e0b' : '#ef4444'

  if (isLoading || !currentUser) return null

  if (noQuestions) {
    return (
      <OceanBackground>
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-6">
          <div className="text-6xl animate-wave">🌊</div>
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-white font-black text-2xl mb-3">No questions yet!</h2>
            <p className="text-white/80">
              Questions are generated every Monday. Check back at the start of the week! 🏄
            </p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="bg-white text-ocean-600 font-black py-3 px-8 rounded-2xl"
          >
            Go Home
          </button>
        </div>
      </OceanBackground>
    )
  }

  if (quizComplete) {
    return (
      <OceanBackground>
        {showConfetti && <Confetti />}
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center gap-6 page-transition">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-8xl"
          >
            🏆
          </motion.div>
          <div className="glass-card rounded-3xl p-8 w-full">
            <h2 className="text-white font-black text-3xl mb-2">Week Complete!</h2>
            <p className="text-white/80 text-lg mb-6">
              Amazing effort, {currentUser.name}! 🤙
            </p>
            <div className="bg-white/20 rounded-2xl p-4 mb-4">
              <p className="text-white/70 text-sm font-semibold">This session</p>
              <p className="text-white font-black text-4xl">+{weeklyScore} pts</p>
            </div>
            <p className="text-white/60 text-sm">
              Check the leaderboard to see how you&apos;re doing! 🌊
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => router.push('/leaderboard')}
              className="flex-1 bg-white/20 text-white font-bold py-3 rounded-2xl border border-white/30"
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => router.push('/home')}
              className="flex-1 bg-white text-ocean-600 font-black py-3 rounded-2xl"
            >
              Home 🏠
            </button>
          </div>
        </div>
      </OceanBackground>
    )
  }

  if (!currentQuestion) {
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
      {showConfetti && <Confetti />}
      <div className="min-h-dvh flex flex-col pb-6 page-transition">
        {/* Header */}
        <div className="px-5 pt-10 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.push('/home')} className="text-white/70 hover:text-white">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{getSubjectEmoji(currentQuestion.subject)}</span>
              <span className="text-white font-bold text-sm">{getSubjectLabel(currentQuestion.subject)}</span>
            </div>
            <div className="text-white/70 font-bold text-sm">
              {currentIdx + 1} / {questions.length}
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer ring */}
        <div className="flex justify-center py-2">
          <div className="relative w-20 h-20">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={timerColor}
                strokeWidth="6"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 * (1 - timerPercent / 100)}
                strokeLinecap="round"
                className="countdown-ring"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-black text-xl">{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              {/* Question text */}
              <div className="glass-card rounded-3xl p-5 mb-5">
                <p className="text-white font-bold text-lg leading-snug text-center">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Answer options */}
              {!isTypedQuestion ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options?.map((option, i) => {
                    const label = ['A', 'B', 'C', 'D'][i]
                    const isSelected = selectedAnswer === option
                    const isCorrectAnswer = feedback && option === feedback.correctAnswer
                    const isWrongSelected = feedback && isSelected && !feedback.isCorrect

                    return (
                      <motion.button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={!!feedback || isSubmitting}
                        whileTap={{ scale: feedback ? 1 : 0.97 }}
                        className={`
                          w-full py-4 px-5 rounded-2xl flex items-center gap-3 font-bold text-left
                          transition-all duration-200 min-h-[56px]
                          ${isCorrectAnswer
                            ? 'bg-green-400 text-white shadow-lg scale-105'
                            : isWrongSelected
                            ? 'bg-red-400 text-white animate-shake'
                            : feedback
                            ? 'bg-white/10 text-white/50'
                            : 'bg-white/90 text-gray-800 hover:bg-white active:scale-95'
                          }
                        `}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0
                            ${isCorrectAnswer ? 'bg-white text-green-600'
                              : isWrongSelected ? 'bg-white text-red-600'
                              : feedback ? 'bg-white/20 text-white/50'
                              : 'bg-ocean-100 text-ocean-700'
                            }`}
                        >
                          {isCorrectAnswer ? '✓' : isWrongSelected ? '✗' : label}
                        </span>
                        {option}
                      </motion.button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTypedSubmit()}
                    disabled={!!feedback || isSubmitting}
                    placeholder="Type your answer..."
                    className="w-full py-4 px-5 rounded-2xl bg-white/90 text-gray-800 font-bold text-lg
                      placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    autoFocus
                  />
                  {!feedback && (
                    <button
                      onClick={handleTypedSubmit}
                      disabled={!typedAnswer.trim() || isSubmitting}
                      className="w-full py-4 bg-white text-ocean-600 font-black rounded-2xl
                        disabled:opacity-50 active:scale-95 transition-all"
                    >
                      Submit Answer 🤙
                    </button>
                  )}
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-2xl p-4 ${
                      feedback.isCorrect ? 'bg-green-500/80' : 'bg-red-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-black text-lg">
                        {feedback.isCorrect ? '🎉 Correct!' : '😬 Not quite'}
                      </p>
                      {feedback.pointsEarned > 0 && (
                        <span className="bg-white/20 text-white font-black px-3 py-1 rounded-full text-sm">
                          +{feedback.pointsEarned} pts
                        </span>
                      )}
                    </div>
                    {!feedback.isCorrect && (
                      <p className="text-white/90 text-sm mb-1">
                        <strong>Correct:</strong> {feedback.correctAnswer}
                      </p>
                    )}
                    <p className="text-white/80 text-sm">{feedback.explanation}</p>
                    {feedback.newBadges?.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {feedback.newBadges.map((b) => (
                          <span key={b} className="bg-yellow-400/80 text-yellow-900 font-bold px-3 py-1 rounded-full text-xs">
                            🏅 New badge: {b.replace(/_/g, ' ')}!
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleNext}
                      className="w-full mt-3 bg-white text-ocean-700 font-black py-3 rounded-xl active:scale-95 transition-all"
                    >
                      Next Question →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </OceanBackground>
  )
}
