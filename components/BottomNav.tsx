'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/quiz', label: 'Quiz', icon: QuizIcon },
  { href: '/leaderboard', label: 'Scores', icon: LeaderboardIcon },
  { href: '/profile', label: 'Profile', icon: ProfileIcon },
]

const parentNavItems = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
]

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function QuizIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 9.5C9 8.12 10.12 7 11.5 7C12.88 7 14 8.12 14 9.5C14 10.88 12 11.5 12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

function LeaderboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="14" width="5" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="9.5" y="9" width="5" height="13" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="5" width="5" height="17" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()
  const { currentUser } = useAuth()

  const items = currentUser?.role === 'parent' ? parentNavItems : navItems

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      <div
        className="glass-card-white rounded-t-2xl shadow-lg px-2 safe-bottom"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-around pt-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-ocean-600 bg-ocean-50'
                    : 'text-gray-400 hover:text-ocean-500'
                }`}
              >
                <Icon />
                <span className="text-xs font-bold">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
